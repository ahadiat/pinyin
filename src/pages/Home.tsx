import React from 'react';
import { Link } from "react-router-dom";
import { BarChart2, BookOpen, Book, Plus, MessageCircle } from 'lucide-react';

const Home: React.FC = () => {
  const menuItems = [
    { 
      label: 'Stats', 
      path: '/noun', 
      icon: <BarChart2 size={24} />, 
      color: 'text-blue-500', 
      bgColor: 'bg-blue-50' 
    },
    { 
      label: 'Learn', 
      path: '/Studyhome', 
      icon: <BookOpen size={24} />, 
      color: 'text-emerald-500', 
      bgColor: 'bg-emerald-50' 
    },
    { 
      label: 'My Dictionary', 
      path: '/pinyin', 
      icon: <Book size={24} />, 
      color: 'text-purple-500', 
      bgColor: 'bg-purple-50' 
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-start p-6 font-sans relative overflow-x-hidden">
      <div className="w-full max-w-sm space-y-6 pt-10">
        
        {/* Header Section */}
        <header className="mb-8 text-left px-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Pin Yin
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Ready for your daily practice?</p>
        </header>

        {/* --- ALEESYA AI HERO BUTTON --- */}
        <Link
          to="/pinyinai" // The route for the VoiceChat UI we fixed earlier
          className="relative group flex items-center p-6 w-full bg-slate-900 
                     rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-900/20
                     transition-all duration-300 hover:-translate-y-1 active:scale-95"
        >
          {/* Animated Background Glow */}
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-500/20 blur-3xl group-hover:bg-emerald-500/40 transition-colors" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/50 animate-pulse">
              <MessageCircle size={28} className="text-white fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xl font-bold tracking-tight">Talk to Aleesya</span>
              <span className="text-emerald-400/80 text-xs font-semibold uppercase tracking-widest">Live Voice AI</span>
            </div>
          </div>
          
          <div className="ml-auto relative z-10">
            <div className="bg-white/10 p-2 rounded-full backdrop-blur-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white stroke-current stroke-[3]"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
        </Link>

        <div className="h-px bg-slate-200 w-full my-2" />

        {/* Main 3-Block Navigation */}
        <div className="flex flex-col gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="group flex items-center p-5 w-full bg-white 
                         rounded-[1.5rem] border border-slate-100 shadow-sm
                         transition-all duration-300 ease-out
                         hover:shadow-md hover:border-slate-200 active:scale-98"
            >
              <div className={`${item.bgColor} ${item.color} p-3 rounded-xl 
                              group-hover:scale-105 transition-transform duration-300`}>
                {item.icon}
              </div>

              <div className="ml-4 flex-1 text-left">
                <span className="block text-lg font-bold text-slate-800">
                  {item.label}
                </span>
              </div>

              <div className="text-slate-300 group-hover:text-slate-400 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* --- ADD BUTTON (Floating Action Button) --- */}
      <div className="fixed bottom-8 right-6 flex flex-col items-end gap-2">
        <span className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
          Add New
        </span>
        
        <Link
          to="/add-word"
          className="bg-orange-500 hover:bg-orange-600 text-white p-5 rounded-full shadow-xl 
                     transition-all duration-300 hover:rotate-90 active:scale-90 flex items-center justify-center group relative"
        >
          <Plus size={32} strokeWidth={3} />
        </Link>
      </div>
    </div>
  );
};

export default Home;