import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Case, Client, Task, Note, Expense, Fee, DocumentTemplate } from '@/types';
import { sampleCases, sampleClients } from '@/mocks/sampleData';

const STORAGE_KEYS = {
  CASES: '@lexprime_cases',
  CLIENTS: '@lexprime_clients',
  TASKS: '@lexprime_tasks',
  NOTES: '@lexprime_notes',
  EXPENSES: '@lexprime_expenses',
  FEES: '@lexprime_fees',
  TEMPLATES: '@lexprime_templates',
  INITIALIZED: '@lexprime_initialized',
};

export const [LegalDataProvider, useLegalData] = createContextHook(() => {
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const initialized = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);
      
      if (!initialized) {
        await AsyncStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(sampleCases));
        await AsyncStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(sampleClients));
        await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
        await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([]));
        await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
        await AsyncStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify([]));
        await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify([]));
        await AsyncStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
        setCases(sampleCases);
        setClients(sampleClients);
        setTasks([]);
        setNotes([]);
        setExpenses([]);
        setFees([]);
        setTemplates([]);
      } else {
        const casesData = await AsyncStorage.getItem(STORAGE_KEYS.CASES);
        const clientsData = await AsyncStorage.getItem(STORAGE_KEYS.CLIENTS);
        const tasksData = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
        const notesData = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
        const expensesData = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
        const feesData = await AsyncStorage.getItem(STORAGE_KEYS.FEES);
        const templatesData = await AsyncStorage.getItem(STORAGE_KEYS.TEMPLATES);
        
        setCases(casesData ? JSON.parse(casesData) : []);
        setClients(clientsData ? JSON.parse(clientsData) : []);
        setTasks(tasksData ? JSON.parse(tasksData) : []);
        setNotes(notesData ? JSON.parse(notesData) : []);
        setExpenses(expensesData ? JSON.parse(expensesData) : []);
        setFees(feesData ? JSON.parse(feesData) : []);
        setTemplates(templatesData ? JSON.parse(templatesData) : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCases = async (newCases: Case[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(newCases));
      setCases(newCases);
    } catch (error) {
      console.error('Error saving cases:', error);
    }
  };

  const saveClients = async (newClients: Client[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(newClients));
      setClients(newClients);
    } catch (error) {
      console.error('Error saving clients:', error);
    }
  };

  const addCase = useCallback((newCase: Case) => {
    const updated = [...cases, newCase];
    saveCases(updated);
  }, [cases]);

  const updateCase = useCallback((caseId: string, updates: Partial<Case>) => {
    const updated = cases.map(c => c.id === caseId ? { ...c, ...updates } : c);
    saveCases(updated);
  }, [cases]);

  const deleteCase = useCallback((caseId: string) => {
    const updated = cases.filter(c => c.id !== caseId);
    saveCases(updated);
  }, [cases]);

  const addClient = useCallback((newClient: Client) => {
    const updated = [...clients, newClient];
    saveClients(updated);
  }, [clients]);

  const updateClient = useCallback((clientId: string, updates: Partial<Client>) => {
    const updated = clients.map(c => c.id === clientId ? { ...c, ...updates } : c);
    saveClients(updated);
  }, [clients]);

  const deleteClient = useCallback((clientId: string) => {
    const updated = clients.filter(c => c.id !== clientId);
    saveClients(updated);
  }, [clients]);

  const saveTasks = async (newTasks: Task[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const saveNotes = async (newNotes: Note[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(newNotes));
      setNotes(newNotes);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const saveExpenses = async (newExpenses: Expense[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(newExpenses));
      setExpenses(newExpenses);
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  const saveFees = async (newFees: Fee[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(newFees));
      setFees(newFees);
    } catch (error) {
      console.error('Error saving fees:', error);
    }
  };

  const saveTemplates = async (newTemplates: DocumentTemplate[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(newTemplates));
      setTemplates(newTemplates);
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  };

  const addTask = useCallback((newTask: Task) => {
    const updated = [...tasks, newTask];
    saveTasks(updated);
  }, [tasks]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    saveTasks(updated);
  }, [tasks]);

  const deleteTask = useCallback((taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    saveTasks(updated);
  }, [tasks]);

  const addNote = useCallback((newNote: Note) => {
    const updated = [...notes, newNote];
    saveNotes(updated);
  }, [notes]);

  const updateNote = useCallback((noteId: string, updates: Partial<Note>) => {
    const updated = notes.map(n => n.id === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n);
    saveNotes(updated);
  }, [notes]);

  const deleteNote = useCallback((noteId: string) => {
    const updated = notes.filter(n => n.id !== noteId);
    saveNotes(updated);
  }, [notes]);

  const addExpense = useCallback((newExpense: Expense) => {
    const updated = [...expenses, newExpense];
    saveExpenses(updated);
  }, [expenses]);

  const deleteExpense = useCallback((expenseId: string) => {
    const updated = expenses.filter(e => e.id !== expenseId);
    saveExpenses(updated);
  }, [expenses]);

  const addFee = useCallback((newFee: Fee) => {
    const updated = [...fees, newFee];
    saveFees(updated);
  }, [fees]);

  const updateFee = useCallback((feeId: string, updates: Partial<Fee>) => {
    const updated = fees.map(f => f.id === feeId ? { ...f, ...updates } : f);
    saveFees(updated);
  }, [fees]);

  const deleteFee = useCallback((feeId: string) => {
    const updated = fees.filter(f => f.id !== feeId);
    saveFees(updated);
  }, [fees]);

  const addTemplate = useCallback((newTemplate: DocumentTemplate) => {
    const updated = [...templates, newTemplate];
    saveTemplates(updated);
  }, [templates]);

  const deleteTemplate = useCallback((templateId: string) => {
    const updated = templates.filter(t => t.id !== templateId);
    saveTemplates(updated);
  }, [templates]);

  const deleteDeadline = useCallback((caseId: string, deadlineId: string) => {
    const caseData = cases.find(c => c.id === caseId);
    if (caseData) {
      const updatedDeadlines = caseData.deadlines.filter(d => d.id !== deadlineId);
      updateCase(caseId, { deadlines: updatedDeadlines });
    }
  }, [cases, updateCase]);

  const getCaseById = useCallback((caseId: string) => cases.find(c => c.id === caseId), [cases]);
  const getClientById = useCallback((clientId: string) => clients.find(c => c.id === clientId), [clients]);

  return useMemo(() => ({
    cases,
    clients,
    tasks,
    notes,
    expenses,
    fees,
    templates,
    loading,
    addCase,
    updateCase,
    deleteCase,
    addClient,
    updateClient,
    deleteClient,
    addTask,
    updateTask,
    deleteTask,
    addNote,
    updateNote,
    deleteNote,
    addExpense,
    deleteExpense,
    addFee,
    updateFee,
    deleteFee,
    addTemplate,
    deleteTemplate,
    deleteDeadline,
    getCaseById,
    getClientById,
  }), [cases, clients, tasks, notes, expenses, fees, templates, loading, addCase, updateCase, deleteCase, addClient, updateClient, deleteClient, addTask, updateTask, deleteTask, addNote, updateNote, deleteNote, addExpense, deleteExpense, addFee, updateFee, deleteFee, addTemplate, deleteTemplate, deleteDeadline, getCaseById, getClientById]);
});
