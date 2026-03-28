import { useLegalData } from '@/contexts/LegalDataContext';
import { router } from 'expo-router';
import { Briefcase, Plus, Search, Trash2, AlertCircle } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '@/constants/colors';
import { Case } from '@/types';

export default function CasesScreen() {
  const { cases, clients, loading, getClientById, deleteCase } = useLegalData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = cases.filter(
    c =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
    }
  };

  const handleDeleteCase = (caseId: string, caseTitle: string) => {
    Alert.alert(
      'Eliminar Caso',
      `Tem certeza que deseja eliminar "${caseTitle}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteCase(caseId),
        },
      ]
    );
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
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar casos..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-case')}
        >
          <Plus size={24} color={Colors.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{cases.filter(c => c.status === 'active').length}</Text>
            <Text style={styles.statLabel}>Ativos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{cases.filter(c => c.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{clients.length}</Text>
            <Text style={styles.statLabel}>Clientes</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Casos Recentes</Text>

        {filteredCases.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Briefcase size={64} color={Colors.primary} />
            </View>
            <Text style={styles.emptyStateText}>Nenhum caso encontrado</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Tente uma pesquisa diferente' : 'Adicione seu primeiro caso'}
            </Text>
          </View>
        ) : (
          <View style={styles.casesList}>
            {filteredCases.map(caseItem => {
              const client = getClientById(caseItem.clientId);
              return (
                <View key={caseItem.id} style={styles.caseCard}>
                  <TouchableOpacity
                    style={styles.caseCardContent}
                    onPress={() => router.push(`/case/${caseItem.id}`)}
                  >
                    <View style={styles.caseHeader}>
                      <View style={styles.caseHeaderLeft}>
                        <View
                          style={[
                            styles.priorityIndicator,
                            { backgroundColor: getPriorityColor(caseItem.priority) },
                          ]}
                        />
                        <View style={styles.caseHeaderInfo}>
                          <Text style={styles.caseTitle}>{caseItem.title}</Text>
                          <Text style={styles.caseNumber}>{caseItem.caseNumber}</Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: `${getStatusColor(caseItem.status)}20` },
                        ]}
                      >
                        <Text
                          style={[styles.statusText, { color: getStatusColor(caseItem.status) }]}
                        >
                          {getStatusLabel(caseItem.status)}
                        </Text>
                      </View>
                    </View>

                    {client ? (
                      <Text style={styles.clientName}>{client.name}</Text>
                    ) : (
                      <View style={styles.noClientWarning}>
                        <AlertCircle size={14} color={Colors.warning} />
                        <Text style={styles.noClientText}>Sem cliente associado</Text>
                      </View>
                    )}

                    <View style={styles.caseFooter}>
                      <View style={styles.caseMetaItem}>
                        <Text style={styles.caseMetaLabel}>Prioridade:</Text>
                        <Text
                          style={[
                            styles.caseMetaValue,
                            { color: getPriorityColor(caseItem.priority) },
                          ]}
                        >
                          {getPriorityLabel(caseItem.priority)}
                        </Text>
                      </View>
                      {caseItem.nextHearing && (
                        <View style={styles.caseMetaItem}>
                          <Text style={styles.caseMetaLabel}>Próxima audiência:</Text>
                          <Text style={styles.caseMetaValue}>
                            {new Date(caseItem.nextHearing).toLocaleDateString('pt-PT')}
                          </Text>
                        </View>
                      )}
                    </View>

                    {caseItem.deadlines.length > 0 && (
                      <View style={styles.deadlineAlert}>
                        <Text style={styles.deadlineAlertText}>
                          {caseItem.deadlines.filter(d => !d.completed).length} prazos pendentes
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteCase(caseItem.id, caseItem.title)}
                  >
                    <Trash2 size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
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
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
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
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  casesList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 24,
  },
  caseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  caseCardContent: {
    padding: 16,
  },
  caseHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  },
  caseHeaderLeft: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
    flex: 1,
  },
  caseHeaderInfo: {
    flex: 1,
  },
  priorityIndicator: {
    width: 4,
    height: 56,
    borderRadius: 4,
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  caseNumber: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  clientName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  noClientWarning: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 12,
    backgroundColor: `${Colors.warning}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
  },
  noClientText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '600' as const,
  },
  caseFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  caseMetaItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  caseMetaLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  caseMetaValue: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  deadlineAlert: {
    marginTop: 12,
    backgroundColor: `${Colors.warning}20`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  deleteButton: {
    backgroundColor: `${Colors.error}15`,
    padding: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  deadlineAlertText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '600' as const,
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
});
