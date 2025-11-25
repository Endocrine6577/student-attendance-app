import React, { useState, useEffect } from 'react';
import { Student } from '../types';

interface StudentFormProps {
  onSave: (student: Omit<Student, 'id' | 'isDeleted'> & { id?: number }) => void;
  onCancel: () => void;
  student: Student | null;
}

const StudentForm: React.FC<StudentFormProps> = ({ onSave, onCancel, student }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    grade: 1,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        grade: student.grade,
      });
    } else {
      setFormData({ firstName: '', lastName: '', grade: 1 });
    }
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'grade' ? parseInt(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name cannot be empty.');
      return;
    }
    setError('');
    onSave({ ...formData, id: student?.id });
  };
  
  const grades = Array.from({ length: 13 }, (_, i) => i + 1);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-base">{error}</div>}
      <div>
        <label htmlFor="firstName" className="block text-base font-medium text-gray-300 mb-1">First Name</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>
      <div>
        <label htmlFor="lastName" className="block text-base font-medium text-gray-300 mb-1">Last Name</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>
      <div>
        <label htmlFor="grade" className="block text-base font-medium text-gray-300 mb-1">Grade</label>
        <select
          id="grade"
          name="grade"
          value={formData.grade}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
        </select>
      </div>
      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-base font-semibold bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 transition-colors">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 text-base font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Save Student
        </button>
      </div>
    </form>
  );
};

export default StudentForm;