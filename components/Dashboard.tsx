
import React from 'react';
import { FinancialData } from '../types';
import FinancialChart from './FinancialChart';

interface DashboardProps {
  data: FinancialData;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const formatValue = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{data.company_name}</h2>
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">VERIFIED AI EXTraction</span>
          </div>
          <p className="text-slate-500 font-semibold text-lg">Reporting Year: {data.reporting_year} | Currency: {data.currency}</p>
        </div>
        <button
          onClick={onReset}
          className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-3 group active:scale-95"
        >
          <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Analyze Another Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & Specifics */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          {/* AI Insight Card */}
          <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
             <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-6">Investor Insight</h3>
                <p className="leading-relaxed text-blue-50 text-base opacity-95 italic">
                  "{data.investor_summary}"
                </p>
             </div>
             <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          </div>

          {/* Metrics Table */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex-1">
            <h4 className="font-bold text-slate-800 mb-8 uppercase text-xs tracking-widest flex items-center gap-3">
               <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
               Extracted Key Figures
            </h4>
            <div className="space-y-8">
              {data.metrics.map((m, idx) => {
                const growth = ((m.current_year - m.previous_year) / m.previous_year) * 100;
                const isPositive = growth >= 0;
                
                return (
                  <div key={idx} className="group pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{m.label}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{m.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900">{formatValue(m.current_year)}</p>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {isPositive ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Visualizations */}
        <div className="lg:col-span-2 flex flex-col gap-8">
           <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
             <FinancialChart metrics={data.metrics} currency={data.currency} />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.metrics.slice(0, 4).map((m, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                   <div className="flex justify-between items-start mb-4">
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">{m.label}</p>
                     <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
                     </div>
                   </div>
                   <div className="flex items-end justify-between gap-4">
                      <div>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{formatValue(m.current_year)}</h4>
                        <p className="text-xs font-medium text-slate-500 mt-1 italic">Prev: {formatValue(m.previous_year)}</p>
                      </div>
                   </div>
                   <div className="mt-6 h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${Math.min(100, (m.current_year / (m.current_year + (m.previous_year || 1))) * 100)}%` }}
                      ></div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
