import { Student, Subject, AttendanceRecord } from '../types';

// Define keys for localStorage
const STUDENTS_KEY = 'attendance_students';
const SUBJECTS_KEY = 'attendance_subjects';
const ATTENDANCE_KEY = 'attendance_records';

// --- Default Data for Initialization ---
const defaultStudents: Student[] = [
  { id: 1622548800001, firstName: 'John', lastName: 'Doe', grade: 10, isDeleted: false },
  { id: 1622548800002, firstName: 'Jane', lastName: 'Smith', grade: 11, isDeleted: false },
  { id: 1622548800003, firstName: 'Peter', lastName: 'Jones', grade: 10, isDeleted: false },
  { id: 1622548800004, firstName: 'Mary', lastName: 'Johnson', grade: 12, isDeleted: true },
];

const defaultSubjects: Subject[] = [
  { id: 1, name: 'Mathematics' },
  { id: 2, name: 'Science' },
  { id: 3, name: 'History' },
];

const defaultAttendance: AttendanceRecord[] = [
    // No default attendance records
];

// --- Database Initialization ---
export const initializeDatabase = () => {
  if (!localStorage.getItem(STUDENTS_KEY)) {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(defaultStudents));
  }
  if (!localStorage.getItem(SUBJECTS_KEY)) {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(defaultSubjects));
  }
  if (!localStorage.getItem(ATTENDANCE_KEY)) {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(defaultAttendance));
  }
};

// --- Data Access Helpers ---
const getData = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveData = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- API-like Functions ---

// Simulate async behavior with Promises
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// STUDENTS
export const getStudents = async (): Promise<Student[]> => {
  await delay(100);
  return getData<Student>(STUDENTS_KEY);
};

export const addStudent = async (studentData: Omit<Student, 'id' | 'isDeleted'>): Promise<Student> => {
  await delay(100);
  const students = getData<Student>(STUDENTS_KEY);
  const newStudent: Student = {
    ...studentData,
    id: Date.now(),
    isDeleted: false,
  };
  students.push(newStudent);
  saveData(STUDENTS_KEY, students);
  return newStudent;
};

export const updateStudent = async (updatedStudent: Student): Promise<Student> => {
  await delay(100);
  let students = getData<Student>(STUDENTS_KEY);
  students = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
  saveData(STUDENTS_KEY, students);
  return updatedStudent;
};

export const deleteStudent = async (studentId: number): Promise<void> => {
  await delay(100);
  let students = getData<Student>(STUDENTS_KEY);
  students = students.filter(s => s.id !== studentId);
  saveData(STUDENTS_KEY, students);
};

// SUBJECTS
export const getSubjects = async (): Promise<Subject[]> => {
  await delay(100);
  return getData<Subject>(SUBJECTS_KEY);
};

export const addSubject = async (name: string): Promise<Subject> => {
  await delay(100);
  const subjects = getData<Subject>(SUBJECTS_KEY);
  const newSubject: Subject = {
    id: Date.now(),
    name,
  };
  subjects.push(newSubject);
  saveData(SUBJECTS_KEY, subjects);
  return newSubject;
};

export const deleteSubject = async (subjectId: number): Promise<void> => {
  await delay(100);
  let subjects = getData<Subject>(SUBJECTS_KEY);
  subjects = subjects.filter(s => s.id !== subjectId);
  saveData(SUBJECTS_KEY, subjects);
};

// ATTENDANCE
export const getAttendance = async (): Promise<AttendanceRecord[]> => {
  await delay(100);
  return getData<AttendanceRecord>(ATTENDANCE_KEY);
};

export const addAttendanceRecord = async (record: Omit<AttendanceRecord, 'date'>): Promise<AttendanceRecord> => {
  await delay(100);
  const attendance = getData<AttendanceRecord>(ATTENDANCE_KEY);
  const newRecord: AttendanceRecord = {
    ...record,
    date: new Date().toISOString(),
  };
  attendance.push(newRecord);
  saveData(ATTENDANCE_KEY, attendance);
  return newRecord;
};
