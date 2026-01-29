
import React, { useState, useEffect, useCallback } from 'react';
import ConfigPanel from './components/ConfigPanel';
import InputSection from './components/InputSection';
import { Category, NotionConfig, IdeaItem } from './types';
import { addToNotion } from './services/notionService';

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

const setCookie = (name: string, value: string) => {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
};

const App: React.FC = () => {
  const [config, setConfig] = useState<NotionConfig>(() => {
    const apiKey = getCookie('notion_api_key') || '';
    const databaseId = getCookie('notion_database_id') || '';
    return { apiKey, databaseId };
  });

  const [inputs, setInputs] = useState<Record<Category, string>>({
    [Category.MONTH]: '',
    [Category.RESULTS]: '',
    [Category.PRODUCT]: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<IdeaItem[]>([]);
  const [corsWarning, setCorsWarning] = useState(false);

  useEffect(() => {
    setCookie('notion_api_key', config.apiKey);
    setCookie('notion_database_id', config.databaseId);
  }, [config]);

  const handleSync = async () => {
    if (!config.apiKey || !config.databaseId) {
      alert("Please configure your Notion API Key and Database ID first!");
      return;
    }

    setIsProcessing(true);
    const categories = [Category.MONTH, Category.RESULTS, Category.PRODUCT];
    let anyIdeaFound = false;

    for (const cat of categories) {
      const rawText = inputs[cat].trim();
      if (!rawText) continue;
      anyIdeaFound = true;

      // Split by lines and filter empty lines
      const ideas = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

      for (const ideaText of ideas) {
        const logId = Math.random().toString(36).substr(2, 9);
        const newLog: IdeaItem = {
          id: logId,
          text: ideaText,
          category: cat,
          status: 'syncing'
        };
        setSyncLogs(prev => [newLog, ...prev]);

        try {
          await addToNotion(config, ideaText, cat);
          setSyncLogs(prev => prev.map(item =>
            item.id === logId ? { ...item, status: 'success' } : item
          ));
          setCorsWarning(false);
        } catch (err: any) {
          console.error("Sync Error:", err);
          const isNetworkError = err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('fetch');
          if (isNetworkError) {
            setCorsWarning(true);
          }
          setSyncLogs(prev => prev.map(item =>
            item.id === logId ? { ...item, status: 'error', error: err.message } : item
          ));
        }
      }

      // Clear input after processing
      setInputs(prev => ({ ...prev, [cat]: '' }));
    }

    if (!anyIdeaFound) {
      alert("No text found in any section to sync.");
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <i className="fa-solid fa-paper-plane text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Idea Pipeline</h1>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Powered by Gemini & Notion</p>
            </div>
          </div>
          
          <button
            onClick={handleSync}
            disabled={isProcessing}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 shadow-lg ${
              isProcessing 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95'
            }`}
          >
            {isProcessing ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <span>Sync to Notion</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <ConfigPanel 
          onSave={setConfig} 
          initialConfig={config} 
        />

        {corsWarning && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-amber-800">
            <i className="fa-solid fa-triangle-exclamation mt-1"></i>
            <div className="text-sm">
              <p className="font-bold">Connection Blocked</p>
              <p className="mt-1 opacity-80">
                A NetworkError occurred. This is common when the browser blocks requests to the Notion API. We are using a proxy to help, but if it persists:
              </p>
              <ul className="list-disc ml-5 mt-2 opacity-80 space-y-1">
                <li>Verify your <b>Internal Integration Secret</b> has access to the database.</li>
                <li>Ensure the database <b>ID</b> is correct.</li>
                <li>Try using a browser extension like 'CORS Unblock' or disable tracking protection temporarily.</li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 mb-10">
          <InputSection
            category={Category.MONTH}
            value={inputs[Category.MONTH]}
            onChange={(v) => setInputs({...inputs, [Category.MONTH]: v})}
            icon="fa-calendar-days"
            colorClass="bg-gradient-to-r from-blue-500 to-indigo-600"
            isProcessing={isProcessing}
          />
          <InputSection
            category={Category.RESULTS}
            value={inputs[Category.RESULTS]}
            onChange={(v) => setInputs({...inputs, [Category.RESULTS]: v})}
            icon="fa-chart-line"
            colorClass="bg-gradient-to-r from-emerald-500 to-teal-600"
            isProcessing={isProcessing}
          />
          <InputSection
            category={Category.PRODUCT}
            value={inputs[Category.PRODUCT]}
            onChange={(v) => setInputs({...inputs, [Category.PRODUCT]: v})}
            icon="fa-cube"
            colorClass="bg-gradient-to-r from-purple-500 to-pink-600"
            isProcessing={isProcessing}
          />
        </div>

        {/* Sync Status / Feed */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="font-bold text-gray-700">Sync Activity Feed</h2>
            <div className="text-xs text-gray-400 font-medium">
              {syncLogs.length} items logged
            </div>
          </div>
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
            {syncLogs.length === 0 ? (
              <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                  <i className="fa-solid fa-list-check text-gray-300 text-2xl"></i>
                </div>
                <p className="text-gray-400 text-sm">No activity yet. Type ideas above and sync!</p>
              </div>
            ) : (
              syncLogs.map((log) => (
                <div key={log.id} className="px-6 py-4 flex items-center justify-between group hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      log.status === 'success' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 
                      log.status === 'error' ? 'bg-red-500' : 'bg-amber-400 animate-pulse'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate pr-4">{log.text}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                          log.category === Category.MONTH ? 'bg-blue-50 text-blue-600' :
                          log.category === Category.RESULTS ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                        }`}>
                          {log.category}
                        </span>
                        {log.error && (
                          <span className="text-[10px] text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-md truncate max-w-[250px]">
                            {log.error}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 transition-opacity">
                    <i className={`fa-solid ${log.status === 'success' ? 'fa-check text-green-500' : log.status === 'error' ? 'fa-xmark text-red-500' : 'fa-spinner fa-spin text-amber-500'}`}></i>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Floating Action Hint */}
      {(!config.apiKey || !config.databaseId) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="bg-amber-100 text-amber-900 px-6 py-3 rounded-2xl shadow-xl border border-amber-200 flex items-center space-x-3 animate-bounce">
            <i className="fa-solid fa-hand-pointer"></i>
            <span className="text-sm font-bold">Please configure Notion settings!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
