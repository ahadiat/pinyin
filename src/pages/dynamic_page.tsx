import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getDecksByType } from "../../lib/deckService";


export default function DeckPage() {
  const [user, setUser] = useState<any>(null);
  const [wordDecks, setWordDecks] = useState<any[]>([]);
  const [phraseDecks, setPhraseDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Get user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("USER:", user);
      setUser(user);
    };

    getUser();
  }, []);

  // ✅ Fetch decks AFTER user exists
  useEffect(() => {
    if (!user) return;

    const loadDecks = async () => {
      setLoading(true);

      const { data: words } = await getDecksByType(user.id, "word");
      const { data: phrases } = await getDecksByType(user.id, "phrase");

      setWordDecks(words || []);
      setPhraseDecks(phrases || []);

      setLoading(false);
    };

    loadDecks();
  }, [user]);

  if (!user) return <div>Please login</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-8">
      
      {/* WORDS */}
      <div>
        <h2 className="text-xl font-bold mb-4">📘 Word Decks</h2>

        {wordDecks.length === 0 ? (
          <p>No word decks</p>
        ) : (
          wordDecks.map((deck) => (
            <div key={deck.id} className="p-4 border rounded-xl mb-2">
              {deck.name}
            </div>
          ))
        )}
      </div>

      {/* PHRASES */}
      <div>
        <h2 className="text-xl font-bold mb-4">💬 Phrase Decks</h2>

        {phraseDecks.length === 0 ? (
          <p>No phrase decks</p>
        ) : (
          phraseDecks.map((deck) => (
            <div key={deck.id} className="p-4 border rounded-xl mb-2">
              {deck.name}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
