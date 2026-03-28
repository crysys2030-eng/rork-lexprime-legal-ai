import { useLegalData } from '@/contexts/LegalDataContext';
import { BookOpen, FileText, Plus, Search, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { generateText } from '@rork/toolkit-sdk';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '@/constants/colors';
import { DocumentTemplate } from '@/types';

const CATEGORIES = [
  'Contratos',
  'Petições',
  'Minutas',
  'Procurações',
  'Pareceres',
  'Recursos',
  'Acordos',
  'Notificações',
  'Outros',
];

export default function DocumentsScreen() {
  const { templates, loading, addTemplate, deleteTemplate } = useLegalData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('Contratos');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);

  const filteredTemplates = templates.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryCount = (category: string) => {
    if (category === 'Todos') return templates.length;
    return templates.filter(t => t.category === category).length;
  };

  const handleAddTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) return;

    const newTemplate: DocumentTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      category: newTemplateCategory,
      description: newTemplateDescription || undefined,
      content: newTemplateContent,
      createdAt: new Date().toISOString(),
    };

    addTemplate(newTemplate);
    setShowAddModal(false);
    setNewTemplateName('');
    setNewTemplateCategory('Contratos');
    setNewTemplateDescription('');
    setNewTemplateContent('');
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    
    setGeneratingAI(true);
    try {
      const systemMessage = `Você é um assistente jurídico especializado em direito português. Gere documentos legais profissionais e precisos de acordo com a legislação portuguesa. Use linguagem formal e apropriada para documentos legais. Inclua todas as seções relevantes e cláusulas necessárias.`;
      
      const content = await generateText({
        messages: [
          { role: 'user', content: systemMessage + '\n\n' + aiPrompt },
        ],
      });

      setNewTemplateContent(content);
      setShowAIModal(false);
      setAiPrompt('');
      setShowAddModal(true);
    } catch (error) {
      console.error('Erro ao gerar documento com IA:', error);
    } finally {
      setGeneratingAI(false);
    }
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
            placeholder="Pesquisar modelos..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.aiButton} onPress={() => setShowAIModal(true)}>
          <Sparkles size={24} color={Colors.surface} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Plus size={24} color={Colors.surface} />
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'Todos' && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory('Todos')}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === 'Todos' && styles.categoryTextActive,
              ]}
            >
              Todos ({getCategoryCount('Todos')})
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category} ({getCategoryCount(category)})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredTemplates.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyStateText}>Nenhum modelo encontrado</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery || selectedCategory !== 'Todos'
                ? 'Tente uma pesquisa diferente'
                : 'Adicione seu primeiro modelo'}
            </Text>
          </View>
        ) : (
          <View style={styles.templatesList}>
            {filteredTemplates.map(template => (
              <View key={template.id} style={styles.templateCard}>
                <View style={styles.templateIcon}>
                  <FileText size={24} color={Colors.primary} />
                </View>
                <View style={styles.templateContent}>
                  <View style={styles.templateHeader}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{template.category}</Text>
                    </View>
                  </View>
                  {template.description && (
                    <Text style={styles.templateDescription} numberOfLines={2}>
                      {template.description}
                    </Text>
                  )}
                  <View style={styles.templateFooter}>
                    <Text style={styles.templateDate}>
                      {new Date(template.createdAt).toLocaleDateString('pt-PT')}
                    </Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteTemplate(template.id)}
                    >
                      <Text style={styles.deleteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
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
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Novo Modelo</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Nome do modelo"
                placeholderTextColor={Colors.textTertiary}
                value={newTemplateName}
                onChangeText={setNewTemplateName}
              />

              <Text style={styles.modalLabel}>Categoria:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categorySelector}
              >
                {CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      newTemplateCategory === category && styles.categoryOptionSelected,
                    ]}
                    onPress={() => setNewTemplateCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        newTemplateCategory === category && styles.categoryOptionTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Descrição (opcional)"
                placeholderTextColor={Colors.textTertiary}
                value={newTemplateDescription}
                onChangeText={setNewTemplateDescription}
                multiline
                numberOfLines={2}
              />

              <TextInput
                style={[styles.modalInput, styles.modalContentInput]}
                placeholder="Conteúdo do modelo..."
                placeholderTextColor={Colors.textTertiary}
                value={newTemplateContent}
                onChangeText={setNewTemplateContent}
                multiline
                numberOfLines={8}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowAddModal(false);
                    setNewTemplateName('');
                    setNewTemplateCategory('Contratos');
                    setNewTemplateDescription('');
                    setNewTemplateContent('');
                  }}
                >
                  <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleAddTemplate}
                >
                  <Text style={styles.modalButtonTextConfirm}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showAIModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAIModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.aiModalHeader}>
              <Sparkles size={24} color={Colors.primary} />
              <Text style={styles.modalTitle}>Gerar Documento com IA</Text>
            </View>
            <Text style={styles.aiModalDescription}>
              Descreva o documento que pretende gerar. A IA irá criar uma minuta baseada na legislação portuguesa.
            </Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Ex: Gerar contrato de arrendamento urbano para habitação, com duração de 2 anos, caução de 2 meses..."
              placeholderTextColor={Colors.textTertiary}
              value={aiPrompt}
              onChangeText={setAiPrompt}
              multiline
              numberOfLines={6}
              editable={!generatingAI}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAIModal(false);
                  setAiPrompt('');
                }}
                disabled={generatingAI}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm, generatingAI && styles.modalButtonDisabled]}
                onPress={handleGenerateAI}
                disabled={generatingAI}
              >
                {generatingAI ? (
                  <ActivityIndicator size="small" color={Colors.surface} />
                ) : (
                  <Text style={styles.modalButtonTextConfirm}>Gerar</Text>
                )}
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  aiButton: {
    backgroundColor: Colors.success,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  categoryTextActive: {
    color: Colors.surface,
  },
  content: {
    flex: 1,
  },
  templatesList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  templateCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row' as const,
    gap: 12,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  templateContent: {
    flex: 1,
  },
  templateHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  templateDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  templateFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  templateDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  deleteButton: {
    backgroundColor: `${Colors.error}10`,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.error,
  },
  emptyState: {
    alignItems: 'center' as const,
    paddingVertical: 64,
    paddingHorizontal: 32,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    padding: 20,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center' as const,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
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
  modalTextArea: {
    height: 60,
    textAlignVertical: 'top' as const,
  },
  modalContentInput: {
    height: 200,
    textAlignVertical: 'top' as const,
  },
  categorySelector: {
    marginBottom: 16,
    maxHeight: 50,
  },
  categoryOption: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryOptionSelected: {
    backgroundColor: `${Colors.primary}15`,
    borderColor: Colors.primary,
  },
  categoryOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  categoryOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  modalButtons: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 8,
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
  modalButtonDisabled: {
    opacity: 0.5,
  },
  aiModalHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 12,
  },
  aiModalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
});
