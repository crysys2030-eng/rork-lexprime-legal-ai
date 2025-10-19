import { useLegalData } from '@/contexts/LegalDataContext';
import { Pin, Plus, Search, StickyNote } from 'lucide-react-native';
import { useState } from 'react';
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
import { Note } from '@/types';

export default function NotesScreen() {
  const { notes, cases, loading, addNote, updateNote, deleteNote } = useLegalData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState('');

  const filteredNotes = notes.filter(
    n =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const regularNotes = filteredNotes.filter(n => !n.isPinned);

  const handleSaveNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;

    if (editingNote) {
      updateNote(editingNote.id, {
        title: noteTitle,
        content: noteContent,
        caseId: selectedCaseId || undefined,
      });
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: noteTitle,
        content: noteContent,
        caseId: selectedCaseId || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: false,
      };
      addNote(newNote);
    }

    setShowAddModal(false);
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setSelectedCaseId('');
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setSelectedCaseId(note.caseId || '');
    setShowAddModal(true);
  };

  const togglePin = (note: Note) => {
    updateNote(note.id, { isPinned: !note.isPinned });
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
            placeholder="Pesquisar notas..."
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
        {pinnedNotes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Fixadas</Text>
            <View style={styles.notesList}>
              {pinnedNotes.map(note => {
                const noteCase = note.caseId ? cases.find(c => c.id === note.caseId) : null;
                return (
                  <TouchableOpacity
                    key={note.id}
                    style={[styles.noteCard, styles.pinnedNoteCard]}
                    onPress={() => handleEditNote(note)}
                  >
                    <View style={styles.noteHeader}>
                      <Text style={styles.noteTitle} numberOfLines={1}>
                        {note.title}
                      </Text>
                      <TouchableOpacity
                        style={styles.pinButton}
                        onPress={() => togglePin(note)}
                      >
                        <Pin size={18} color={Colors.warning} fill={Colors.warning} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.noteContent} numberOfLines={3}>
                      {note.content}
                    </Text>
                    <View style={styles.noteFooter}>
                      <Text style={styles.noteDate}>
                        {new Date(note.updatedAt).toLocaleDateString('pt-PT')}
                      </Text>
                      {noteCase && (
                        <Text style={styles.noteCaseName} numberOfLines={1}>
                          {noteCase.title}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.deleteNoteButton}
                      onPress={() => deleteNote(note.id)}
                    >
                      <Text style={styles.deleteNoteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {regularNotes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              {pinnedNotes.length > 0 ? 'Outras Notas' : 'Notas'}
            </Text>
            <View style={styles.notesList}>
              {regularNotes.map(note => {
                const noteCase = note.caseId ? cases.find(c => c.id === note.caseId) : null;
                return (
                  <TouchableOpacity
                    key={note.id}
                    style={styles.noteCard}
                    onPress={() => handleEditNote(note)}
                  >
                    <View style={styles.noteHeader}>
                      <Text style={styles.noteTitle} numberOfLines={1}>
                        {note.title}
                      </Text>
                      <TouchableOpacity
                        style={styles.pinButton}
                        onPress={() => togglePin(note)}
                      >
                        <Pin size={18} color={Colors.textTertiary} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.noteContent} numberOfLines={3}>
                      {note.content}
                    </Text>
                    <View style={styles.noteFooter}>
                      <Text style={styles.noteDate}>
                        {new Date(note.updatedAt).toLocaleDateString('pt-PT')}
                      </Text>
                      {noteCase && (
                        <Text style={styles.noteCaseName} numberOfLines={1}>
                          {noteCase.title}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.deleteNoteButton}
                      onPress={() => deleteNote(note.id)}
                    >
                      <Text style={styles.deleteNoteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {filteredNotes.length === 0 && (
          <View style={styles.emptyState}>
            <StickyNote size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyStateText}>Nenhuma nota encontrada</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Tente uma pesquisa diferente' : 'Adicione sua primeira nota'}
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          setEditingNote(null);
          setNoteTitle('');
          setNoteContent('');
          setSelectedCaseId('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingNote ? 'Editar Nota' : 'Nova Nota'}</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Título da nota"
              placeholderTextColor={Colors.textTertiary}
              value={noteTitle}
              onChangeText={setNoteTitle}
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Conteúdo da nota..."
              placeholderTextColor={Colors.textTertiary}
              value={noteContent}
              onChangeText={setNoteContent}
              multiline
              numberOfLines={10}
            />

            <Text style={styles.modalLabel}>Associar a caso (opcional):</Text>
            <ScrollView style={styles.casesPicker} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.caseOption,
                  selectedCaseId === '' && styles.caseOptionSelected,
                ]}
                onPress={() => setSelectedCaseId('')}
              >
                <Text
                  style={[
                    styles.caseOptionText,
                    selectedCaseId === '' && styles.caseOptionTextSelected,
                  ]}
                >
                  Nenhum caso
                </Text>
              </TouchableOpacity>
              {cases.map(caseItem => (
                <TouchableOpacity
                  key={caseItem.id}
                  style={[
                    styles.caseOption,
                    selectedCaseId === caseItem.id && styles.caseOptionSelected,
                  ]}
                  onPress={() => setSelectedCaseId(caseItem.id)}
                >
                  <Text
                    style={[
                      styles.caseOptionText,
                      selectedCaseId === caseItem.id && styles.caseOptionTextSelected,
                    ]}
                  >
                    {caseItem.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingNote(null);
                  setNoteTitle('');
                  setNoteContent('');
                  setSelectedCaseId('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleSaveNote}
              >
                <Text style={styles.modalButtonTextConfirm}>
                  {editingNote ? 'Atualizar' : 'Adicionar'}
                </Text>
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
  addButton: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  notesList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 12,
  },
  noteCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pinnedNoteCard: {
    borderColor: Colors.warning,
    borderWidth: 2,
  },
  noteHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  pinButton: {
    padding: 4,
  },
  noteContent: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  noteCaseName: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500' as const,
    flex: 1,
    textAlign: 'right' as const,
    marginLeft: 8,
  },
  deleteNoteButton: {
    backgroundColor: `${Colors.error}10`,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
  },
  deleteNoteButtonText: {
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
    alignItems: 'center' as const,
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
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
    height: 200,
    textAlignVertical: 'top' as const,
  },
  casesPicker: {
    maxHeight: 120,
    marginBottom: 16,
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
