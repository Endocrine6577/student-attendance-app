import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Subject, Student } from '../types';

interface ScannerProps {
  subjects: Subject[];
  students: Student[];
  onRecordAttendance: (studentId: number, subjectId: number, grade: number) => Promise<Student | null>;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const QR_READER_ID = "qr-reader";

const Scanner: React.FC<ScannerProps> = ({ subjects, students, onRecordAttendance, showToast }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [scannedStudents, setScannedStudents] = useState<{ student: Student, date: Date }[]>([]);
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (html5QrCodeRef.current && isScanning) {
        html5QrCodeRef.current.stop().catch(err => console.error("Failed to stop scanner on unmount", err));
      }
    };
  }, [isScanning]);
  
  const handleScanSuccess = async (decodedText: string) => {
    try {
      const studentId = parseInt(decodedText, 10);
      if (isNaN(studentId)) {
        showToast('Invalid QR Code: Not a valid student ID.', 'error');
        return;
      }

      // Prevent re-scanning the same student immediately
      const lastScan = scannedStudents.find(s => s.student.id === studentId);
      if (lastScan && (new Date().getTime() - lastScan.date.getTime()) < 5000) {
        // Already scanned within the last 5 seconds
        return;
      }
      
      const student = await onRecordAttendance(studentId, parseInt(selectedSubjectId), parseInt(selectedGrade));

      if (student) {
        showToast(`Attendance recorded for ${student.firstName} ${student.lastName}.`, 'success');
        setScannedStudents(prev => [{ student, date: new Date() }, ...prev]);
      } else {
        showToast(`Student not found or not in Grade ${selectedGrade}.`, 'error');
      }
    } catch (error) {
      showToast('Failed to process QR code.', 'error');
      console.error(error);
    }
  };

  const startScanner = async () => {
    try {
      // Create instance if not exists
      if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode(QR_READER_ID);
      }
      const qrCode = html5QrCodeRef.current;
      
      await qrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScanSuccess,
        (errorMessage) => { /* handle scan error */ }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Failed to start scanner", err);
      showToast('Could not start camera. Check permissions.', 'error');
    }
  };
  
  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
        try {
            await html5QrCodeRef.current.stop();
            setIsScanning(false);
        } catch(err) {
            console.error("Failed to stop scanner", err);
        }
    }
  };

  const handleTriggerFileUpload = () => {
     if (!selectedSubjectId || !selectedGrade) {
        showToast('Please select a subject and grade first.', 'error');
        return;
     }
     fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (isScanning) {
        await stopScanner();
      }

      try {
        let qrCode = html5QrCodeRef.current;
        if (!qrCode) {
            qrCode = new Html5Qrcode(QR_READER_ID);
            html5QrCodeRef.current = qrCode;
        }
        
        // true argument renders the image on the div
        const decodedText = await qrCode.scanFile(file, true);
        await handleScanSuccess(decodedText);
      } catch (err) {
        console.error("Error scanning file", err);
        showToast('Failed to scan QR code from image.', 'error');
      }
      
      // Clear input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // FIX: Explicitly type sort callback parameters to ensure correct type inference for arithmetic operation.
  const availableGrades = [...new Set(students.map(s => s.grade))].sort((a: number, b: number) => a - b);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column: Controls */}
      <div className="md:col-span-1 bg-gray-800 border border-gray-700 rounded-lg p-6 h-fit">
        <h2 className="text-2xl font-bold mb-4 text-white">Attendance Session</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-base font-medium text-gray-300 mb-1">Subject</label>
            <select
              id="subject"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={isScanning}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-base focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled hidden>Select a subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="grade" className="block text-base font-medium text-gray-300 mb-1">Grade</label>
            <select
              id="grade"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              disabled={isScanning}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-base focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled hidden>Select a grade</option>
              {availableGrades.map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </div>
          
          <div className="flex flex-col space-y-3 pt-2">
            <button
                onClick={isScanning ? stopScanner : startScanner}
                disabled={!selectedSubjectId || !selectedGrade}
                className={`w-full py-3 text-base font-semibold rounded-lg transition-colors ${
                isScanning 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } disabled:bg-gray-500 disabled:cursor-not-allowed`}
            >
                {isScanning ? 'Stop Scanning' : 'Start Camera Scan'}
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="px-2 bg-gray-800 text-sm text-gray-400 uppercase">or</span>
                </div>
            </div>

            <button
                onClick={handleTriggerFileUpload}
                disabled={(!selectedSubjectId || !selectedGrade) || isScanning} 
                className="w-full py-3 text-base font-semibold text-gray-200 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload QR Image
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
            />
          </div>
        </div>
      </div>

      {/* Right Column: Scanner and Scanned List */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 aspect-video flex items-center justify-center relative overflow-hidden">
            <div id={QR_READER_ID} className="w-full h-full"></div>
            {!isScanning && (
                <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8V4m0 16v-4m18 4v-4m0-8V4" />
                    </svg>
                    <p className="text-lg">Scanner is idle.</p>
                    <p className="text-base">Select subject and grade, then scan.</p>
                </div>
            )}
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="font-bold mb-2 text-xl text-white">Recently Scanned</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
                {scannedStudents.length > 0 ? (
                    scannedStudents.map(({ student, date }) => (
                        <div key={`${student.id}-${date.getTime()}`} className="flex justify-between items-center bg-gray-700 p-2 rounded-md text-base">
                            <p>{student.firstName} {student.lastName} <span className="text-sm text-gray-400 ml-2"> (Grade {student.grade})</span></p>
                            <p className="text-sm text-gray-400">{date.toLocaleTimeString()}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-4 text-base">No students scanned yet in this session.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;