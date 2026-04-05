import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getDecksByType, renameDeck } from "../../lib/deckService";


type Deck = {
    id: string;
    user_id: string;
    name: string;
    gsheet_id: string;
    type: string;
    created_at: string;
  };
  
  

export default function DeckPage() {
  const { type } = useParams(); // "word" or "phrase"

  const [user, setUser] = useState<any>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
const [newNames, setNewNames] = useState<Record<string, string>>({});


  // ✅ Get user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();
  }, []);

  // ✅ Fetch decks by type
  useEffect(() => {
    if (!user || !type) return;

    const loadDecks = async () => {
      const { data, error } = await getDecksByType(user.id, type);

      if (!error) {
        setDecks(data || []);
      }
    };

    loadDecks();
  }, [user, type]);

  // ✏️ Rename handler
  const handleRename = async (deckId: string) => {
    const newName = newNames[deckId]?.trim();
  
    if (!newName) {
      alert("Name cannot be empty");
      return;
    }
  
    const currentDeck = decks.find(d => d.id === deckId);
    if (currentDeck?.name === newName) return;
  
    const { error } = await renameDeck(deckId, newName);
  
    if (error) {
      console.error("Rename failed:", error);
      alert("Rename failed or not allowed");
      return;
    }
  
    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === deckId ? { ...deck, name: newName } : deck
      )
    );
  
    setNewNames((prev) => ({
      ...prev,
      [deckId]: "",
    }));
  };
  

  // 📋 Copy gsheet_id
  const copySheetId = (id: string) => {
    navigator.clipboard.writeText(id);
    alert("Copied!");
  };

  if (!user) return <div>Please login</div>;

  return (
    <div className="p-6 space-y-4">

      <h1 className="text-2xl font-bold capitalize">
        {type} Decks
      </h1>

      {decks.map((deck) => (
        <div key={deck.id} className="p-4 border rounded-xl space-y-2">

          {/* Name */}
          <div className="font-semibold">{deck.name}</div>

          {/* Rename */}
          <input
            placeholder="New name"
            value={newNames[deck.id] || ""}
            onChange={(e) =>
              setNewNames({
                ...newNames,
                [deck.id]: e.target.value,
              })
            }
          />

          <button onClick={() => handleRename(deck.id)}>
            Rename
          </button>

          {/* Copy Sheet ID */}
          <button onClick={() => copySheetId(deck.gsheet_id)}>
            Copy Sheet ID
          </button>

          {/* View (Google Sheets) */}
          <a
            href={`https://docs.google.com/spreadsheets/d/${deck.gsheet_id}`}
            target="_blank"
          >
            View Sheet
          </a>

          {/* Optional: Go to detail page */}
          {/* <Link to={`/deck/view/${deck.id}`}>Open Deck</Link> */}

        </div>
      ))}

    </div>
  );
}
