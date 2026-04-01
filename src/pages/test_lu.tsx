"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  createGoogleSheet,
  renameGoogleSheet,
  addWordToGoogleSheet,
} from "../../lib/googleSheet";

import {
  getCurrentUser,
  getDecks,
  createDeckRecord,
  renameDeckRecord,
  getDeckById,
  testSupabase,
} from "../../lib/deckService";

// ✅ Use ENV (important)
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
].join(" ");

const DISCOVERY_DOC =
  "https://sheets.googleapis.com/$discovery/rest?version=v4";

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}



export default function GoogleSheetsDeck() {

  const [newWords, setNewWords] = useState<
  Record<
    string,
    {
      word: string;
      meaning: string;
      example: string;
    }
  >
>({});
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [gapiReady, setGapiReady] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [decks, setDecks] = useState<any[]>([]);
  const [newNames, setNewNames] = useState<Record<string, string>>({});


  useEffect(() => {
    testSupabase();
  }, []);

  useEffect(() => {
    const loadDecks = async () => {
      const user = await getCurrentUser();
  
      if (!user) return;
  
      const { data, error } = await getDecks(user.id);
  
      if (!error) {
        setDecks(data || []);
      }
    };
  
    loadDecks();
  }, []);
  



  // =========================
  // Load scripts safely
  // =========================
  useEffect(() => {
    if (!document.getElementById("gapi-script")) {
      const gapiScript = document.createElement("script");
      gapiScript.id = "gapi-script";
      gapiScript.src = "https://apis.google.com/js/api.js";
      gapiScript.async = true;

      gapiScript.onload = () => {
        window.gapi.load("client", async () => {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
          });
          setGapiReady(true);
        });
      };

      document.body.appendChild(gapiScript);
    }

    if (!document.getElementById("gis-script")) {
      const gisScript = document.createElement("script");
      gisScript.id = "gis-script";
      gisScript.src = "https://accounts.google.com/gsi/client";
      gisScript.async = true;

      gisScript.onload = () => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: () => {}, // will override dynamically
        });

        setTokenClient(client);
        setGisReady(true);
      };

      document.body.appendChild(gisScript);
    }
  }, []);

  // =========================
  // Restore connection state
  // =========================
  useEffect(() => {
    const checkConnection = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("google_connected")
        .eq("id", user.id)
        .maybeSingle();

      if (data?.google_connected) {
        setIsGoogleConnected(true);
      }
    };

    checkConnection();
  }, []);

  // =========================
  // Proper token handler
  // =========================
  const getAccessToken = () => {
    return new Promise<void>((resolve, reject) => {
      if (!tokenClient) return reject("No token client");

      tokenClient.callback = async (response: any) => {
        if (response.error) {
          reject(response);
        } else {
          window.gapi.client.setToken(response);
          setIsGoogleConnected(true);

          // save to supabase
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            await supabase
              .from("profiles")
              .update({ google_connected: true })
              .eq("id", user.id);
          }

          resolve();
        }
      };

      tokenClient.requestAccessToken({ prompt: "" });
    });
  };

  const connectGoogle = async () => {
    try {
      await getAccessToken();
    } catch {
      tokenClient?.requestAccessToken({ prompt: "consent" });
    }
  };

  // =========================
  // CREATE DECK
  // =========================
  const createDeck = async () => {
    try {
      setLoading(true);
  
      await getAccessToken();
  
      const user = await getCurrentUser();
  
      if (!user) throw new Error("No user");
  
      const title = "My Flashcard Deck";
  
      const { spreadsheetId, spreadsheetUrl } =
        await createGoogleSheet(title);
  
      await createDeckRecord(
        user.id,
        title,
        spreadsheetId
      );
  
      const { data } = await getDecks(user.id);
      setDecks(data || []);
  
      window.open(spreadsheetUrl, "_blank");
    } catch (err) {
      console.error(err);
      alert("Failed to create deck");
    } finally {
      setLoading(false);
    }
  };
  
  // =========================
  // RENAME DECK
  // =========================
  const renameDeck = async (
    deckId: string,
    newName: string
  ) => {
    try {
      if (!newName.trim()) return;
  
      await getAccessToken();
  
      const { data: deck, error } = await getDeckById(deckId);
  
      if (error || !deck) throw error;
  
      await renameGoogleSheet(deck.gsheet_id, newName);
  
      await renameDeckRecord(deckId, newName);
  
      setDecks((prev) =>
        prev.map((d) =>
          d.id === deckId ? { ...d, name: newName } : d
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to rename deck");
    }
  };
  

  //update

  const addWord = async (deckId: string) => {
    try {
      await getAccessToken();
  
      const { data: deck } = await getDeckById(deckId);
  
      if (!deck) return;
  
      const data = newWords[deckId];
  
      if (!data?.word || !data?.meaning) return;
  
      await addWordToGoogleSheet(
        deck.gsheet_id,
        data.word,
        data.meaning,
        data.example
      );
  
      alert("Word added!");
    } catch (err) {
      console.error(err);
      alert("Failed to add word");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-3xl font-bold">
          Google Sheets Deck App
        </h1>

        {!gapiReady || !gisReady ? (
          <div>Loading Google API...</div>
        ) : !isGoogleConnected ? (
          <button onClick={connectGoogle}>
            Connect Google Sheets
          </button>
        ) : (
          <button onClick={createDeck} disabled={loading}>
            {loading ? "Creating..." : "Create Deck"}
          </button>
        )}

<div className="mt-6 space-y-4">
{decks.map((deck) => (
  <div key={deck.id} className="p-4 border rounded-xl space-y-2">
    
    <div className="font-semibold">{deck.name}</div>

    {/* Rename */}
    <input
      value={newNames[deck.id] || ""}
      onChange={(e) =>
        setNewNames({
          ...newNames,
          [deck.id]: e.target.value,
        })
      }
    />

    <button onClick={() => renameDeck(deck.id, newNames[deck.id])}>
      Rename
    </button>

    {/* ✅ Add word inputs (MOVE HERE) */}
    <input
      placeholder="Word"
      value={newWords[deck.id]?.word || ""}
      onChange={(e) =>
        setNewWords({
          ...newWords,
          [deck.id]: {
            ...newWords[deck.id],
            word: e.target.value,
          },
        })
      }
    />

    <input
      placeholder="Meaning"
      value={newWords[deck.id]?.meaning || ""}
      onChange={(e) =>
        setNewWords({
          ...newWords,
          [deck.id]: {
            ...newWords[deck.id],
            meaning: e.target.value,
          },
        })
      }
    />

    <input
      placeholder="Example"
      value={newWords[deck.id]?.example || ""}
      onChange={(e) =>
        setNewWords({
          ...newWords,
          [deck.id]: {
            ...newWords[deck.id],
            example: e.target.value,
          },
        })
      }
    />

    <button onClick={() => addWord(deck.id)}>
      Add Word
    </button>
  </div>
))}
</div>




      </div>
    </div>
  );
}
