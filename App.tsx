
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import HistoryList from './components/HistoryList';
import { FinancialData, LoadingState } from './types';
import { analyzeFinancialPDF } from './services/aiService';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, push, onValue, serverTimestamp } from 'firebase/database';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [result, setResult] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ status: 'idle', message: '' });
  const [history, setHistory] = useState<any[]>([]);
  const [authChecking, setAuthChecking] = useState(true);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean, mode: 'login' | 'signup' }>({ isOpen: false, mode: 'login' });

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactStatus, setContactStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
      if (!currentUser) {
        setResult(null);
        setHistory([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const historyRef = ref(db, `users/${user.uid}/history`);
      const unsubscribe = onValue(historyRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const items = Object.entries(data).map(([id, val]: any) => ({ id, ...val }));
          setHistory(items);
        } else {
          setHistory([]);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleFileSelect = async (file: File) => {
    if (!user) {
      setAuthModal({ isOpen: true, mode: 'signup' });
      return;
    }
    setLoading({ status: 'loading', message: "Analyzing document..." });
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const data = await analyzeFinancialPDF(base64);
          setResult(data);
          const historyRef = ref(db, `users/${user.uid}/history`);
          await push(historyRef, { ...data, timestamp: serverTimestamp() });
          setLoading({ status: 'success', message: '' });
        } catch (error: any) {
          setLoading({ status: 'error', message: error.message });
          alert(error.message);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setLoading({ status: 'error', message: 'Unexpected error occurred.' });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;

    setContactLoading(true);
    setContactStatus('idle');

    try {
      const contactRef = ref(db, 'contacts');
      await push(contactRef, {
        ...contactForm,
        timestamp: serverTimestamp(),
        userId: user?.uid || 'anonymous'
      });
      setContactStatus('success');
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setContactStatus('idle'), 5000);
    } catch (error) {
      console.error("Contact form error:", error);
      setContactStatus('error');
    } finally {
      setContactLoading(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setLoading({ status: 'idle', message: '' });
  };

  if (authChecking) return null;

  return (
    <div className="min-h-screen bg-white text-slate-900 scroll-smooth flex flex-col">
      <Header user={user} onAuthClick={(mode) => setAuthModal({ isOpen: true, mode })} />
      
      {authModal.isOpen && (
        <Auth 
          mode={authModal.mode} 
          onClose={() => setAuthModal({ ...authModal, isOpen: false })} 
          onSwitch={(mode) => setAuthModal({ isOpen: true, mode })}
        />
      )}

      <main className="flex-grow">
        {user ? (
          /* Logged In Workspace Interface */
          <div className="bg-slate-50 min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Sidebar History */}
                <aside className="lg:col-span-1">
                  <div className="sticky top-32">
                    <HistoryList 
                      history={history} 
                      onSelect={(item) => {
                        setResult(item);
                        setLoading({ status: 'success', message: '' });
                      }} 
                    />
                  </div>
                </aside>

                {/* Main Workspace Stage */}
                <div className="lg:col-span-3">
                  {loading.status === 'loading' ? (
                    <div className="bg-white rounded-3xl p-20 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[500px]">
                      <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-8"></div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Report</h3>
                      <p className="text-slate-500">Extracting institutional insights from your PDF...</p>
                    </div>
                  ) : result ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <Dashboard data={result} onReset={resetAnalysis} />
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                      <div className="text-center">
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-4">New Analysis</h2>
                        <p className="text-slate-500 text-lg">Upload a financial PDF to begin extraction.</p>
                      </div>
                      <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <FileUpload onFileSelect={handleFileSelect} isLoading={false} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Public Landing Page Interface */
          <div className="animate-in fade-in duration-1000">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
               <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                 <div className="relative z-10">
                   <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-8">
                     <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                     AI-Powered Financial Analysis
                   </div>
                   <h1 className="text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-8">
                     Institutional Grade <br/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Financial Insights</span>
                   </h1>
                   <p className="text-xl text-slate-500 max-w-lg mb-12 leading-relaxed">
                     Instantly extract, analyze, and verify financial data from PDF reports. Built for investors who demand accuracy and speed.
                   </p>
                   <button 
                     onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
                     className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:shadow-2xl active:scale-95"
                   >
                     Start Analyzing Free
                   </button>
                 </div>

                 <div className="relative">
                   <div className="absolute inset-0 bg-blue-100/30 blur-3xl rounded-full -z-10 transform scale-150"></div>
                   <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-2xl relative">
                      <div className="flex flex-col items-center text-center p-12 border-2 border-dashed border-slate-200 rounded-3xl">
                         <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                         </div>
                         <h3 className="text-2xl font-bold mb-3">Upload Financial Report</h3>
                         <p className="text-slate-500 mb-8">Drag & drop PDF files here to start analyzing.</p>
                         <button onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })} className="text-blue-600 font-bold hover:underline">Free forever for analysts</button>
                      </div>
                   </div>
                 </div>
               </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-50/50">
               <div className="max-w-7xl mx-auto px-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-end">
                    <div>
                      <span className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-4 block">Free Analysis</span>
                      <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">Institutional intelligence <br/> available for all.</h2>
                    </div>
                    <p className="text-lg text-slate-500">We've built a financial operating system that streamlines your research and provides clear, actionable insights without paywalls.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {[
                      { title: "Smarter Data Extraction", desc: "Automatically extract key financial metrics from any company's PDF report and convert them into clean, comparable insights.", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
                      { title: "Multi-sector intelligence", desc: "Whether banking, pharmaceutical, FMCG, oil & gas, or telecom — your dashboard adapts to the sector and displays the right metrics.", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
                      { title: "Reliable & Transparent", desc: "View every number along with source references, confidence scores, and audit-friendly verification indicators.", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
                      { title: "AI-Powered Synthesis", desc: "Beyond raw numbers, our multi-agent AI system provides investor-grade summaries and automated risk assessments.", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" }
                    ].map((f, i) => (
                      <div key={i} className="flex gap-6 group">
                         <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={f.icon} /></svg>
                         </div>
                         <div>
                            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                            <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
            </section>

            {/* Meet the Team Section */}
            <section id="team" className="py-24">
               <div className="max-w-7xl mx-auto px-6 text-center">
                  <span className="text-blue-600 font-bold uppercase tracking-widest text-[10px] mb-4 block">Who Made It</span>
                  <h2 className="text-5xl font-black text-slate-900 mb-20 uppercase tracking-tighter">Meet the Team</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { name: "Iqra Mahjabeen", role: "Project Lead & Backend Developer", initial: "IM" },
                      { name: "Umair Ahmed", role: "Frontend Developer & UI/UX Designer", initial: "UA" },
                      { name: "Khadija-Tul-Kubra", role: "QA Specialist & Documenter", initial: "KTK" }
                    ].map((member, i) => (
                      <div key={i} className="bg-slate-50/40 border border-slate-100 p-10 rounded-[2.5rem] group hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all duration-500">
                         <div className="w-24 h-24 bg-white rounded-full mx-auto mb-6 flex items-center justify-center border border-slate-100 text-2xl font-bold text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                            <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                         </div>
                         <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                         <div className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-bold inline-block uppercase tracking-wider">
                            {member.role}
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-24 bg-blue-50/30">
               <div className="max-w-3xl mx-auto px-6">
                  <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center">
                    <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
                    <p className="text-slate-500 mb-10">Have questions or feature requests? Send us a message.</p>
                    
                    <form onSubmit={handleContactSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                       <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Name</label>
                         <input 
                           type="text" 
                           placeholder="John Doe" 
                           required
                           value={contactForm.name}
                           onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                           className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-300 transition-all"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                         <input 
                           type="email" 
                           placeholder="john@example.com" 
                           required
                           value={contactForm.email}
                           onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                           className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-300 transition-all"
                         />
                       </div>
                       <div className="md:col-span-2 space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Message</label>
                         <textarea 
                           rows={4} 
                           placeholder="How can we help you?" 
                           required
                           value={contactForm.message}
                           onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                           className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-300 transition-all resize-none"
                         ></textarea>
                       </div>
                       
                       <div className="md:col-span-2">
                         {contactStatus === 'success' && (
                           <p className="mb-4 text-emerald-600 font-bold text-sm">Message sent successfully! We'll be in touch.</p>
                         )}
                         {contactStatus === 'error' && (
                           <p className="mb-4 text-rose-600 font-bold text-sm">Oops! Something went wrong. Please try again.</p>
                         )}
                         <button 
                           type="submit" 
                           disabled={contactLoading}
                           className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                         >
                           {contactLoading ? 'Sending...' : 'Send Message'}
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                         </button>
                       </div>
                    </form>
                  </div>
               </div>
            </section>
          </div>
        )}
      </main>

      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-1">
                 <div className="flex items-center gap-2 mb-6">
                    <div className="bg-blue-600 p-1.5 rounded-lg transition-transform hover:scale-110">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-slate-900">Alpha<span className="text-blue-600">Insight</span></span>
                 </div>
                 <p className="text-sm text-slate-500 leading-relaxed mb-6">Empowering investors with institutional-grade financial analysis using advanced AI extraction.</p>
                 <div className="flex gap-4">
                    <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 cursor-pointer transition-all border border-slate-100 hover:shadow-md" title="Facebook">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                    <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 cursor-pointer transition-all border border-slate-100 hover:shadow-md" title="Instagram">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                    <a href="https://pk.linkedin.com/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-700 cursor-pointer transition-all border border-slate-100 hover:shadow-md" title="LinkedIn">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                 </div>
              </div>
              <div>
                 <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-slate-900">Quick Links</h4>
                 <ul className="space-y-4 text-sm text-slate-500">
                    {[
                      { name: 'Home', href: '#' },
                      { name: 'Features', href: '#features' },
                      { name: 'Meet the Team', href: '#team' },
                      { name: 'Get in Touch', href: '#contact' }
                    ].map((link) => (
                      <li key={link.name}>
                        {user ? (
                          <span className="hover:text-blue-600 transition-colors cursor-default">{link.name}</span>
                        ) : (
                          <a href={link.href} className="hover:text-blue-600 transition-colors">{link.name}</a>
                        )}
                      </li>
                    ))}
                 </ul>
              </div>
              <div>
                 <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-slate-900">Contact Info</h4>
                 <ul className="space-y-4 text-sm text-slate-500">
                    <li className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> contact@alphainsight.ai</li>
                    <li className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Karachi, Pakistan</li>
                 </ul>
              </div>
              <div>
                 <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-slate-900">Legal</h4>
                 <ul className="space-y-4 text-sm text-slate-500">
                    {[
                      { name: 'Privacy Policy' },
                      { name: 'Terms of Service' },
                      { name: 'Cookie Policy' }
                    ].map((link) => (
                      <li key={link.name}>
                        {user ? (
                          <span className="hover:text-blue-600 transition-colors cursor-default">{link.name}</span>
                        ) : (
                          <a href="#" className="hover:text-blue-600 transition-colors">{link.name}</a>
                        )}
                      </li>
                    ))}
                 </ul>
              </div>
           </div>
           <div className="pt-8 border-t border-slate-100 flex justify-center items-center text-xs font-medium text-slate-400">
              <p>© 2026 AlphaInsight. All rights reserved.</p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
