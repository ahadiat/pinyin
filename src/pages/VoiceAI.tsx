import { useState, useRef, useEffect, useCallback } from "react";

export default function VoiceChat() {
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);

  const recognitionRef = useRef<any>(null);
  // Use 'number' instead of 'NodeJS.Timeout'
const timerRef = useRef<number | null>(null);

// When starting the timer, use window.setInterval to be explicit
timerRef.current = window.setInterval(() => {
  setTimeLeft((prev) => {
    if (prev <= 1) {
      stopListening();
      return 0;
    }
    return prev - 1;
  });
}, 1000);

// When clearing
if (timerRef.current) window.clearInterval(timerRef.current);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
      recognition.interimResults = false;
      recognition.continuous = false; // Set to false for cleaner 5s bursts

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessages((prev) => [...prev, { role: "user", content: transcript }]);
        await sendToBackend(transcript);
      };

      recognition.onend = () => stopListening();
      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (!recognitionRef.current || isAiSpeaking) return;
    
    setIsListening(true);
    setTimeLeft(5);
    recognitionRef.current.start();

    // 5 Second Safety Timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopListening();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopListening = useCallback(() => {
    setIsListening(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
  }, []);

  const sendToBackend = async (message: string) => {
    try {
      const res = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (data.reply) setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
      if (data.audio) playAudio(data.audio);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const playAudio = (base64: string) => {
    const audio = new Audio(`data:audio/wav;base64,${base64}`);
    audio.onplay = () => setIsAiSpeaking(true);
    audio.onended = () => setIsAiSpeaking(false);
    audio.play();
  };

  return (
    <div className="flex flex-col items-center justify-between h-screen bg-[#0a0a0a] text-neutral-100 p-8 font-sans selection:bg-emerald-500/30">
      
      {/* Status Header */}
      <header className="w-full max-w-lg flex justify-between items-center transition-opacity duration-500">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isAiSpeaking ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-600'}`} />
          <h1 className="text-sm font-medium tracking-widest uppercase text-neutral-400">Mandarin AI</h1>
        </div>
        <div className="text-xs font-mono text-neutral-500">
          {isListening ? `RECORDING · 0:0${timeLeft}` : "IDLE"}
        </div>
      </header>

      {/* Hero Visualizer */}
      <div className="relative flex items-center justify-center flex-1 w-full max-w-md">
        {/* The "Neural" Orb */}
        <div className={`
          relative w-48 h-48 rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] transition-all duration-1000 ease-in-out border border-white/10
          ${isAiSpeaking ? 'bg-emerald-500/20 shadow-[0_0_80px_rgba(16,185,129,0.2)] animate-blob' : 'bg-white/5'}
          ${isListening ? 'scale-110 border-red-500/50 bg-red-500/10 shadow-[0_0_80px_rgba(239,68,68,0.2)]' : ''}
          flex items-center justify-center overflow-hidden
        `}>
          {/* Waveform Bars (Only visible when listening) */}
          {isListening && (
            <div className="flex items-end gap-1.5 h-12">
              {[0.1, 0.3, 0.2, 0.4, 0.1].map((delay, i) => (
                <div 
                  key={i} 
                  className="w-1.5 bg-red-500 rounded-full animate-sound" 
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          )}

          {/* Glowing Center Core */}
          <div className={`w-4 h-4 rounded-full transition-all duration-500 ${isAiSpeaking ? 'bg-emerald-400 shadow-[0_0_20px_#34d399]' : isListening ? 'bg-red-500 shadow-[0_0_20px_#ef4444]' : 'bg-neutral-700'}`} />
        </div>

        {/* Outer Glow Ring */}
        <div className={`absolute w-64 h-64 rounded-full border border-white/5 transition-all duration-1000 ${isAiSpeaking || isListening ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
      </div>

      {/* Message Feed (Minimalist) */}
      <div className="w-full max-w-sm flex flex-col gap-4 mb-12">
        <div className="h-24 overflow-y-auto space-y-4 px-2 scroll-smooth no-scrollbar">
          {messages.slice(-2).map((msg, i) => (
            <div key={i} className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-neutral-500 text-right' : 'text-emerald-400 text-left font-medium'}`}>
               {msg.content}
            </div>
          ))}
        </div>

        {/* Interaction Button */}
        <div className="flex flex-col items-center gap-6">
          <button
            onPointerDown={startListening}
            onPointerUp={stopListening}
            onContextMenu={(e) => e.preventDefault()}
            className={`
              relative group w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 touch-none outline-none
              ${isListening ? 'bg-red-500 scale-95' : 'bg-white hover:bg-emerald-400'}
            `}
          >
            {/* Pulsing Outer Ring (Button Only) */}
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25" />
            )}
            
            <svg 
              className={`w-8 h-8 transition-colors duration-300 ${isListening ? 'text-white' : 'text-black'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
            >
              {isListening ? (
                <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              )}
            </svg>
          </button>
          
          <p className="text-[10px] tracking-[0.2em] text-neutral-600 font-bold uppercase">
            {isListening ? "Release to Send" : "Hold to Speak"}
          </p>
        </div>
      </div>
    </div>
  );
}