import React, { useState, useEffect } from 'react';
import { GoogleSheetConfig } from '../types';

interface SettingsModalProps {
  onSave: (config: GoogleSheetConfig) => void;
  onClose: () => void;
  config: GoogleSheetConfig | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onSave, onClose, config }) => {
  const [clientId, setClientId] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (config) {
      setClientId(config.clientId);
      setSpreadsheetId(config.spreadsheetId);
    }
  }, [config]);

  const handleSave = () => {
    if (!clientId.trim() || !spreadsheetId.trim()) {
      setError('Both fields are required.');
      return;
    }
    setError('');
    onSave({ clientId: clientId.trim(), spreadsheetId: spreadsheetId.trim() });
  };

  return (
    <div className={!config ? "fixed inset-0 z-50 flex items-center justify-center bg-gray-900" : ""}>
      <div className="space-y-6">
        {!config && (
            <div className="bg-blue-900/50 border border-blue-700 text-blue-200 p-4 rounded-lg">
                <h3 className="font-bold text-lg">One-Time Setup Required</h3>
                <p className="text-base">To use your own Google Sheet as a database, please provide the following:</p>
            </div>
        )}

        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-base">{error}</div>}
        
        <div>
          <label htmlFor="clientId" className="block text-base font-medium text-gray-300 mb-1">Google Client ID</label>
          <input
            type="text"
            id="clientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="e.g., 12345-abcde.apps.googleusercontent.com"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-base focus:ring-2 focus:ring-blue-500"
          />
          <a href="https://developers.google.com/workspace/guides/create-credentials#oauth-client-id" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline mt-1 inline-block">
            How to get a Client ID
          </a>
        </div>

        <div>
          <label htmlFor="spreadsheetId" className="block text-base font-medium text-gray-300 mb-1">Spreadsheet ID</label>
          <input
            type="text"
            id="spreadsheetId"
            value={spreadsheetId}
            onChange={(e) => setSpreadsheetId(e.target.value)}
            placeholder="e.g., 1aBcDeFgHiJkLmNoP"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-base focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-400 mt-1">
            You can find this in your Google Sheet URL: <br/>
            <code className="text-gray-300 bg-gray-900/50 px-1 py-0.5 rounded">.../spreadsheets/d/<b>SPREADSHEET_ID</b>/edit</code>
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          {config && (
            <button onClick={onClose} className="px-4 py-2 text-base font-semibold bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500">
              Cancel
            </button>
          )}
          <button onClick={handleSave} className="px-4 py-2 text-base font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save and Reload
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;