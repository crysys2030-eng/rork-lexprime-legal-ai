import { useLegalData } from '@/contexts/LegalDataContext';
import { router } from 'expo-router';
import { CheckCircle2, Circle, Clock, Filter, Plus } from 'lucide-react-native';
import { useState, useMemo, useCallback } from 'react';
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
import { Task, TaskPriority, TaskStatus } from '@/types';

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case 'high':
      return Colors.priorityHigh;
    case 'medium':
      return Colors.priorityMedium;
    case 'low':
      return Colors.priorityLow;
  }
};

const getPriorityLabel = (priority: TaskPriority) => {
  switch (priority) {
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Média';
    case 'low':
      return 'Baixa';
  }
};

const getStatusLabel = (status: TaskStatus) => {
  switch (status) {
    case 'todo':
      return 'A Fazer';
    case 'in_progress':
      return 'Em Progresso';
    case 'done':
      return 'Concluído';
  }
};

export default function TasksScreen() {
  const { tasks, cases, loading, addTask, updateTask, deleteTask } = useLegalData();
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState('');

  const filteredTasks = useMemo(
    () => tasks.filter(t => filterStatus === 'all' || t.status === filterStatus),
    [tasks, filterStatus]
  );

  const todoCount = useMemo(() => tasks.filter(t => t.status === 'todo').length, [tasks]);
  const inProgressCount = useMemo(
    () => tasks.filter(t => t.status === 'in_progress').length,
    [tasks]
  );
  const doneCount = useMemo(() => tasks.filter(t => t.status === 'done').length, [tasks]);

  const handleToggleTask = useCallback(
    (task: Task) => {
      if (task.status === 'done') {
        updateTask(task.id, { status: 'todo', completedAt: undefined });
      } else {
        updateTask(task.id, { status: 'done', completedAt: new Date().toISOString() });
      }
    },
    [updateTask]
  );

  const handleAddTask = useCallback(() => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDescription || undefined,
      status: 'todo',
      priority: newTaskPriority,
      caseId: selectedCaseId || undefined,
      dueDate: newTaskDueDate || undefined,
      createdAt: new Date().toISOString(),
    };

    addTask(newTask);
    setShowAddModal(false);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
    setNewTaskDueDate('');
    setSelectedCaseId('');
  }, [newTaskTitle, newTaskDescription, newTaskPriority, newTaskDueDate, selectedCaseId, addTask]);

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
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{todoCount}</Text>
            <Text style={styles.statLabel}>A Fazer</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>{inProgressCount}</Text>
            <Text style={styles.statLabel}>Em Progresso</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.success }]}>{doneCount}</Text>
            <Text style={styles.statLabel}>Concluídas</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Plus size={24} color={Colors.surface} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>
              Todas ({tasks.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'todo' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('todo')}
          >
            <Text style={[styles.filterText, filterStatus === 'todo' && styles.filterTextActive]}>
              A Fazer ({todoCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === 'in_progress' && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus('in_progress')}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === 'in_progress' && styles.filterTextActive,
              ]}
            >
              Em Progresso ({inProgressCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'done' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('done')}
          >
            <Text style={[styles.filterText, filterStatus === 'done' && styles.filterTextActive]}>
              Concluídas ({doneCount})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle2 size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyStateText}>Nenhuma tarefa encontrada</Text>
          </View>
        ) : (
          <View style={styles.tasksList}>
            {filteredTasks.map(task => {
              const taskCase = task.caseId ? cases.find(c => c.id === task.caseId) : null;
              return (
                <View key={task.id} style={styles.taskCard}>
                  <TouchableOpacity
                    style={styles.taskCheckbox}
                    onPress={() => handleToggleTask(task)}
                  >
                    {task.status === 'done' ? (
                      <CheckCircle2 size={24} color={Colors.success} />
                    ) : (
                      <Circle size={24} color={Colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                  <View style={styles.taskContent}>
                    <View style={styles.taskHeader}>
                      <Text
                        style={[
                          styles.taskTitle,
                          task.status === 'done' && styles.taskTitleCompleted,
                        ]}
                      >
                        {task.title}
                      </Text>
                      <View
                        style={[
                          styles.priorityBadge,
                          { backgroundColor: `${getPriorityColor(task.priority)}15` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityText,
                            { color: getPriorityColor(task.priority) },
                          ]}
                        >
                          {getPriorityLabel(task.priority)}
                        </Text>
                      </View>
                    </View>
                    {task.description && (
                      <Text style={styles.taskDescription}>{task.description}</Text>
                    )}
                    <View style={styles.taskFooter}>
                      {task.dueDate && (
                        <View style={styles.taskMeta}>
                          <Clock size={14} color={Colors.textSecondary} />
                          <Text style={styles.taskMetaText}>
                            {new Date(task.dueDate).toLocaleDateString('pt-PT')}
                          </Text>
                        </View>
                      )}
                      {taskCase && (
                        <Text style={styles.taskCaseName}>{taskCase.title}</Text>
                      )}
                    </View>
                    <View style={styles.taskActions}>
                      <TouchableOpacity
                        style={styles.statusButton}
                        onPress={() => {
                          const nextStatus: TaskStatus =
                            task.status === 'todo'
                              ? 'in_progress'
                              : task.status === 'in_progress'
                              ? 'done'
                              : 'todo';
                          updateTask(task.id, {
                            status: nextStatus,
                            completedAt:
                              nextStatus === 'done' ? new Date().toISOString() : undefined,
                          });
                        }}
                      >
                        <Text style={styles.statusButtonText}>{getStatusLabel(task.status)}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteTask(task.id)}
                      >
                        <Text style={styles.deleteButtonText}>Eliminar</Text>
                      </TouchableOpacity>
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
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Tarefa</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Título da tarefa"
              placeholderTextColor={Colors.textTertiary}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Descrição (opcional)"
              placeholderTextColor={Colors.textTertiary}
              value={newTaskDescription}
              onChangeText={setNewTaskDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.modalLabel}>Prioridade:</Text>
            <View style={styles.prioritySelector}>
              {(['low', 'medium', 'high'] as TaskPriority[]).map(priority => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityOption,
                    newTaskPriority === priority && styles.priorityOptionSelected,
                    {
                      borderColor:
                        newTaskPriority === priority
                          ? getPriorityColor(priority)
                          : Colors.border,
                    },
                  ]}
                  onPress={() => setNewTaskPriority(priority)}
                >
                  <Text
                    style={[
                      styles.priorityOptionText,
                      {
                        color:
                          newTaskPriority === priority
                            ? getPriorityColor(priority)
                            : Colors.textSecondary,
                      },
                    ]}
                  >
                    {getPriorityLabel(priority)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Data limite (AAAA-MM-DD)"
              placeholderTextColor={Colors.textTertiary}
              value={newTaskDueDate}
              onChangeText={setNewTaskDueDate}
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
                  setNewTaskTitle('');
                  setNewTaskDescription('');
                  setNewTaskPriority('medium');
                  setNewTaskDueDate('');
                  setSelectedCaseId('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleAddTask}
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
  statsContainer: {
    flex: 1,
    flexDirection: 'row' as const,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  filterTextActive: {
    color: Colors.surface,
  },
  content: {
    flex: 1,
  },
  tasksList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  taskCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row' as const,
    gap: 12,
  },
  taskCheckbox: {
    paddingTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through' as const,
    color: Colors.textTertiary,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  taskDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  taskMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  taskCaseName: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  taskActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  statusButton: {
    flex: 1,
    backgroundColor: `${Colors.primary}15`,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  deleteButton: {
    backgroundColor: `${Colors.error}10`,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  deleteButtonText: {
    fontSize: 13,
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
    maxHeight: '85%',
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
    height: 80,
    textAlignVertical: 'top' as const,
  },
  prioritySelector: {
    flexDirection: 'row' as const,
    gap: 8,
    marginBottom: 16,
  },
  priorityOption: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    alignItems: 'center' as const,
  },
  priorityOptionSelected: {
    backgroundColor: `rgba(0, 0, 0, 0.05)`,
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
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
