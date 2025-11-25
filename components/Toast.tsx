import React from 'react';
import { ToastConfig } from '../types';

interface ToastProps {
  config: ToastConfig | null;
}

const Toast: React.FC<ToastProps> = ({ config }) => {
  if (!config) {
    return null;
  }

  const baseClasses = 'fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white text-lg z-50 transform transition-all duration-300 ease-out';
  const typeClasses = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[config.type]} animate-slide-in-up`}>
      <p>{config.message}</p>
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-up {
          animation: slideInUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;