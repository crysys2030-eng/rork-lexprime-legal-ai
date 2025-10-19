import { useLegalData } from '@/contexts/LegalDataContext';
import { Mail, Phone, Plus, Search, User, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Client } from '@/types';
import Colors from '@/constants/colors';

export default function ClientsScreen() {
  const { clients, cases, loading, deleteClient, addClient } = useLegalData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
  });

  const filteredClients = clients.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getClientCaseCount = (clientId: string) => {
    return cases.filter(c => c.clientId === clientId && c.status === 'active').length;
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    const activeCaseCount = getClientCaseCount(clientId);
    
    if (activeCaseCount > 0) {
      Alert.alert(
        'Não é possível eliminar',
        `${clientName} tem ${activeCaseCount} caso(s) ativo(s). Por favor, feche ou elimine os casos primeiro.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Eliminar Cliente',
      `Tem certeza que deseja eliminar ${clientName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteClient(clientId),
        },
      ]
    );
  };

  const handleAddClient = () => {
    if (!newClientData.name.trim() || !newClientData.email.trim() || !newClientData.phone.trim()) {
      Alert.alert('Erro', 'Por favor, preencha nome, email e telefone.');
      return;
    }

    const newClient: Client = {
      id: Date.now().toString(),
      name: newClientData.name.trim(),
      email: newClientData.email.trim(),
      phone: newClientData.phone.trim(),
      company: newClientData.company.trim() || undefined,
      address: newClientData.address.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    addClient(newClient);
    setShowAddModal(false);
    setNewClientData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
    });
    Alert.alert('Sucesso', 'Cliente adicionado com sucesso!');
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
            placeholder="Pesquisar clientes..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Plus size={24} color={Colors.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredClients.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <User size={64} color={Colors.primary} />
            </View>
            <Text style={styles.emptyStateText}>Nenhum cliente encontrado</Text>
          </View>
        ) : (
          <View style={styles.clientsList}>
            {filteredClients.map(client => {
              const caseCount = getClientCaseCount(client.id);
              return (
                <View key={client.id} style={styles.clientCard}>
                  <View style={styles.clientAvatar}>
                    <Text style={styles.clientAvatarText}>
                      {client.name
                        .split(' ')
                        .map(n => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>{client.name}</Text>
                    {client.company && (
                      <Text style={styles.clientCompany}>{client.company}</Text>
                    )}
                    <View style={styles.clientContacts}>
                      <View style={styles.contactItem}>
                        <Mail size={14} color={Colors.textSecondary} />
                        <Text style={styles.contactText}>{client.email}</Text>
                      </View>
                      <View style={styles.contactItem}>
                        <Phone size={14} color={Colors.textSecondary} />
                        <Text style={styles.contactText}>{client.phone}</Text>
                      </View>
                    </View>
                    <View style={styles.clientFooter}>
                      <View style={styles.caseCountBadge}>
                        <Text style={styles.caseCountText}>
                          {caseCount} {caseCount === 1 ? 'caso ativo' : 'casos ativos'}
                        </Text>
                      </View>
                      {caseCount === 0 && (
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteClient(client.id, client.name)}
                        >
                          <Trash2 size={18} color={Colors.error} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Cliente</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nome completo"
                  placeholderTextColor={Colors.textTertiary}
                  value={newClientData.name}
                  onChangeText={(text) => setNewClientData({ ...newClientData, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="email@exemplo.com"
                  placeholderTextColor={Colors.textTertiary}
                  value={newClientData.email}
                  onChangeText={(text) => setNewClientData({ ...newClientData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Telefone *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="+351 900 000 000"
                  placeholderTextColor={Colors.textTertiary}
                  value={newClientData.phone}
                  onChangeText={(text) => setNewClientData({ ...newClientData, phone: text })}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Empresa</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nome da empresa (opcional)"
                  placeholderTextColor={Colors.textTertiary}
                  value={newClientData.company}
                  onChangeText={(text) => setNewClientData({ ...newClientData, company: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Morada</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  placeholder="Morada completa (opcional)"
                  placeholderTextColor={Colors.textTertiary}
                  value={newClientData.address}
                  onChangeText={(text) => setNewClientData({ ...newClientData, address: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddClient}
              >
                <Text style={styles.submitButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  clientsList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    paddingBottom: 24,
  },
  clientCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row' as const,
    gap: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  clientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  clientAvatarText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.surface,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  clientCompany: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  clientContacts: {
    gap: 6,
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  contactText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  clientFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  caseCountBadge: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: `${Colors.error}10`,
    borderRadius: 8,
  },
  caseCountText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
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
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top' as const,
  },
  modalActions: {
    flexDirection: 'row' as const,
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.surface,
  },
});
