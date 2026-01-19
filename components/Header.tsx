
import React from 'react';
import { auth } from '../lib/firebase';
import { User } from 'firebase/auth';

interface HeaderProps {
  user: User | null;
  onAuthClick: (mode: 'login' | 'signup') => void;
}

const Header: React.FC<HeaderProps> = ({ user, onAuthClick }) => {
  const handleLogout = () => auth.signOut();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-blue-600 p-1.5 rounded-lg transition-transform group-hover:scale-110">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">Alpha<span className="text-blue-600">Insight</span></span>
        </div>

        {/* Navigation links removed as per request */}

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 border-l pl-4 border-slate-100">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900">{user.displayName || user.email?.split('@')[0]}</p>
                <button onClick={handleLogout} className="text-[10px] text-rose-500 font-bold hover:text-rose-600 uppercase tracking-wider">Logout</button>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-blue-600">
                {(user.displayName?.[0] || user.email?.[0]).toUpperCase()}
              </div>
            </div>
          ) : (
            <>
              <button onClick={() => onAuthClick('login')} className="text-sm font-semibold text-slate-600 hover:text-slate-900">Log in</button>
              <button onClick={() => onAuthClick('signup')} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95">Sign up</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
