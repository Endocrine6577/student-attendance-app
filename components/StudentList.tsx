import React from 'react';
import { Student } from '../types';
import StudentListItem from './StudentListItem';

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onRequestDelete: (student: Student) => void;
  onRequestRestore: (student: Student) => void;
  onRequestPermanentDelete: (student: Student) => void;
  onView: (student: Student) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onEdit, onRequestDelete, onRequestRestore, onRequestPermanentDelete, onView }) => {
  if (students.length === 0) {
    return (
        <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-base font-medium text-gray-300">No students found</h3>
            <p className="mt-1 text-base text-gray-500">There are no students to display in this view.</p>
        </div>
    )
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
      {/* List Header */}
      <div className="px-6 py-3 border-b border-gray-700 hidden md:flex">
        <div className="w-2/5 text-base font-medium text-gray-400 uppercase tracking-wider">Name</div>
        <div className="w-1/5 text-base font-medium text-gray-400 uppercase tracking-wider">Grade</div>
        <div className="w-2/5 text-base font-medium text-gray-400 uppercase tracking-wider text-right">Actions</div>
      </div>
      
      {/* List Body */}
      <div className="divide-y divide-gray-700">
        {students.map(student => (
          <StudentListItem 
            key={student.id} 
            student={student} 
            onEdit={onEdit}
            onRequestDelete={onRequestDelete}
            onRequestRestore={onRequestRestore}
            onRequestPermanentDelete={onRequestPermanentDelete}
            onView={onView}
          />
        ))}
      </div>
    </div>
  );
};

export default StudentList;