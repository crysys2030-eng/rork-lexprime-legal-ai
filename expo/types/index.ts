export type CaseStatus = 'active' | 'pending' | 'closed';
export type CasePriority = 'high' | 'medium' | 'low';
export type DocumentType = 'contract' | 'motion' | 'evidence' | 'correspondence' | 'other';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadedAt: string;
  size?: number;
}

export interface Deadline {
  id: string;
  title: string;
  date: string;
  caseId: string;
  completed: boolean;
}

export interface Case {
  id: string;
  title: string;
  caseNumber: string;
  clientId: string;
  status: CaseStatus;
  priority: CasePriority;
  description: string;
  courtName?: string;
  judge?: string;
  openedAt: string;
  closedAt?: string;
  nextHearing?: string;
  documents: Document[];
  deadlines: Deadline[];
  lastActivity: string;
}

export interface Activity {
  id: string;
  caseId: string;
  type: 'deadline' | 'hearing' | 'document' | 'note';
  title: string;
  description?: string;
  date: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  caseId?: string;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Expense {
  id: string;
  caseId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  receipt?: string;
}

export interface Fee {
  id: string;
  caseId: string;
  description: string;
  amount: number;
  hours?: number;
  hourlyRate?: number;
  date: string;
  isPaid: boolean;
  paidAt?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  caseId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  content: string;
  tags?: string[];
  createdAt: string;
}
