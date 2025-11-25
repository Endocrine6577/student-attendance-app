import React from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { Student } from '../types';

interface StudentDetailModalProps {
  student: Student;
}

const QR_CODE_ID = 'student-qr-code';

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student }) => {
  const handleDownload = () => {
    const canvas = document.getElementById(QR_CODE_ID) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qrcode-${student.firstName.toLowerCase()}-${student.lastName.toLowerCase()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <QRCode
          id={QR_CODE_ID}
          value={String(student.id)}
          size={192}
          level="H"
          includeMargin={false}
        />
      </div>
      
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white">{student.firstName} {student.lastName}</h3>
        <div className="mt-2 text-base text-gray-400 flex justify-center items-center space-x-4">
           <span>Grade: {student.grade}</span>
           <span className="text-gray-600">|</span>
           <span>Student ID: {student.id}</span>
        </div>
      </div>
      
      <div className="w-full pt-2">
        <button 
          onClick={handleDownload}
          className="w-full px-4 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download QR Code
        </button>
      </div>
    </div>
  );
};

export default StudentDetailModal;