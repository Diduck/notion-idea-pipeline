
import React, { useState } from 'react';
import { NotionConfig } from '../types';

interface ConfigPanelProps {
  onSave: (config: NotionConfig) => void;
  initialConfig: NotionConfig;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ onSave, initialConfig }) => {
  const [config, setConfig] = useState<NotionConfig>(initialConfig);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onSave(config);
    setIsOpen(false);
  };

  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <i className="fa-solid fa-gear text-indigo-500"></i>
          <span className="font-semibold text-gray-700">Notion Integration Settings</span>
        </div>
        <i className={`fa-solid fa-chevron-down text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Internal Integration Secret</label>
            <input 
              type="password"
              placeholder="secret_..."
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-black"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Database ID</label>
            <input 
              type="text"
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-black"
              value={config.databaseId}
              onChange={(e) => setConfig({ ...config, databaseId: e.target.value })}
            />
          </div>
          <div className="flex justify-end pt-2">
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-md active:scale-95"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPanel;
