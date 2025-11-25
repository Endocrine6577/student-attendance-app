import { Student, Subject, AttendanceRecord } from './types';

export const MOCK_STUDENTS: Student[] = [
  { id: 1, firstName: 'John', lastName: 'Doe', grade: 10, isDeleted: false },
  { id: 2, firstName: 'Jane', lastName: 'Smith', grade: 11, isDeleted: false },
  { id: 3, firstName: 'Alice', lastName: 'Johnson', grade: 9, isDeleted: false },
  { id: 4, firstName: 'Bob', lastName: 'Williams', grade: 12, isDeleted: false },
  { id: 5, firstName: 'Charlie', lastName: 'Brown', grade: 10, isDeleted: false },
  { id: 6, firstName: 'Diana', lastName: 'Prince', grade: 11, isDeleted: true },
  { id: 7, firstName: 'Bruce', lastName: 'Wayne', grade: 12, isDeleted: true },
];

export const MOCK_SUBJECTS: Subject[] = [
    { id: 1, name: 'Mathematics' },
    { id: 2, name: 'Physics' },
    { id: 3, name: 'Chemistry' },
    { id: 4, name: 'Biology' },
    { id: 5, name: 'History' },
];

export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
    {
        studentId: 1,
        subjectId: 1,
        grade: 10,
        date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Yesterday
        status: 'Present'
    },
    {
        studentId: 5,
        subjectId: 1,
        grade: 10,
        date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Yesterday
        status: 'Present'
    },
    {
        studentId: 2,
        subjectId: 2,
        grade: 11,
        date: new Date().toISOString(), // Today
        status: 'Present'
    }
];