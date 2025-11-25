import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import SettingsModal from './components/SettingsModal';
import SignIn from './components/SignIn';
import { Student, Subject, AttendanceRecord, ConfirmationModalConfig, ToastConfig, GoogleSheetConfig } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import * as sheetsApi from './google/sheetsApi';

type View = 'students' | 'scanner' | 'reports';

const App: React.FC = () => {
  const [config, setConfig] = useLocalStorage<GoogleSheetConfig | null>('googleSheetConfig', null);

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const [gapiReady, setGapiReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<View>('students');
  const [studentListView, setStudentListView] = useState<'active' | 'deleted'>('active');
  
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalConfig>({ isOpen: false });
  const [toast, setToast] = useState<ToastConfig | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  const handleUpdateAuthStatus = (signedIn: boolean) => {
    setIsSignedIn(signedIn);
    if (signedIn) {
        fetchAllData();
    } else {
        // If not signed in, we are done with the initial load and should show the sign-in screen.
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (config) {
        sheetsApi.initClient(config, handleUpdateAuthStatus)
            .then(() => setGapiReady(true))
            .catch(err => {
                console.error("GAPI Init Error:", err);
                setError("Could not connect to Google Services. Please check your configuration and network.");
                setIsLoading(false); // Stop loading on initialization error
            });
    } else {
        setIsLoading(false);
    }
  }, [config]);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const [students, subjects, attendance] = await Promise.all([
            sheetsApi.getStudents(),
            sheetsApi.getSubjects(),
            sheetsApi.getAttendance(),
        ]);
        setStudents(students);
        setSubjects(subjects);
        setAttendanceRecords(attendance);
    } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(`Failed to load data from Google Sheet. Please ensure the sheet is correctly formatted and you have permission to view it. Details: ${err.message || 'Unknown Error'}`);
        showToast('Error loading data from Google Sheet.', 'error');
    } finally {
        setIsLoading(false);
    }
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
    setIsSettingsModalOpen(false);
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

  const handleSaveStudent = async (studentData: Omit<Student, 'id' | 'isDeleted'> & { id?: number }) => {
    handleCloseModals();
    try {
        if (studentData.id) {
            await sheetsApi.updateStudent(studentData as Student);
            showToast('Student details updated successfully.');
        } else {
            const newStudent = await sheetsApi.addStudent(studentData);
            showToast('New student added successfully.');
            setTimeout(() => handleOpenViewModal(newStudent), 100);
        }
        setStudents(await sheetsApi.getStudents());
    } catch (err) {
        showToast('Failed to save student.', 'error');
    }
  };
  
  const requestDeleteStudent = (student: Student) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Student',
      message: `Are you sure you want to delete ${student.firstName} ${student.lastName}? This will move the student to the 'Removed' list.`,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
            await sheetsApi.updateStudent({ ...student, isDeleted: true });
            setStudents(await sheetsApi.getStudents());
            showToast('Student moved to Removed list.');
        } catch(err) {
            showToast('Failed to delete student.', 'error');
        }
      },
    });
  };
  
  const requestRestoreStudent = (student: Student) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Restore Student',
      message: `Are you sure you want to restore ${student.firstName} ${student.lastName}?`,
      confirmText: 'Restore',
      onConfirm: async () => {
         try {
            await sheetsApi.updateStudent({ ...student, isDeleted: false });
            setStudents(await sheetsApi.getStudents());
            showToast('Student restored successfully.');
        } catch(err) {
            showToast('Failed to restore student.', 'error');
        }
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
      onConfirm: async () => {
        try {
            await sheetsApi.deleteStudent(student.id);
            setStudents(await sheetsApi.getStudents());
            // We could also delete attendance records, but for now we leave them as orphaned
            showToast('Student permanently deleted.', 'success');
        } catch(err) {
            showToast('Failed to permanently delete student.', 'error');
        }
      },
    });
  };

  const handleAddSubject = async (name: string) => {
    try {
        await sheetsApi.addSubject(name);
        setSubjects(await sheetsApi.getSubjects());
        showToast('Subject added successfully.');
    } catch (err) {
        showToast('Failed to add subject.', 'error');
    }
  };

  const handleDeleteSubject = async (id: number) => {
    try {
        await sheetsApi.deleteSubject(id);
        setSubjects(await sheetsApi.getSubjects());
        showToast('Subject deleted.');
    } catch (err) {
        showToast('Failed to delete subject.', 'error');
    }
  };

  const handleRecordAttendance = async (studentId: number, subjectId: number, grade: number): Promise<Student | null> => {
    const student = students.find(s => s.id === studentId && s.grade === grade && !s.isDeleted);
    if (!student) {
        return null;
    }
    
    const newRecord: Omit<AttendanceRecord, 'date'> = {
        studentId,
        subjectId,
        grade,
        status: 'Present',
    };
    
    try {
        await sheetsApi.addAttendanceRecord(newRecord);
        setAttendanceRecords(await sheetsApi.getAttendance());
        return student;
    } catch (err) {
        showToast('Failed to record attendance.', 'error');
        return null;
    }
  };
  
  const handleSaveSettings = (newConfig: GoogleSheetConfig) => {
      setConfig(newConfig);
      handleCloseModals();
      window.location.reload();
  };
  
  const handleSignOut = () => {
    sheetsApi.signOut();
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
  
  if (!config) {
    return <SettingsModal onSave={handleSaveSettings} config={null} onClose={() => { /* Cannot close */ }} />;
  }

  const renderContent = () => {
    if (!gapiReady || isLoading) {
        return <div className="flex justify-center items-center h-screen"><div className="text-xl">Loading...</div></div>;
    }
    if (!isSignedIn) {
        return <SignIn onSignIn={sheetsApi.signIn} onOpenSettings={() => setIsSettingsModalOpen(true)} />;
    }
    if (error) {
        return <div className="p-8 text-center text-red-400">
            <h2 className="text-2xl font-bold mb-4">An Error Occurred</h2>
            <p className="bg-gray-800 p-4 rounded-md">{error}</p>
            <button onClick={() => setIsSettingsModalOpen(true)} className="mt-4 px-4 py-2 bg-blue-600 rounded-md">Edit Settings</button>
        </div>;
    }

    return (
      <>
        <Header
          currentView={currentView}
          onSetView={setCurrentView}
          onAddStudent={handleOpenAddModal}
          onManageSubjects={handleOpenSubjectsModal}
          isSignedIn={isSignedIn}
          onSignOut={handleSignOut}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
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
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      {renderContent()}

      <Modal isOpen={isAddEditModalOpen} onClose={handleCloseModals} title={selectedStudent ? 'Edit Student' : 'Add New Student'}>
        <StudentForm onSave={handleSaveStudent} onCancel={handleCloseModals} student={selectedStudent} />
      </Modal>

      {selectedStudent && (
        <Modal isOpen={isViewModalOpen} onClose={handleCloseModals} title={`${selectedStudent.firstName} ${selectedStudent.lastName}`}>
          <StudentDetailModal student={selectedStudent} />
        </Modal>
      )}

      <Modal isOpen={isSubjectsModalOpen} onClose={handleCloseModals} title="Manage Subjects">
          <SubjectsModal 
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
          />
      </Modal>
      
      <Modal isOpen={isSettingsModalOpen} onClose={handleCloseModals} title="Google Sheets Integration Setup">
          <SettingsModal config={config} onSave={handleSaveSettings} onClose={handleCloseModals}/>
      </Modal>

      <ConfirmationModal
        config={confirmationModal}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />

      <Toast config={toast} />
    </div>
  );
};

export default App;
