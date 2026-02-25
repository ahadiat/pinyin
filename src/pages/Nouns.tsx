import { useStartLearning } from "../api/learning_progress";
import { Flame, Target, ChevronLeft, Zap, Trophy, Brain } from "lucide-react";
import { Link } from "react-router-dom";

export default function StartLearning() {
  const { count, setCount, loading, category, startLearning } = useStartLearning();

  // Dynamic feedback based on the count
  const getGoalInfo = () => {
    if (count <= 5) return { label: "Casual", color: "text-emerald-500", bg: "bg-emerald-50", icon: <Target size={20} /> };
    if (count <= 15) return { label: "Steady", color: "text-blue-500", bg: "bg-blue-50", icon: <Brain size={20} /> };
    if (count <= 30) return { label: "Serious", color: "text-orange-500", bg: "bg-orange-50", icon: <Flame size={20} /> };
    return { label: "Insane", color: "text-red-500", bg: "bg-red-50", icon: <Zap size={20} /> };
  };

  const goal = getGoalInfo();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col p-6 font-sans">
      {/* Top Navigation */}
      <header className="flex items-center justify-between mb-10">
        <Link to="/" className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-90 transition-transform">
          <ChevronLeft size={24} className="text-slate-600" />
        </Link>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">lets learn</span>
          <span className="text-sm font-bold text-slate-900">{category?.toUpperCase()}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        
        {/* Dynamic Badge */}
        <div className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-colors duration-500 ${goal.bg} ${goal.color}`}>
          {goal.icon}
          {goal.label} Mode
        </div>

        <h2 className="text-4xl font-black text-slate-900 text-center mb-2">
          Pick your <br/> pace
        </h2>
        <p className="text-slate-500 text-center mb-12 font-medium">How many words can you handle?</p>

        {/* The "Power Slider" UI */}
        <div className="w-full bg-white p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-50 mb-10 relative overflow-hidden">
          
          <div className="relative z-10 text-center">
            <input
              type="range"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900 mb-8"
            />
            
            <div className="flex items-end justify-center gap-1">
              <span className={`text-8xl font-black transition-colors duration-500 ${goal.color}`}>
                {count}
              </span>
              <span className="text-xl font-bold text-slate-300 mb-4 uppercase"> {category?.toUpperCase()}</span>
            </div>
          </div>

          {/* Decorative background element */}
          <Trophy className="absolute -bottom-4 -right-4 text-slate-50 w-32 h-32 -rotate-12 z-0" />
        </div>

        {/* Action Button */}
        <button
          onClick={startLearning}
          disabled={loading}
          className="group relative w-full bg-slate-900 py-5 rounded-3xl font-black text-xl text-white 
                     shadow-2xl shadow-slate-200 active:scale-[0.97] transition-all disabled:opacity-70 disabled:cursor-wait"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Preparing...</span>
            </div>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Start Session
              <Zap size={20} className="fill-current text-yellow-400 group-hover:scale-125 transition-transform" />
            </span>
          )}
        </button>

      </div>
      
      {/* Footer Motivation */}
      <p className="text-center text-slate-400 text-sm mt-8 font-medium italic">
        "Consistency is the key to mastery."
      </p>
    </div>
  );
}