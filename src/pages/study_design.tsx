import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getWords, type Word } from "../api/googlesheet";
import { Volume2, Eye, Heart, Info, ArrowUp, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [words, setWords] = useState<Word[]>([]);
  const [reveal, setReveal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  useEffect(() => {
    getWords().then(setWords);
    setReveal(false);
  }, [id]);

  // Logic to find current word
  const dailyLimit = location.state?.dailyLimit;
  const sessionWords = dailyLimit ? words.slice(0, dailyLimit) : words;
  const index = sessionWords.findIndex((w) => String(w.id) === String(id));
  const safeIndex = index === -1 ? 0 : index;
  const word = sessionWords[safeIndex];
  const nextWord = sessionWords[(safeIndex + 1) % sessionWords.length];

  // --- Actions ---
  const goNext = () => navigate(`/word/${nextWord.id}`, { state: location.state });
  
  const handleSkip = () => {
    console.log("Marked for review system...");
    goNext();
  };

  const handleLearnMore = () => {
    navigate(`/details/${word.id}`); 
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      setIsFavorite(!isFavorite);
    }
    setLastTap(now);
  };

  // --- Gesture Handler ---
  const handleDragEnd = (event: any, info: any) => {
    const threshold = 100;
    
    // 1. Swipe Up -> Next
    if (info.offset.y < -threshold) {
      goNext();
    }
    // 2. Swipe Left -> Learn More
    else if (info.offset.x < -threshold) {
      handleLearnMore();
    }
    // 3. Swipe Right -> Skip/Review
    else if (info.offset.x > threshold) {
      handleSkip();
    }
  };

  if (!word) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center p-6 overflow-hidden touch-none select-none">
      
      {/* CARD SECTION */}
      <AnimatePresence mode="wait">
        <motion.div
          key={word.id}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          onClick={handleDoubleTap}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="w-full max-w-sm bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200 border border-slate-100 mt-20 relative cursor-grab active:cursor-grabbing"
        >
          {/* Favorite Pop-up */}
          {isFavorite && (
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1.2 }} 
              className="absolute top-10 right-10 text-red-500"
            >
              <Heart fill="currentColor" size={32} />
            </motion.div>
          )}

          <div className="text-center py-10">
            <h1 className="text-8xl font-black text-slate-800 mb-8">{word.Chinese}</h1>
            
            <div className="min-h-[120px] flex flex-col items-center justify-center">
              {reveal ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <p className="text-2xl font-bold text-orange-500">{word.Pinyin}</p>
                  <p className="text-3xl font-black text-slate-700 mt-2">{word.English}</p>
                </motion.div>
              ) : (
                <div className="px-6 py-2 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 tracking-widest">
                  HIDDEN
                </div>
              )}
            </div>
          </div>

          {/* Gesture Hints (Subtle) */}
          <div className="mt-10 pt-10 border-t border-slate-50 flex justify-between text-slate-300">
             <ArrowLeft size={18} />
             <ArrowUp size={18} />
             <ArrowRight size={18} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* FLOATING REVEAL BUTTON */}
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => setReveal(!reveal)}
        className={`fixed bottom-12 right-10 p-6 rounded-full shadow-2xl z-50 transition-all
          ${reveal ? "bg-slate-800 text-white" : "bg-orange-500 text-white"}`}
      >
        <Eye size={32} />
      </motion.button>

      {/* TOOLTIP FOR USER */}
      <div className="fixed bottom-6 flex gap-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">
        <span>Left: Detail</span>
        <span>Up: Next</span>
        <span>Right: Skip</span>
      </div>

    </div>
  );
}