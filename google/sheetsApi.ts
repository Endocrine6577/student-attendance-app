import { Student, Subject, AttendanceRecord, GoogleSheetConfig } from '../types';

// This is necessary because the GAPI script is loaded dynamically
// and TypeScript doesn't know about the global 'gapi' object.
declare const gapi: any;

const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

let googleAuth: any;
let SPREADSHEET_ID = '';

// --- Initialization and Auth ---

export const initClient = (config: GoogleSheetConfig, updateAuthStatus: (isSignedIn: boolean) => void) => {
  return new Promise<void>((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        clientId: config.clientId,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      }).then(() => {
        SPREADSHEET_ID = config.spreadsheetId;
        googleAuth = gapi.auth2.getAuthInstance();
        googleAuth.isSignedIn.listen(updateAuthStatus);
        updateAuthStatus(googleAuth.isSignedIn.get());
        resolve();
      }).catch((error: any) => {
        reject(error);
      });
    });
  });
};

export const signIn = () => {
  if (googleAuth) googleAuth.signIn();
};

export const signOut = () => {
  if (googleAuth) googleAuth.signOut();
};

// --- Data Parsing Helpers ---

const parseStudent = (row: any[]): Student | null => {
    if (!row || row.length < 5) return null;
    const id = parseInt(row[0], 10);
    if (isNaN(id)) return null;

    return {
        id,
        firstName: row[1] || '',
        lastName: row[2] || '',
        grade: parseInt(row[3], 10) || 1,
        isDeleted: row[4] === 'TRUE',
    };
};

const parseSubject = (row: any[]): Subject | null => {
    if (!row || row.length < 2) return null;
    const id = parseInt(row[0], 10);
    if (isNaN(id)) return null;
    
    return { id, name: row[1] || '' };
};

const parseAttendance = (row: any[]): AttendanceRecord | null => {
    if (!row || row.length < 5) return null;
    const studentId = parseInt(row[0], 10);
    if (isNaN(studentId)) return null;
    
    return {
        studentId,
        subjectId: parseInt(row[1], 10),
        grade: parseInt(row[2], 10),
        date: row[3],
        status: row[4] as 'Present' | 'Absent',
    };
};

// --- Data Fetching ---

const getSheetData = async <T>(range: string, parser: (row: any[]) => T | null): Promise<T[]> => {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range,
        });

        // Robust check: The result can be undefined or values can be missing for empty sheets.
        if (!response || !response.result || !Array.isArray(response.result.values)) {
            return []; // Safely return an empty array if the sheet is empty or malformed.
        }
        
        const rows = response.result.values;
        // Skip header (row 0), map data through the parser, and filter out any null (invalid) results.
        return rows
            .slice(1)
            .map(parser)
            .filter((item): item is T => item !== null);

    } catch (err) {
        console.error(`Error fetching sheet data for range: ${range}`, err);
        throw err; // Re-throw so it's caught by the main fetchAllData function
    }
};

export const getStudents = () => getSheetData('Students!A:E', parseStudent);
export const getSubjects = () => getSheetData('Subjects!A:B', parseSubject);
export const getAttendance = () => getSheetData('Attendance!A:E', parseAttendance);


// --- Data Modification ---

// Finds the 0-based index of a row from the full sheet data (including header)
const findRowIndex = (rows: any[][], id: number) => {
    // Note: This assumes the first row is a header and skips it in the search.
    // The returned index is relative to the full array.
    for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] && parseInt(rows[i][0]) === id) {
            return i;
        }
    }
    return -1;
};

// STUDENTS
export const addStudent = async (studentData: Omit<Student, 'id' | 'isDeleted'>): Promise<Student> => {
    const newId = Date.now();
    const newStudent: Student = {
        ...studentData,
        id: newId,
        isDeleted: false,
    };
    
    await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Students!A:E',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [[newStudent.id, newStudent.firstName, newStudent.lastName, newStudent.grade, newStudent.isDeleted]],
        },
    });

    return newStudent;
};

export const updateStudent = async (student: Student) => {
    const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Students!A:E',
    });
    const rows = response.result.values || [];
    const rowIndex = findRowIndex(rows, student.id);
    if (rowIndex === -1) throw new Error("Student not found for update.");

    // The range for `values.update` is 1-based. `rowIndex` is 0-based. So, we add 1.
    const sheetRow = rowIndex + 1;
    
    return gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Students!A${sheetRow}:E${sheetRow}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [[student.id, student.firstName, student.lastName, student.grade, student.isDeleted]],
        },
    });
};

export const deleteStudent = async (studentId: number) => {
    const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Students!A:A', 
    });
    const rows = response.result.values || [];
    const rowIndex = findRowIndex(rows, studentId);
    if (rowIndex === -1) throw new Error("Student not found for deletion.");

    const sheetInfoResponse = await gapi.client.sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const studentsSheet = sheetInfoResponse.result.sheets.find((s: any) => s.properties.title === 'Students');
    if (!studentsSheet) throw new Error("Students sheet not found. Please ensure the tab is named correctly.");

    // The `deleteDimension` request uses a 0-based index. `rowIndex` is already correct.
    const sheetRowIndexToDelete = rowIndex;

    return gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: studentsSheet.properties.sheetId,
                        dimension: 'ROWS',
                        startIndex: sheetRowIndexToDelete,
                        endIndex: sheetRowIndexToDelete + 1,
                    },
                },
            }],
        },
    });
};


// SUBJECTS
export const addSubject = (name: string) => {
    const newId = Date.now();
    return gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Subjects!A:B',
        valueInputOption: 'USER_ENTERED',
        resource: { values: [[newId, name]] }
    });
};

export const deleteSubject = async (subjectId: number) => {
    const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Subjects!A:A',
    });
    const rows = response.result.values || [];
    const rowIndex = findRowIndex(rows, subjectId);
    if (rowIndex === -1) throw new Error("Subject not found for deletion.");
    
    const sheetInfoResponse = await gapi.client.sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const subjectsSheet = sheetInfoResponse.result.sheets.find((s: any) => s.properties.title === 'Subjects');
    if (!subjectsSheet) throw new Error("Subjects sheet not found");

    // The `deleteDimension` request uses a 0-based index. `rowIndex` is already correct.
    const sheetRowIndexToDelete = rowIndex;

    return gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: subjectsSheet.properties.sheetId,
                        dimension: 'ROWS',
                        startIndex: sheetRowIndexToDelete,
                        endIndex: sheetRowIndexToDelete + 1,
                    },
                },
            }],
        },
    });
};

// ATTENDANCE
export const addAttendanceRecord = (record: Omit<AttendanceRecord, 'date'>) => {
    const newRecord: AttendanceRecord = {
        ...record,
        date: new Date().toISOString(),
    };

    return gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Attendance!A:E',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [[newRecord.studentId, newRecord.subjectId, newRecord.grade, newRecord.date, newRecord.status]],
        },
    });
};