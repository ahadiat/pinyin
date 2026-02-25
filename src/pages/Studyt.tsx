import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getWords } from "../api/googlesheet";
import type { Word } from "../api/googlesheet";
import { ChevronLeft, ChevronRight, Volume2, CheckCircle, Eye, EyeOff, BookOpen } from "lucide-react";

export default function WordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [words, setWords] = useState<Word[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const location = useLocation();
  
  // Toggles for active recall
  const [revealWord, setRevealWord] = useState(false);
  const [revealExample, setRevealExample] = useState(false);

  useEffect(() => {
    getWords().then(setWords);
    // Reset reveal states when word changes
    setRevealWord(false);
    setRevealExample(false);
  }, [id]);

  const playTapSound = () => {
    const click = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3");
    click.volume = 0.3;
    click.play().catch(() => {});
  };

  const speakMandarin = (text: string) => {
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.8;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  if (!words.length) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading deck...</div>;

  // --- Looping Logic ---
// --- Mode Detection ---
const dailyLimit = location.state?.dailyLimit;

// If dailyLimit exists → Learning Mode
// If not → Dictionary Mode (show all words)

const sessionWords = dailyLimit
  ? words.slice(0, dailyLimit)
  : words;

// Find current index
const index =
  id === "start"
    ? 0
    : sessionWords.findIndex((w) => String(w.id) === String(id));

const safeIndex = index === -1 ? 0 : index;
const word = sessionWords[safeIndex];

if (!word)
  return <div className="p-10 text-center font-bold">Word not found</div>;

const prevWord =
  sessionWords[(safeIndex - 1 + sessionWords.length) % sessionWords.length];

const nextWord =
  sessionWords[(safeIndex + 1) % sessionWords.length];

const isLast = safeIndex === sessionWords.length - 1;

// Detect mode
const isLearningMode = !!dailyLimit;

const goNext = () => {
    playTapSound();
  
    if (isLearningMode) {
      navigate(`/word/${nextWord.id}`, { state: location.state });
    } else {
      navigate(`/word/${nextWord.id}`);
    }
  };
  
  const goPrev = () => {
    playTapSound();
  
    if (isLearningMode) {
      navigate(`/word/${prevWord.id}`, { state: location.state });
    } else {
      navigate(`/word/${prevWord.id}`);
    }
  };
  


  const sessionMode = localStorage.getItem("sessionMode");
  const isDictionary = localStorage.getItem("dictionaryActive");

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center p-6 pb-32">
      
      {/* 💳 MAIN WORD CARD */}
      <div className="w-full max-w-sm bg-white rounded-[3.5rem] p-8 shadow-2xl shadow-slate-200 border border-slate-50 mt-16 relative transition-all duration-500">
        
        {/* Speak Button */}
        <button 
          onClick={() => speakMandarin(word.Chinese)}
          className={`absolute -top-7 left-1/2 -translate-x-1/2 p-5 rounded-full shadow-xl transition-all active:scale-90 z-10
            ${isSpeaking ? "bg-orange-500 text-white animate-pulse" : "bg-white text-orange-500"}`}
        >
          <Volume2 size={32} />
        </button>

        <div className="mt-6 text-center">
          <h1 className="text-7xl font-black text-slate-800 mb-6 tracking-tighter uppercase">
            {word.Chinese}
          </h1>

          {/* Reveal Meaning Section */}
          <div className="relative bg-slate-50 rounded-3xl p-6 border border-slate-100 min-h-[120px] flex flex-col justify-center items-center group">
             <button 
                onClick={() => { playTapSound(); setRevealWord(!revealWord); }}
                className="absolute top-2 right-2 p-2 text-slate-300 hover:text-orange-400 transition-colors"
             >
               {revealWord ? <EyeOff size={18} /> : <Eye size={18} />}
             </button>

             {revealWord ? (
               <div className="animate-in fade-in zoom-in duration-300">
                 <p className="text-xl font-bold text-orange-500">{word.Pinyin}</p>
                 <p className="text-2xl font-black text-slate-700 mt-1 leading-tight">{word.English}</p>
               </div>
             ) : (
               <p className="text-slate-300 font-bold tracking-widest uppercase text-xs">Tap icon to reveal meaning</p>
             )}
          </div>
        </div>

        {/* 📖 EXAMPLE SENTENCE SECTION */}
        <div className="mt-8 pt-8 border-t border-dashed border-slate-200">
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <BookOpen size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Context</span>
          </div>

          <div className="relative bg-blue-50/50 rounded-2xl p-5 text-left group">
            <button 
                onClick={() => { playTapSound(); setRevealExample(!revealExample); }}
                className="absolute top-2 right-2 p-2 text-blue-200 hover:text-blue-500"
             >
               {revealExample ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            <p className="text-slate-800 font-bold text-lg pr-6">
              {word["Example Sentence (Pinyin)"] || "No example provided."}
            </p>

            {revealExample ? (
              <p className="text-blue-600 font-medium mt-2 animate-in slide-in-from-top-1 duration-300">
                "{word["Example Meaning (English)"]}"
              </p>
            ) : (
              <div className="h-4 w-2/3 bg-blue-100/50 rounded mt-3 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* 🎮 NAVIGATION CONTROLS */}
      <div className="fixed bottom-8 flex items-center gap-4 w-full max-w-sm px-6">
        <button
          onClick={goPrev}
          className="flex-1 bg-white border border-slate-200 py-5 rounded-3xl font-black text-slate-400 
                     flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={goNext}
          className="flex-[2] bg-slate-900 py-5 rounded-3xl font-black text-white 
                     flex items-center justify-center gap-2 active:scale-95 transition-all shadow-2xl shadow-slate-300"
        >
          Next Word <ChevronRight size={24} />
        </button>
      </div>

      {/* 🔙 DICTIONARY BACK BUTTON */}
      {isDictionary && (
        <button
          onClick={() => {
            playTapSound();
            localStorage.removeItem("dictionaryActive");
            navigate("/pinyin");
          }}
          className="fixed top-6 left-6 p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 text-slate-500"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* 🏁 FINISH BUTTON */}
      {isLast && sessionMode === "goal" && (
        <button 
          onClick={() => { 
            playTapSound(); 
            localStorage.removeItem("dailyLimit");
            localStorage.removeItem("currentIndex");
            localStorage.removeItem("todayCompleted");
            localStorage.removeItem("sessionMode");
            localStorage.removeItem("sessionStats");
            navigate("/congrats"); 
          }}
          className="fixed bottom-32 bg-emerald-500 text-white px-10 py-4 rounded-[2rem] font-black 
                     shadow-xl shadow-emerald-200 animate-bounce flex items-center gap-2 z-20"
        >
          <CheckCircle size={22} /> Finish Session
        </button>
      )}
    </div>
  );
}