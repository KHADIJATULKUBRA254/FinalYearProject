
import React, { useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
        isLoading ? 'bg-slate-50 border-slate-200' : 'bg-white border-indigo-200 hover:border-indigo-400 cursor-pointer shadow-sm hover:shadow-md'
      }`}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${
            isLoading ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'
          }`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Upload Annual Report</h3>
          <p className="text-slate-500 max-w-sm">
            Drag and drop your report here, or click to browse. Supports large PDFs up to 300 pages.
          </p>
          <div className="mt-8 flex gap-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded">PDF Only</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded">Max 20MB</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
