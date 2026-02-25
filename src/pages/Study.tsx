import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getWords } from "../api/googlesheet";
import type { Word } from "../api/googlesheet";
import { Search, BookOpen, ChevronRight, Loader2, X } from "lucide-react";

export default function WordList() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getWords().then((data) => {
      setWords(data);
      setLoading(false);
    });
  }, []);
  
  useEffect(() => {
    localStorage.setItem("dictionaryActive", "true");
  }, []);
  
  

  // Optimized Search Logic
  const filteredWords = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return words.filter(
      (w) =>
        w.Chinese.toLowerCase().includes(query) ||
        w.Pinyin.toLowerCase().includes(query) ||
        w.English.toLowerCase().includes(query)
    );
  }, [searchQuery, words]);

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* --- Sticky Header & Search --- */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 shadow-sm">
        <div className="max-w-2xl mx-auto">
        <button className="bg-blue-200 hover:text-white hover:bg-blue-500 p-2 m-2 rounded-xl"
  onClick={() => {
    localStorage.removeItem("dictionaryActive");
    navigate("/");
  }}
>
  Back
</button>

          <div className="flex items-center justify-between mb-4">

            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <BookOpen className="text-blue-500" size={28} />
              Dictionary
            </h1>
            <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
              {filteredWords.length} Words
            </span>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search Chinese, Pinyin, or English..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-slate-700 font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {loading ? (
          /* --- Loading State --- */
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-medium animate-pulse">Loading your vocabulary...</p>
          </div>
        ) : filteredWords.length > 0 ? (
          /* --- Word Grid --- */
          <div className="grid gap-3">
            {filteredWords.map((w) => (
              <Link 
                key={w.id} 
                to={`/word/${w.id}`}
                className="group flex items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm active:scale-[0.98] hover:shadow-md transition-all"
              >
                {/* Chinese Character Circle */}
                <div className="h-14 w-14 flex-shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  {w.Chinese[0]} 
                </div>

                <div className="ml-4 flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-800">{w.Chinese}</h3>
                    <span className="text-sm font-medium text-slate-400 italic truncate">
                      {w.Pinyin}
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium truncate leading-tight">
                    {w.English}
                  </p>
                </div>

                <ChevronRight className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </Link>
            ))}
          </div>
        ) : (
          /* --- Empty State --- */
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-800">No words found</h3>
            <p className="text-slate-500 mt-1">Try searching for something else!</p>
          </div>
        )}
      </main>
    </div>
  );
}