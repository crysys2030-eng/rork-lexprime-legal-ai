import { useLegalData } from '@/contexts/LegalDataContext';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { FileText, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Case, CasePriority, CaseStatus, Document } from '@/types';

export default function AddCaseScreen() {
  const { addCase, clients } = useLegalData();
  
  const [title, setTitle] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [description, setDescription] = useState('');
  const [courtName, setCourtName] = useState('');
  const [judge, setJudge] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [status, setStatus] = useState<CaseStatus>('active');
  const [priority, setPriority] = useState<CasePriority>('medium');
  const [documents, setDocuments] = useState<Document[]>([]);

  const handlePickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const newDocs: Document[] = result.assets.map(asset => ({
          id: Date.now().toString() + Math.random(),
          name: asset.name,
          type: 'other' as const,
          url: asset.uri,
          uploadedAt: new Date().toISOString(),
          size: asset.size,
        }));
        setDocuments([...documents, ...newDocs]);
      }
    } catch (error) {
      console.error('Error picking documents:', error);
      Alert.alert('Erro', 'Não foi possível selecionar os documentos.');
    }
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = () => {
    if (!title.trim() || !caseNumber.trim() || !selectedClientId || !description.trim()) {
      Alert.alert('Erro', 'Por favor preencha todos os campos obrigatórios.');
      return;
    }

    const newCase: Case = {
      id: Date.now().toString(),
      title: title.trim(),
      caseNumber: caseNumber.trim(),
      clientId: selectedClientId,
      status,
      priority,
      description: description.trim(),
      courtName: courtName.trim() || undefined,
      judge: judge.trim() || undefined,
      openedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      documents,
      deadlines: [],
    };

    addCase(newCase);
    Alert.alert('Sucesso', 'Caso criado com sucesso!', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>
              Título do Caso <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Ação de Responsabilidade Civil"
              placeholderTextColor={Colors.textTertiary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Número do Processo <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: RC-2024/1234"
              placeholderTextColor={Colors.textTertiary}
              value={caseNumber}
              onChangeText={setCaseNumber}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Cliente <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              {clients.map(client => (
                <TouchableOpacity
                  key={client.id}
                  style={[
                    styles.clientOption,
                    selectedClientId === client.id && styles.clientOptionSelected,
                  ]}
                  onPress={() => setSelectedClientId(client.id)}
                >
                  <View
                    style={[
                      styles.radio,
                      selectedClientId === client.id && styles.radioSelected,
                    ]}
                  />
                  <Text
                    style={[
                      styles.clientOptionText,
                      selectedClientId === client.id && styles.clientOptionTextSelected,
                    ]}
                  >
                    {client.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Descrição <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva o caso..."
              placeholderTextColor={Colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Prioridade</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segment,
                  priority === 'low' && styles.segmentActive,
                  { borderColor: Colors.priorityLow },
                ]}
                onPress={() => setPriority('low')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    priority === 'low' && { color: Colors.priorityLow },
                  ]}
                >
                  Baixa
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segment,
                  priority === 'medium' && styles.segmentActive,
                  { borderColor: Colors.priorityMedium },
                ]}
                onPress={() => setPriority('medium')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    priority === 'medium' && { color: Colors.priorityMedium },
                  ]}
                >
                  Média
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segment,
                  priority === 'high' && styles.segmentActive,
                  { borderColor: Colors.priorityHigh },
                ]}
                onPress={() => setPriority('high')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    priority === 'high' && { color: Colors.priorityHigh },
                  ]}
                >
                  Alta
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Estado</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segment,
                  status === 'pending' && styles.segmentActive,
                  { borderColor: Colors.statusPending },
                ]}
                onPress={() => setStatus('pending')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    status === 'pending' && { color: Colors.statusPending },
                  ]}
                >
                  Pendente
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segment,
                  status === 'active' && styles.segmentActive,
                  { borderColor: Colors.statusActive },
                ]}
                onPress={() => setStatus('active')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    status === 'active' && { color: Colors.statusActive },
                  ]}
                >
                  Ativo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segment,
                  status === 'closed' && styles.segmentActive,
                  { borderColor: Colors.statusClosed },
                ]}
                onPress={() => setStatus('closed')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    status === 'closed' && { color: Colors.statusClosed },
                  ]}
                >
                  Encerrado
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tribunal</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Tribunal Judicial da Comarca de Lisboa"
              placeholderTextColor={Colors.textTertiary}
              value={courtName}
              onChangeText={setCourtName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Juiz</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Dra. Isabel Mendes"
              placeholderTextColor={Colors.textTertiary}
              value={judge}
              onChangeText={setJudge}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Documentos (PDF/Word)</Text>
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={handlePickDocuments}
            >
              <FileText size={20} color={Colors.primary} />
              <Text style={styles.uploadButtonText}>Anexar Documentos</Text>
            </TouchableOpacity>
            
            {documents.length > 0 && (
              <View style={styles.documentsList}>
                {documents.map((doc) => (
                  <View key={doc.id} style={styles.documentItem}>
                    <View style={styles.documentInfo}>
                      <FileText size={18} color={Colors.primary} />
                      <View style={styles.documentTextContainer}>
                        <Text style={styles.documentName} numberOfLines={1}>
                          {doc.name}
                        </Text>
                        {doc.size && (
                          <Text style={styles.documentSize}>
                            {formatFileSize(doc.size)}
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity 
                      onPress={() => handleRemoveDocument(doc.id)}
                      style={styles.removeButton}
                    >
                      <X size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Criar Caso</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  required: {
    color: Colors.error,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  pickerContainer: {
    gap: 8,
  },
  clientOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clientOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}15`,
    borderWidth: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  radioSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  clientOptionText: {
    fontSize: 15,
    color: Colors.text,
  },
  clientOptionTextSelected: {
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  segmentedControl: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: Colors.surface,
    alignItems: 'center' as const,
  },
  segmentActive: {
    backgroundColor: 'transparent' as const,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center' as const,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.surface,
  },
  uploadButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed' as const,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  documentsList: {
    gap: 8,
    marginTop: 4,
  },
  documentItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  documentInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    flex: 1,
  },
  documentTextContainer: {
    flex: 1,
    gap: 2,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  documentSize: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  removeButton: {
    padding: 4,
  },
});
