import { useLegalData } from '@/contexts/LegalDataContext';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  Mail,
  Phone,
  Plus,
  Trash2,
  User,
} from 'lucide-react-native';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { useState } from 'react';
import Colors from '@/constants/colors';
import { Case, Expense, Fee } from '@/types';

export default function CaseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCaseById, getClientById, deleteCase, expenses, fees, addExpense, addFee, updateFee, deleteExpense, deleteFee } = useLegalData();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Custas');
  const [feeDescription, setFeeDescription] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [feeHours, setFeeHours] = useState('');

  const caseData = getCaseById(id || '');
  const client = caseData ? getClientById(caseData.clientId) : null;

  if (!caseData || !client) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const getPriorityColor = (priority: Case['priority']) => {
    switch (priority) {
      case 'high':
        return Colors.priorityHigh;
      case 'medium':
        return Colors.priorityMedium;
      case 'low':
        return Colors.priorityLow;
    }
  };

  const getStatusColor = (status: Case['status']) => {
    switch (status) {
      case 'active':
        return Colors.statusActive;
      case 'pending':
        return Colors.statusPending;
      case 'closed':
        return Colors.statusClosed;
    }
  };

  const getStatusLabel = (status: Case['status']) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'pending':
        return 'Pendente';
      case 'closed':
        return 'Encerrado';
    }
  };

  const getPriorityLabel = (priority: Case['priority']) => {
    switch (priority) {
      case 'high':
        return 'Alta Prioridade';
      case 'medium':
        return 'Média Prioridade';
      case 'low':
        return 'Baixa Prioridade';
    }
  };

  const caseExpenses = expenses.filter(e => e.caseId === id);
  const caseFees = fees.filter(f => f.caseId === id);
  
  const totalExpenses = caseExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalFees = caseFees.reduce((sum, f) => sum + f.amount, 0);
  const paidFees = caseFees.filter(f => f.isPaid).reduce((sum, f) => sum + f.amount, 0);

  const handleAddExpense = () => {
    if (!expenseDescription.trim() || !expenseAmount) return;
    
    const newExpense: Expense = {
      id: Date.now().toString(),
      caseId: id || '',
      description: expenseDescription,
      amount: parseFloat(expenseAmount),
      category: expenseCategory,
      date: new Date().toISOString(),
    };
    
    addExpense(newExpense);
    setShowExpenseModal(false);
    setExpenseDescription('');
    setExpenseAmount('');
    setExpenseCategory('Custas');
  };

  const handleAddFee = () => {
    if (!feeDescription.trim() || !feeAmount) return;
    
    const newFee: Fee = {
      id: Date.now().toString(),
      caseId: id || '',
      description: feeDescription,
      amount: parseFloat(feeAmount),
      hours: feeHours ? parseFloat(feeHours) : undefined,
      hourlyRate: feeHours ? parseFloat(feeAmount) / parseFloat(feeHours) : undefined,
      date: new Date().toISOString(),
      isPaid: false,
    };
    
    addFee(newFee);
    setShowFeeModal(false);
    setFeeDescription('');
    setFeeAmount('');
    setFeeHours('');
  };

  const handleDeleteCase = () => {
    Alert.alert(
      'Eliminar Caso',
      'Tem a certeza que pretende eliminar este caso? Esta ação não pode ser revertida.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteCase(caseData.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: caseData.caseNumber,
          headerRight: () => (
            <TouchableOpacity onPress={handleDeleteCase} style={styles.deleteButton}>
              <Trash2 size={20} color={Colors.error} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(caseData.status)}15` },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor(caseData.status) }]}>
                {getStatusLabel(caseData.status)}
              </Text>
            </View>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: `${getPriorityColor(caseData.priority)}15` },
              ]}
            >
              <AlertCircle size={14} color={getPriorityColor(caseData.priority)} />
              <Text
                style={[styles.priorityText, { color: getPriorityColor(caseData.priority) }]}
              >
                {getPriorityLabel(caseData.priority)}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{caseData.title}</Text>
          <Text style={styles.description}>{caseData.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informação do Cliente</Text>
          <View style={styles.clientCard}>
            <View style={styles.clientHeader}>
              <View style={styles.clientAvatar}>
                <User size={24} color={Colors.surface} />
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{client.name}</Text>
                {client.company && <Text style={styles.clientCompany}>{client.company}</Text>}
              </View>
            </View>
            <View style={styles.contactsContainer}>
              <View style={styles.contactItem}>
                <Mail size={16} color={Colors.textSecondary} />
                <Text style={styles.contactText}>{client.email}</Text>
              </View>
              <View style={styles.contactItem}>
                <Phone size={16} color={Colors.textSecondary} />
                <Text style={styles.contactText}>{client.phone}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes do Processo</Text>
          <View style={styles.detailsCard}>
            {caseData.courtName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tribunal:</Text>
                <Text style={styles.detailValue}>{caseData.courtName}</Text>
              </View>
            )}
            {caseData.judge && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Juiz:</Text>
                <Text style={styles.detailValue}>{caseData.judge}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Data de Abertura:</Text>
              <Text style={styles.detailValue}>
                {new Date(caseData.openedAt).toLocaleDateString('pt-PT')}
              </Text>
            </View>
            {caseData.closedAt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Data de Encerramento:</Text>
                <Text style={styles.detailValue}>
                  {new Date(caseData.closedAt).toLocaleDateString('pt-PT')}
                </Text>
              </View>
            )}
            {caseData.nextHearing && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Próxima Audiência:</Text>
                <Text style={[styles.detailValue, { color: Colors.primary, fontWeight: '600' as const }]}>
                  {new Date(caseData.nextHearing).toLocaleDateString('pt-PT', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            )}
          </View>
        </View>

        {caseData.deadlines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prazos ({caseData.deadlines.length})</Text>
            <View style={styles.deadlinesList}>
              {caseData.deadlines.map(deadline => {
                const isOverdue = new Date(deadline.date) < new Date() && !deadline.completed;
                return (
                  <View
                    key={deadline.id}
                    style={[styles.deadlineItem, isOverdue && styles.overdueDeadline]}
                  >
                    <View style={styles.deadlineIcon}>
                      {deadline.completed ? (
                        <View
                          style={[styles.completedCheckmark, { backgroundColor: Colors.success }]}
                        >
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      ) : (
                        <Clock
                          size={18}
                          color={isOverdue ? Colors.error : Colors.textSecondary}
                        />
                      )}
                    </View>
                    <View style={styles.deadlineContent}>
                      <Text style={[styles.deadlineTitle, deadline.completed && styles.completedText]}>
                        {deadline.title}
                      </Text>
                      <View style={styles.deadlineDate}>
                        <Calendar
                          size={12}
                          color={isOverdue ? Colors.error : Colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.deadlineDateText,
                            isOverdue && { color: Colors.error, fontWeight: '600' as const },
                          ]}
                        >
                          {new Date(deadline.date).toLocaleDateString('pt-PT')}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {caseData.documents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documentos ({caseData.documents.length})</Text>
            <View style={styles.documentsList}>
              {caseData.documents.map(doc => (
                <TouchableOpacity key={doc.id} style={styles.documentItem}>
                  <View style={styles.documentIcon}>
                    <FileText size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.documentContent}>
                    <Text style={styles.documentName}>{doc.name}</Text>
                    <Text style={styles.documentMeta}>
                      {doc.size ? `${Math.round(doc.size / 1024)} KB • ` : ''}
                      {new Date(doc.uploadedAt).toLocaleDateString('pt-PT')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Despesas ({caseExpenses.length})</Text>
            <TouchableOpacity
              style={styles.addSectionButton}
              onPress={() => setShowExpenseModal(true)}
            >
              <Plus size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {caseExpenses.length > 0 ? (
            <View style={styles.financialCard}>
              <View style={styles.financialTotal}>
                <Text style={styles.financialTotalLabel}>Total de Despesas:</Text>
                <Text style={styles.financialTotalValue}>€{totalExpenses.toFixed(2)}</Text>
              </View>
              <View style={styles.financialList}>
                {caseExpenses.map(expense => (
                  <View key={expense.id} style={styles.financialItem}>
                    <View style={styles.financialItemContent}>
                      <Text style={styles.financialItemTitle}>{expense.description}</Text>
                      <Text style={styles.financialItemMeta}>
                        {expense.category} • {new Date(expense.date).toLocaleDateString('pt-PT')}
                      </Text>
                    </View>
                    <View style={styles.financialItemRight}>
                      <Text style={styles.financialItemAmount}>€{expense.amount.toFixed(2)}</Text>
                      <TouchableOpacity onPress={() => deleteExpense(expense.id)}>
                        <Text style={styles.financialItemDelete}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.emptyText}>Sem despesas registadas</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Honorários ({caseFees.length})</Text>
            <TouchableOpacity
              style={styles.addSectionButton}
              onPress={() => setShowFeeModal(true)}
            >
              <Plus size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {caseFees.length > 0 ? (
            <View style={styles.financialCard}>
              <View style={styles.feeTotals}>
                <View style={styles.financialTotal}>
                  <Text style={styles.financialTotalLabel}>Total de Honorários:</Text>
                  <Text style={styles.financialTotalValue}>€{totalFees.toFixed(2)}</Text>
                </View>
                <View style={styles.financialTotal}>
                  <Text style={styles.financialTotalLabel}>Pagos:</Text>
                  <Text style={[styles.financialTotalValue, { color: Colors.success }]}>
                    €{paidFees.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={styles.financialList}>
                {caseFees.map(fee => (
                  <View key={fee.id} style={styles.financialItem}>
                    <View style={styles.financialItemContent}>
                      <Text style={styles.financialItemTitle}>{fee.description}</Text>
                      <Text style={styles.financialItemMeta}>
                        {fee.hours ? `${fee.hours}h • ` : ''}
                        {new Date(fee.date).toLocaleDateString('pt-PT')}
                      </Text>
                    </View>
                    <View style={styles.financialItemRight}>
                      <Text style={styles.financialItemAmount}>€{fee.amount.toFixed(2)}</Text>
                      <View style={styles.feeActions}>
                        <TouchableOpacity
                          onPress={() => updateFee(fee.id, { isPaid: !fee.isPaid, paidAt: !fee.isPaid ? new Date().toISOString() : undefined })}
                          style={styles.paidButton}
                        >
                          <Text style={[styles.paidButtonText, fee.isPaid && styles.paidButtonTextActive]}>
                            {fee.isPaid ? 'Pago' : 'Pagar'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteFee(fee.id)}>
                          <Text style={styles.financialItemDelete}>Eliminar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.emptyText}>Sem honorários registados</Text>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showExpenseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExpenseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Despesa</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Descrição"
              placeholderTextColor={Colors.textTertiary}
              value={expenseDescription}
              onChangeText={setExpenseDescription}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Valor (€)"
              placeholderTextColor={Colors.textTertiary}
              value={expenseAmount}
              onChangeText={setExpenseAmount}
              keyboardType="decimal-pad"
            />
            <View style={styles.categorySelector}>
              {['Custas', 'Transporte', 'Documentação', 'Perícias', 'Outros'].map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    expenseCategory === cat && styles.categoryOptionSelected,
                  ]}
                  onPress={() => setExpenseCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      expenseCategory === cat && styles.categoryOptionTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowExpenseModal(false);
                  setExpenseDescription('');
                  setExpenseAmount('');
                  setExpenseCategory('Custas');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleAddExpense}
              >
                <Text style={styles.modalButtonTextConfirm}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showFeeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFeeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Honorário</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Descrição"
              placeholderTextColor={Colors.textTertiary}
              value={feeDescription}
              onChangeText={setFeeDescription}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Valor (€)"
              placeholderTextColor={Colors.textTertiary}
              value={feeAmount}
              onChangeText={setFeeAmount}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Horas (opcional)"
              placeholderTextColor={Colors.textTertiary}
              value={feeHours}
              onChangeText={setFeeHours}
              keyboardType="decimal-pad"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowFeeModal(false);
                  setFeeDescription('');
                  setFeeAmount('');
                  setFeeHours('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleAddFee}
              >
                <Text style={styles.modalButtonTextConfirm}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.background,
  },
  deleteButton: {
    padding: 8,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusRow: {
    flexDirection: 'row' as const,
    gap: 8,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  priorityBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  clientCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clientHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 12,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  clientCompany: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  contactsContainer: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
    flex: 1,
    textAlign: 'right' as const,
  },
  deadlinesList: {
    gap: 12,
  },
  deadlineItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row' as const,
    gap: 12,
  },
  overdueDeadline: {
    backgroundColor: `${Colors.error}08`,
    borderColor: Colors.error,
  },
  deadlineIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  completedCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  checkmarkText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  deadlineContent: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through' as const,
    color: Colors.textTertiary,
  },
  deadlineDate: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  deadlineDateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  documentsList: {
    gap: 12,
  },
  documentItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row' as const,
    gap: 12,
    alignItems: 'center' as const,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  documentContent: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  documentMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  addSectionButton: {
    backgroundColor: `${Colors.primary}15`,
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  financialCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  financialTotal: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 12,
  },
  financialTotalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  financialTotalValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  feeTotals: {
    gap: 8,
    marginBottom: 12,
  },
  financialList: {
    gap: 12,
  },
  financialItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
  },
  financialItemContent: {
    flex: 1,
    marginRight: 12,
  },
  financialItemTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  financialItemMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  financialItemRight: {
    alignItems: 'flex-end' as const,
    gap: 4,
  },
  financialItemAmount: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  financialItemDelete: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '600' as const,
  },
  feeActions: {
    flexDirection: 'row' as const,
    gap: 8,
    alignItems: 'center' as const,
  },
  paidButton: {
    backgroundColor: `${Colors.success}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paidButtonText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.success,
  },
  paidButtonTextActive: {
    color: Colors.success,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    paddingVertical: 16,
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
  categorySelector: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: 20,
  },
  categoryOption: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryOptionSelected: {
    backgroundColor: `${Colors.primary}15`,
    borderColor: Colors.primary,
  },
  categoryOptionText: {
    fontSize: 13,
    color: Colors.text,
  },
  categoryOptionTextSelected: {
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
