import { useLegalData } from '@/contexts/LegalDataContext';
import { Calendar as CalendarIcon, Clock, Plus, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import Colors from '@/constants/colors';
import { Deadline } from '@/types';

export default function CalendarScreen() {
  const { cases, loading, getClientById, updateCase, deleteDeadline } = useLegalData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [selectedCase, setSelectedCase] = useState('');

  const allDeadlines = useMemo(() => {
    const deadlines: (Deadline & { caseName: string; clientName: string })[] = [];
    cases.forEach(c => {
      c.deadlines.forEach(d => {
        const client = getClientById(c.clientId);
        deadlines.push({
          ...d,
          caseName: c.title,
          clientName: client?.name || 'Cliente desconhecido',
        });
      });
    });
    return deadlines.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [cases, getClientById]);

  const upcomingDeadlines = allDeadlines.filter(d => !d.completed);
  const overdueDeadlines = upcomingDeadlines.filter(
    d => new Date(d.date) < new Date()
  );

  const isOverdue = (date: string) => {
    return new Date(date) < new Date();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    } else {
      return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const handleAddEvent = () => {
    if (!newEventTitle.trim() || !newEventDate || !selectedCase) return;

    const selectedCaseData = cases.find(c => c.id === selectedCase);
    if (!selectedCaseData) return;

    const dateTimeString = `${newEventDate}T${newEventTime || '09:00'}`;
    
    const newDeadline = {
      id: Date.now().toString(),
      title: newEventTitle,
      date: dateTimeString,
      caseId: selectedCase,
      completed: false,
    };

    updateCase(selectedCase, {
      deadlines: [...selectedCaseData.deadlines, newDeadline],
    });

    setShowAddModal(false);
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventTime('');
    setSelectedCase('');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.overdueCard]}>
          <Text style={[styles.statValue, { color: Colors.error }]}>
            {overdueDeadlines.length}
          </Text>
          <Text style={styles.statLabel}>Atrasados</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{upcomingDeadlines.length}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color={Colors.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Próximos Prazos</Text>

        {upcomingDeadlines.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <CalendarIcon size={64} color={Colors.primary} />
            </View>
            <Text style={styles.emptyStateText}>Sem prazos pendentes</Text>
            <Text style={styles.emptyStateSubtext}>
              Todos os prazos estão em dia!
            </Text>
          </View>
        ) : (
          <View style={styles.deadlinesList}>
            {upcomingDeadlines.map(deadline => (
              <View
                key={deadline.id}
                style={[
                  styles.deadlineCard,
                  isOverdue(deadline.date) && styles.overdueDeadlineCard,
                ]}
              >
                <View style={styles.deadlineContent}>
                  <View style={styles.deadlineHeader}>
                    <View style={styles.deadlineDate}>
                      <CalendarIcon
                        size={18}
                        color={isOverdue(deadline.date) ? Colors.error : Colors.primary}
                      />
                      <Text
                        style={[
                          styles.deadlineDateText,
                          isOverdue(deadline.date) && { color: Colors.error },
                        ]}
                      >
                        {formatDate(deadline.date)}
                      </Text>
                    </View>
                    <View style={styles.deadlineTime}>
                      <Clock
                        size={14}
                        color={isOverdue(deadline.date) ? Colors.error : Colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.deadlineTimeText,
                          isOverdue(deadline.date) && { color: Colors.error },
                        ]}
                      >
                        {formatTime(deadline.date)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.deadlineTitle}>{deadline.title}</Text>
                  <View style={styles.deadlineFooter}>
                    <Text style={styles.deadlineCaseName}>{deadline.caseName}</Text>
                    <Text style={styles.deadlineClientName}>{deadline.clientName}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteDeadlineButton}
                  onPress={() => deleteDeadline(deadline.caseId, deadline.id)}
                >
                  <Trash2 size={18} color={Colors.error} />
                </TouchableOpacity>
                {isOverdue(deadline.date) && (
                  <View style={styles.overdueTag}>
                    <Text style={styles.overdueText}>ATRASADO</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agendar Evento</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Título do evento"
              placeholderTextColor={Colors.textTertiary}
              value={newEventTitle}
              onChangeText={setNewEventTitle}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Data (AAAA-MM-DD)"
              placeholderTextColor={Colors.textTertiary}
              value={newEventDate}
              onChangeText={setNewEventDate}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Hora (HH:MM)"
              placeholderTextColor={Colors.textTertiary}
              value={newEventTime}
              onChangeText={setNewEventTime}
            />
            
            <View style={styles.casesPickerContainer}>
              <Text style={styles.casesPickerLabel}>Selecionar Caso:</Text>
              <ScrollView style={styles.casesPicker} showsVerticalScrollIndicator={false}>
                {cases.map(caseItem => (
                  <TouchableOpacity
                    key={caseItem.id}
                    style={[
                      styles.caseOption,
                      selectedCase === caseItem.id && styles.caseOptionSelected,
                    ]}
                    onPress={() => setSelectedCase(caseItem.id)}
                  >
                    <Text
                      style={[
                        styles.caseOptionText,
                        selectedCase === caseItem.id && styles.caseOptionTextSelected,
                      ]}
                    >
                      {caseItem.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewEventTitle('');
                  setNewEventDate('');
                  setNewEventTime('');
                  setSelectedCase('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleAddEvent}
              >
                <Text style={styles.modalButtonTextConfirm}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.background,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row' as const,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  overdueCard: {
    backgroundColor: `${Colors.error}08`,
    borderColor: `${Colors.error}30`,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  deadlinesList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 24,
  },
  deadlineCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row' as const,
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  deadlineContent: {
    flex: 1,
  },
  overdueDeadlineCard: {
    backgroundColor: `${Colors.error}08`,
    borderColor: Colors.error,
  },
  deadlineHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  deadlineDate: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  deadlineDateText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  deadlineTime: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  deadlineTimeText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  deadlineTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  deadlineFooter: {
    gap: 4,
  },
  deadlineCaseName: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  deadlineClientName: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  overdueTag: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  overdueText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.surface,
  },
  deleteDeadlineButton: {
    backgroundColor: `${Colors.error}10`,
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  emptyState: {
    alignItems: 'center' as const,
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  casesPickerContainer: {
    marginBottom: 20,
  },
  casesPickerLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  casesPicker: {
    maxHeight: 150,
  },
  caseOption: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  caseOptionSelected: {
    backgroundColor: `${Colors.primary}15`,
    borderColor: Colors.primary,
  },
  caseOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  caseOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  modalButtons: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  modalButtonCancel: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalButtonConfirm: {
    backgroundColor: Colors.primary,
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.surface,
  },
});
