
import React from 'react';
import { FinancialData } from '../types';

interface HistoryItem extends FinancialData {
  id: string;
  timestamp: number;
}

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  activeId?: string;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, activeId }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 bg-slate-50 border-b border-slate-100">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Analysis History
        </h3>
      </div>
      
      <div className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar">
        {history.length === 0 ? (
          <div className="py-12 text-center px-4">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No reports yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.sort((a, b) => b.timestamp - a.timestamp).map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className={`w-full text-left p-4 rounded-2xl transition-all group ${
                  activeId === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-black truncate flex-1 pr-2 ${activeId === item.id ? 'text-white' : 'text-slate-900'}`}>
                    {item.company_name}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-tighter mt-0.5 ${activeId === item.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className={`text-[10px] font-bold flex items-center gap-2 ${activeId === item.id ? 'text-blue-200' : 'text-slate-400'}`}>
                   <span>FY {item.reporting_year}</span>
                   <span className="w-1 h-1 bg-current rounded-full opacity-30"></span>
                   <span>{item.currency}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryList;
