import React from 'react';

type AppView = 'students' | 'scanner' | 'reports';

interface HeaderProps {
  currentView: AppView;
  onSetView: (view: AppView) => void;
  onAddStudent: () => void;
  onManageSubjects: () => void;
  isSignedIn: boolean;
  onSignOut: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    currentView, 
    onSetView, 
    onAddStudent, 
    onManageSubjects,
    isSignedIn,
    onSignOut,
    onOpenSettings,
}) => {
    
  return (
    <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 shadow-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            Attendance Tracker
          </h1>
          {isSignedIn && (
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
              <button onClick={onOpenSettings} className="p-2 text-gray-300 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button onClick={onSignOut} className="px-3 py-2 text-base text-gray-300 hover:text-white">
                Sign Out
              </button>
            </div>
           )}
        </div>
        {isSignedIn && (
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
        )}
      </div>
    </header>
  );
};

export default Header;