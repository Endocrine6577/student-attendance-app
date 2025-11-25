import React from 'react';
import { Student } from '../types';

interface StudentListItemProps {
  student: Student;
  onEdit: (student: Student) => void;
  onRequestDelete: (student: Student) => void;
  onRequestRestore: (student: Student) => void;
  onRequestPermanentDelete: (student: Student) => void;
  onView: (student: Student) => void;
}

const ActionButton: React.FC<{ onClick: () => void, className: string, children: React.ReactNode }> = ({ onClick, className, children }) => (
    <button
        onClick={onClick}
        className={`px-5 py-2 text-base font-semibold rounded-md transition-colors duration-200 ${className}`}
    >
        {children}
    </button>
);

const StudentListItem: React.FC<StudentListItemProps> = ({ student, onEdit, onRequestDelete, onRequestRestore, onRequestPermanentDelete, onView }) => {
  return (
    <div className="px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-gray-700/50 transition-colors duration-200">
      <div className="w-full md:w-2/5 mb-2 md:mb-0">
        <div className="font-medium text-white text-lg">{student.firstName} {student.lastName}</div>
        <div className="text-base text-gray-400 md:hidden">Grade: {student.grade}</div>
      </div>
      <div className="w-full md:w-1/5 text-lg text-gray-300 hidden md:block">{student.grade}</div>
      <div className="w-full md:w-2/5 flex justify-start md:justify-end space-x-2">
        {student.isDeleted ? (
          <>
            <ActionButton onClick={() => onRequestRestore(student)} className="bg-green-600 text-white hover:bg-green-700">
              Restore
            </ActionButton>
            <ActionButton onClick={() => onRequestPermanentDelete(student)} className="text-red-400 border border-red-500/50 hover:bg-red-500/10">
              Permanently Delete
            </ActionButton>
          </>
        ) : (
          <>
            <ActionButton onClick={() => onView(student)} className="bg-green-600 text-white hover:bg-green-700">
              QR Code
            </ActionButton>
            <ActionButton onClick={() => onEdit(student)} className="bg-gray-600 text-gray-200 hover:bg-gray-500">
              Edit
            </ActionButton>
            <ActionButton onClick={() => onRequestDelete(student)} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </ActionButton>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentListItem;