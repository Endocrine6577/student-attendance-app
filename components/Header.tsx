import React from 'react';

type AppView = 'students' | 'scanner' | 'reports';

interface HeaderProps {
  currentView: AppView;
  onSetView: (view: AppView) => void;
  onAddStudent: () => void;
  onManageSubjects: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    currentView, 
    onSetView, 
    onAddStudent, 
    onManageSubjects,
}) => {
    
  return (
    <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 shadow-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            Attendance Tracker
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={onManageSubjects}
              className="px-4 py-2 text-base font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center"
            >
              Manage Subjects
            </button>
            <button
              onClick={onAddStudent}
              className="px-4 py-2 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Student
            </button>
          </div>
        </div>
        <nav className="border-t border-gray-700 pt-2.5 -mb-px">
           <div className="flex items-center space-x-2">
             <button onClick={() => onSetView('students')} className={`px-4 py-2 text-lg font-medium rounded-md ${currentView === 'students' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700/80'}`}>
                Students
             </button>
             <button onClick={() => onSetView('scanner')} className={`px-4 py-2 text-lg font-medium rounded-md ${currentView === 'scanner' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700/80'}`}>
                Scan Attendance
             </button>
             <button onClick={() => onSetView('reports')} className={`px-4 py-2 text-lg font-medium rounded-md ${currentView === 'reports' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700/80'}`}>
                Reports
             </button>
           </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
