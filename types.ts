export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  grade: number;
  isDeleted: boolean;
}

export interface Subject {
  id: number;
  name: string;
}

export interface AttendanceRecord {
    studentId: number;
    subjectId: number;
    grade: number;
    date: string;
    status: 'Present' | 'Absent';
}

export type ConfirmationModalConfig = {
  isOpen: true;
  title: string;
  message: string;
  confirmText: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
} | {
  isOpen: false;
};

export interface ToastConfig {
  message: string;
  type: 'success' | 'error' | 'info';
}