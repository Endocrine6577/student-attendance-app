import React, { useState, useMemo } from 'react';
import { AttendanceRecord, Student, Subject } from '../types';

interface ReportsProps {
  attendanceRecords: AttendanceRecord[];
  students: Student[];
  subjects: Subject[];
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const Reports: React.FC<ReportsProps> = ({ attendanceRecords, students, subjects, showToast }) => {
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterGrade, setFilterGrade] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');

  // Get unique grades from students for the dropdown
  const availableGrades = useMemo(() => {
    const grades = new Set(students.map(s => s.grade));
    return Array.from(grades).sort((a: number, b: number) => a - b);
  }, [students]);

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(record => {
      // Filter by Date (compare purely by date string YYYY-MM-DD)
      if (filterDate) {
        const recordDate = new Date(record.date).toISOString().split('T')[0];
        if (recordDate !== filterDate) return false;
      }
      
      // Filter by Grade
      if (filterGrade) {
        if (record.grade !== parseInt(filterGrade)) return false;
      }

      // Filter by Subject
      if (filterSubject) {
        if (record.subjectId !== parseInt(filterSubject)) return false;
      }

      return true;
    });
  }, [attendanceRecords, filterDate, filterGrade, filterSubject]);

  const getStudentName = (id: number) => {
    const student = students.find(s => s.id === id);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getSubjectName = (id: number) => {
    const subject = subjects.find(s => s.id === id);
    return subject ? subject.name : 'Unknown Subject';
  };

  const handlePrint = () => {
    // window.print() is often blocked in sandboxed iframes.
    // Instead, we can guide the user.
    showToast('Use Ctrl+P (or Cmd+P) to print this report.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls - Hidden when printing */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg print:hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Attendance Reports</h2>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            Print Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-base font-medium text-gray-300 mb-1">Filter by Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-base focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-300 mb-1">Filter by Grade</label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-base focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Grades</option>
              {availableGrades.map(g => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-base font-medium text-gray-300 mb-1">Filter by Subject</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-base focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden print:border-0 print:shadow-none print:bg-white">
         {/* Print-only Header */}
         <div className="hidden print:block p-6 border-b border-gray-200 text-black">
             <h1 className="text-3xl font-bold text-center mb-2">Attendance Report</h1>
             <div className="flex justify-center gap-4 text-base text-gray-600">
                 {filterDate && <span>Date: {filterDate}</span>}
                 {filterGrade && <span>Grade: {filterGrade}</span>}
                 {filterSubject && <span>Subject: {getSubjectName(parseInt(filterSubject))}</span>}
             </div>
         </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-base text-gray-400 print:text-black">
            <thead className="bg-gray-700/50 text-gray-200 uppercase font-medium text-base print:bg-gray-100 print:text-black">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Grade</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 print:divide-gray-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => {
                  const dateObj = new Date(record.date);
                  return (
                    <tr key={index} className="hover:bg-gray-700/30 print:hover:bg-transparent">
                      <td className="px-6 py-4 whitespace-nowrap">{dateObj.toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                      <td className="px-6 py-4 font-medium text-lg text-white print:text-black">{getStudentName(record.studentId)}</td>
                      <td className="px-6 py-4">Grade {record.grade}</td>
                      <td className="px-6 py-4">{getSubjectName(record.subjectId)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-900/50 text-green-400 print:bg-transparent print:text-black print:border print:border-black">
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 text-lg print:text-black">
                    No attendance records found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;