
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FinancialMetric } from '../types';

interface FinancialChartProps {
  metrics: FinancialMetric[];
  currency: string;
}

const FinancialChart: React.FC<FinancialChartProps> = ({ metrics, currency }) => {
  return (
    <div className="h-[520px] w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        Comparative Analysis ({currency})
      </h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={metrics}
            margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              dy={15}
              interval={0}
              angle={-25}
              textAnchor="end"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Legend iconType="circle" verticalAlign="top" height={36}/>
            <Bar 
              name="Current Year" 
              dataKey="current_year" 
              fill="#4f46e5" 
              radius={[4, 4, 0, 0]} 
              barSize={40}
            />
            <Bar 
              name="Previous Year" 
              dataKey="previous_year" 
              fill="#94a3b8" 
              radius={[4, 4, 0, 0]} 
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialChart;
