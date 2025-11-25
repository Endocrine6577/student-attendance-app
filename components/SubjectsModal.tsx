import React, { useState } from 'react';
import { Subject } from '../types';

interface SubjectsModalProps {
  subjects: Subject[];
  onAddSubject: (name: string) => void;
  onDeleteSubject: (id: number) => void;
}

const SubjectsModal: React.FC<SubjectsModalProps> = ({ subjects, onAddSubject, onDeleteSubject }) => {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!newSubjectName.trim()) {
      setError('Subject name cannot be empty.');
      return;
    }
    if (subjects.some(s => s.name.toLowerCase() === newSubjectName.trim().toLowerCase())) {
        setError('This subject already exists.');
        return;
    }
    setError('');
    onAddSubject(newSubjectName.trim());
    setNewSubjectName('');
  };

  return (
    <div className="space-y-4">
        <div>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="Enter new subject name"
                    className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 text-base font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                >
                    Add
                </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
            {subjects.length > 0 ? (
                subjects.map(subject => (
                    <div key={subject.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                        <span className="text-gray-200 text-base">{subject.name}</span>
                        <button
                            onClick={() => onDeleteSubject(subject.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            aria-label={`Delete ${subject.name}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500 py-4 text-base">No subjects added yet.</p>
            )}
        </div>
    </div>
  );
};

export default SubjectsModal;