import { useRef, useState} from "react";
import { useNavigate } from "react-router-dom";

export default function Congrates() {
  const [started, setStarted] = useState(false);
  const [visibleStars, setVisibleStars] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  const startCelebration = () => {
    setStarted(true);
    audioRef.current?.play().catch(() => {}); // Catch block prevents console errors if audio fails

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleStars(count);
      if (count === 5) clearInterval(interval);
    }, 350); // Slightly slower for more "drama"
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-6 overflow-hidden">
      {/* Background Glow - Subtle depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 to-white -z-10" />

      {/* Audio Source */}
      <audio ref={audioRef} src="/sounds/success.mp3" preload="auto" />

      <div className="relative w-full max-w-sm">
        {!started ? (
          /* PHASE 1: THE TRIGGER */
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
             <div className="relative">
                {/* Ping Ring Effect */}
                <div className="absolute inset-0 animate-ping rounded-full bg-amber-200 opacity-75" />
                
                <button
                  onClick={startCelebration}
                  className="relative text-8xl bg-white shadow-xl rounded-full p-8 
                             hover:scale-110 active:scale-90 transition-all duration-300 
                             border-4 border-white ring-1 ring-slate-100 drop-shadow-2xl"
                >
                  🎁
                </button>
             </div>
             <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Tap to reveal prize</p>
          </div>
        ) : (
          /* PHASE 2: THE CELEBRATION */
          <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] text-center border border-slate-50 animate-in zoom-in-95 duration-300">
            
            {/* ⭐ Staggered Stars */}
            <div className="flex justify-center -space-x-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  style={{ 
                    transitionDelay: `${star * 50}ms`,
                    transform: `rotate(${ (star - 3) * 15 }deg) translateY(${ Math.abs(star - 3) * 10 }px)` 
                  }}
                  className={`transition-all duration-700 ease-out text-5xl sm:text-6xl
                    ${visibleStars >= star 
                      ? "opacity-100 scale-110 translate-y-0" 
                      : "opacity-0 scale-0 translate-y-10"
                    }`}
                >
                  <span className="drop-shadow-[0_10px_10px_rgba(245,158,11,0.4)]">⭐</span>
                </div>
              ))}
            </div>

            {/* Typography with fade-in and slide-up */}
            <div className={`transition-all duration-1000 delay-500 transform 
                            ${visibleStars >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">
                Simply <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                  Magnificent!
                </span>
              </h1>
              
              <p className="text-slate-500 mt-4 font-medium leading-relaxed">
                You’ve mastered this lesson with flying colors. <br />
                Your journey continues!
              </p>
            </div>

            {/* Continue Button - Only appears when stars are done */}
            <button 
  onClick={() => navigate("/")}
  className={`mt-10 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold 
              transition-all duration-700 shadow-lg active:scale-95
              ${visibleStars === 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
>
  Back to Home
</button>

          </div>
        )}
      </div>

      {/* CSS-only Confetti particles (Optional) */}
      {visibleStars === 5 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="animate-ping absolute w-4 h-4 bg-yellow-400 rounded-full translate-x-20 -translate-y-20" />
            <div className="animate-ping absolute w-3 h-3 bg-blue-400 rounded-full -translate-x-32 translate-y-10" />
            <div className="animate-ping absolute w-2 h-2 bg-pink-400 rounded-full translate-x-10 translate-y-32" />
        </div>
      )}
    </div>
  );
}