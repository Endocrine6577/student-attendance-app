import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import StudentList from './components/StudentList';
import Scanner from './components/Scanner';
import Reports from './components/Reports';
import Modal from './components/Modal';
import StudentForm from './components/StudentForm';
import StudentDetailModal from './components/StudentDetailModal';
import SubjectsModal from './components/SubjectsModal';
import ConfirmationModal from './components/ConfirmationModal';
import Toast from './components/Toast';
import { MOCK_STUDENTS, MOCK_SUBJECTS, MOCK_ATTENDANCE_RECORDS } from './mockData';
import { Student, Subject, AttendanceRecord, ConfirmationModalConfig, ToastConfig } from './types';

type View = 'students' | 'scanner' | 'reports';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE_RECORDS);
  
  const [currentView, setCurrentView] = useState<View>('students');
  const [studentListView, setStudentListView] = useState<'active' | 'deleted'>('active');
  
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalConfig>({ isOpen: false });
  const [toast, setToast] = useState<ToastConfig | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const activeStudents = useMemo(() => students.filter(s => !s.isDeleted), [students]);
  const deletedStudents = useMemo(() => students.filter(s => s.isDeleted), [students]);

  const handleOpenAddModal = () => {
    setSelectedStudent(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setSelectedStudent(student);
    setIsAddEditModalOpen(true);
  };

  const handleOpenViewModal = (student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };
  
  const handleOpenSubjectsModal = () => {
    setIsSubjectsModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsAddEditModalOpen(false);
    setIsViewModalOpen(false);
    setIsSubjectsModalOpen(false);
    setSelectedStudent(null);
  };
  
  const handleConfirmAction = () => {
    if (confirmationModal.isOpen && confirmationModal.onConfirm) {
        confirmationModal.onConfirm();
    }
    setConfirmationModal({ isOpen: false });
  };

  const handleCancelAction = () => {
    setConfirmationModal({ isOpen: false });
  };

  const handleSaveStudent = (studentData: Omit<Student, 'id' | 'isDeleted'> & { id?: number }) => {
    if (studentData.id) {
      // Edit existing student
      setStudents(students.map(s => s.id === studentData.id ? { ...s, ...studentData } : s));
      showToast('Student details updated successfully.');
    } else {
      // Add new student
      const newStudentId = Math.max(0, ...students.map(s => s.id)) + 1;
      const newStudent: Student = {
        id: newStudentId,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        grade: studentData.grade,
        isDeleted: false,
      };
      setStudents([newStudent, ...students]);
      showToast('New student added successfully.');
      // Defer opening the view modal to allow the add/edit modal to close
      setTimeout(() => handleOpenViewModal(newStudent), 100);
    }
    handleCloseModals();
  };
  
  const requestDeleteStudent = (student: Student) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Student',
      message: `Are you sure you want to delete ${student.firstName} ${student.lastName}? This will move the student to the 'Removed' list.`,
      confirmText: 'Delete',
      onConfirm: () => {
        setStudents(students.map(s => s.id === student.id ? { ...s, isDeleted: true } : s));
        showToast('Student moved to Removed list.');
      },
    });
  };
  
  const requestRestoreStudent = (student: Student) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Restore Student',
      message: `Are you sure you want to restore ${student.firstName} ${student.lastName}?`,
      confirmText: 'Restore',
      onConfirm: () => {
        setStudents(students.map(s => s.id === student.id ? { ...s, isDeleted: false } : s));
        showToast('Student restored successfully.');
      }
    });
  };
  
  const requestPermanentDeleteStudent = (student: Student) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Permanently Delete Student',
      message: `This action cannot be undone. Are you sure you want to permanently delete ${student.firstName} ${student.lastName}? All associated data will be lost.`,
      confirmText: 'Permanently Delete',
      confirmButtonClass: 'bg-red-700 hover:bg-red-800',
      onConfirm: () => {
        setStudents(students.filter(s => s.id !== student.id));
        showToast('Student permanently deleted.', 'success');
      },
    });
  };


  const handleAddSubject = (name: string) => {
    const newSubject: Subject = {
        id: Math.max(0, ...subjects.map(s => s.id)) + 1,
        name,
    };
    setSubjects([...subjects, newSubject]);
  };

  const handleDeleteSubject = (id: number) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const handleRecordAttendance = (studentId: number, subjectId: number, grade: number): Student | null => {
    const student = students.find(s => s.id === studentId && s.grade === grade && !s.isDeleted);
    if (!student) {
        return null;
    }

    const newRecord: AttendanceRecord = {
        studentId,
        subjectId,
        grade,
        date: new Date().toISOString(),
        status: 'Present',
    };
    setAttendanceRecords(prev => [newRecord, ...prev]);
    return student;
  };

  const StudentListNavButton: React.FC<{ view: 'active' | 'deleted', label: string, count: number }> = ({ view, label, count }) => {
    const isActive = studentListView === view;
    return (
      <button
        onClick={() => setStudentListView(view)}
        className={`flex-1 sm:flex-initial text-center px-4 py-2 text-base font-medium rounded-md transition-colors duration-200 flex items-center justify-center ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-700/50'
        }`}
      >
        {label}
        <span className={`ml-2 text-sm px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-600 text-gray-200'}`}>
          {count}
        </span>
      </button>
    );
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header
        currentView={currentView}
        onSetView={setCurrentView}
        onAddStudent={handleOpenAddModal}
        onManageSubjects={handleOpenSubjectsModal}
      />
      <main className="p-4 sm:p-6 md:p-8 print:p-0">
        <div className="max-w-7xl mx-auto">
          {currentView === 'students' && (
            <div className="space-y-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-1 flex items-center space-x-1">
                <StudentListNavButton view="active" label="Current" count={activeStudents.length} />
                <StudentListNavButton view="deleted" label="Removed" count={deletedStudents.length} />
              </div>
              <StudentList
                students={studentListView === 'active' ? activeStudents : deletedStudents}
                onEdit={handleOpenEditModal}
                onRequestDelete={requestDeleteStudent}
                onRequestRestore={requestRestoreStudent}
                onRequestPermanentDelete={requestPermanentDeleteStudent}
                onView={handleOpenViewModal}
              />
            </div>
          )}
          {currentView === 'scanner' && (
            <Scanner 
              subjects={subjects}
              students={activeStudents}
              onRecordAttendance={handleRecordAttendance}
              showToast={showToast}
            />
          )}
          {currentView === 'reports' && (
            <Reports
              attendanceRecords={attendanceRecords}
              students={students}
              subjects={subjects}
              showToast={showToast}
            />
          )}
        </div>
      </main>

      {/* Add/Edit Student Modal */}
      <Modal isOpen={isAddEditModalOpen} onClose={handleCloseModals} title={selectedStudent ? 'Edit Student' : 'Add New Student'}>
        <StudentForm onSave={handleSaveStudent} onCancel={handleCloseModals} student={selectedStudent} />
      </Modal>

      {/* View Student Details & QR Code Modal */}
      {selectedStudent && (
        <Modal isOpen={isViewModalOpen} onClose={handleCloseModals} title={`${selectedStudent.firstName} ${selectedStudent.lastName}`}>
          <StudentDetailModal student={selectedStudent} />
        </Modal>
      )}

      {/* Manage Subjects Modal */}
      <Modal isOpen={isSubjectsModalOpen} onClose={handleCloseModals} title="Manage Subjects">
          <SubjectsModal 
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
          />
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        config={confirmationModal}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />

      {/* Toast Notification */}
      <Toast config={toast} />
    </div>
  );
};

export default App;