import React from 'react';
import { Link } from "react-router-dom";
import { BarChart2, BookOpen, Book } from 'lucide-react';

const Home: React.FC = () => {
  const menuItems = [
    { 
      label: 'Stats', 
      path: '/noun', 
      icon: <BarChart2 size={28} />, 
      color: 'text-blue-500', 
      bgColor: 'bg-blue-50' 
    },
    { 
      label: 'Learn', 
      path: '/Studyhome', 
      icon: <BookOpen size={28} />, 
      color: 'text-emerald-500', 
      bgColor: 'bg-emerald-50' 
    },
    { 
      label: 'My Dictionary', 
      path: '/pinyin', 
      icon: <Book size={28} />, 
      color: 'text-purple-500', 
      bgColor: 'bg-purple-50' 
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm space-y-6">
        
        {/* Header Section */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Pin Yin
          </h1>
          <p className="text-slate-500 mt-2 font-medium">What's the plan today?</p>
        </header>

        {/* Main 3-Block Navigation */}
        <div className="flex flex-col gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="group flex items-center p-6 w-full bg-white 
                         rounded-[2rem] border border-slate-100 shadow-sm
                         transition-all duration-300 ease-out
                         hover:shadow-xl hover:-translate-y-1 active:scale-95"
            >
              {/* Icon Container */}
              <div className={`${item.bgColor} ${item.color} p-4 rounded-2xl 
                              group-hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </div>

              {/* Label */}
              <div className="ml-5 flex-1 text-left">
                <span className="block text-xl font-bold text-slate-800">
                  {item.label}
                </span>
                <span className="text-sm text-slate-400 font-medium">
                  Tap to open
                </span>
              </div>

              {/* Chevron Accessory */}
              <div className="text-slate-300 group-hover:text-slate-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Home;