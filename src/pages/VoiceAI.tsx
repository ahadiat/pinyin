import { useState, useRef, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";

export default function VoiceChat({ user }: { user: User }) {
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [messages, setMessages] = useState<{ role: "user" | "ai" | "error"; content: string }[]>([]);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // --- Speech Recognition Setup ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessages((prev) => [...prev, { role: "user", content: transcript }]);
        await sendToBackend(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (!recognitionRef.current || isAiSpeaking) return;
    setIsListening(true);
    setTimeLeft(5);
    recognitionRef.current.start();

    timerRef.current = window.setInterval(() => {
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
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
  }, []);

  // --- Backend & Audio Logic ---
  const sendToBackend = async (message: string) => {
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, userId: user.id }),
      });

      if (res.status === 429) {
        throw new Error("AI is exhausted! (Token limit reached). Please try again later.");
      }

      const data = await res.json();
      if (data.reply) setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
      
      if (data.audio) {
        const url = `data:audio/wav;base64,${data.audio}`;
        setCurrentAudioUrl(url);
        playAudio(url);
      }
    } catch (error: any) {
      setMessages((prev) => [...prev, { role: "error", content: error.message || "Connection failed" }]);
    }
  };

  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onplay = () => setIsAiSpeaking(true);
    audio.onended = () => setIsAiSpeaking(false);
    audio.play();
  };

  return (
    <div className="flex flex-col items-center justify-between h-screen bg-[#0a0a0a] text-neutral-100 p-8 font-sans overflow-hidden">
      
      {/* 1. Dynamic Orb with "Beat" Animation */}
      <div className="relative flex items-center justify-center flex-1 w-full">
        <div className={`
          relative w-56 h-56 rounded-full transition-all duration-700
          ${isAiSpeaking ? 'animate-ai-pulse bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_100px_rgba(16,185,129,0.3)]' : 'bg-white/5 border-white/10'}
          ${isListening ? 'scale-110 border-red-500/50 bg-red-500/10 shadow-[0_0_100px_rgba(239,68,68,0.2)]' : ''}
          flex items-center justify-center border
        `}>
          {/* Visualizer bars for AI Speaking (The "Beat") */}
          {isAiSpeaking && (
             <div className="flex gap-1 items-center">
                {[1, 2, 3, 2, 1].map((_, i) => (
                  <div key={i} className="w-1 bg-emerald-400 animate-ai-bars" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
             </div>
          )}
          <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isAiSpeaking ? 'bg-emerald-400 shadow-[0_0_20px_#34d399]' : 'bg-neutral-700'}`} />
        </div>
      </div>

      {/* 2. Message Feed & Error Handling */}
      <div className="w-full max-w-sm mb-8">
        <div className="h-32 overflow-y-auto space-y-4 px-4 no-scrollbar">
          {messages.slice(-3).map((msg, i) => (
            <div key={i} className={`text-sm ${
              msg.role === 'user' ? 'text-neutral-500 text-right' : 
              msg.role === 'error' ? 'text-red-400 text-center bg-red-500/10 py-1 rounded' : 'text-emerald-400 font-medium'
            }`}>
               {msg.content}
            </div>
          ))}
        </div>

        {/* 3. Interaction & Replay */}
        <div className="flex flex-col items-center gap-6 mt-4">
          <div className="flex items-center gap-8">
            {/* Replay Button (Only shows if there is an audio URL) */}
            <button 
              onClick={() => currentAudioUrl && playAudio(currentAudioUrl)}
              disabled={!currentAudioUrl || isAiSpeaking}
              className={`p-3 rounded-full border border-white/10 transition-all ${!currentAudioUrl ? 'opacity-0' : 'opacity-100 hover:bg-white/10'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            <button
              onPointerDown={startListening}
              onPointerUp={stopListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 scale-90' : 'bg-white'}`}
            >
              {isListening ? <div className="w-6 h-6 bg-white rounded-sm" /> : <div className="w-6 h-6 bg-black rounded-full" />}
            </button>

            <div className="w-11" /> {/* Spacer to center the main button */}
          </div>
          <p className="text-[10px] tracking-widest text-neutral-500 uppercase font-bold">
  {isListening ? `Listening... ${timeLeft}s` : "Hold to Talk"}
</p>
        </div>
      </div>

      {/* Custom Styles for Beat Animation */}
      <style>{`
        @keyframes ai-pulse {
          0%, 100% { transform: scale(1); border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
          50% { transform: scale(1.05); border-radius: 60% 40% 30% 70% / 50% 60% 40% 60%; }
        }
        @keyframes ai-bars {
          0%, 100% { height: 8px; }
          50% { height: 24px; }
        }
        .animate-ai-pulse { animation: ai-pulse 2s infinite ease-in-out; }
        .animate-ai-bars { animation: ai-bars 0.6s infinite ease-in-out; }
      `}</style>
    </div>
  );
}