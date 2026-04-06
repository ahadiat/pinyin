"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
    renameGoogleSheet,
    addWordToGoogleSheet,
  } from "../../lib/googleSheet";
  
  import {
    getDeckById,
    testSupabase,
  } from "../../lib/deckService";
  import { useParams } from "react-router-dom";

// ✅ Use ENV (important)
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string
const { type } = useParams();

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



export default function GoogleSheetsAdd() {

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
 
  const [decks, setDecks] = useState<any[]>([]);
  const [newNames, setNewNames] = useState<Record<string, string>>({});
  


  useEffect(() => {
    testSupabase();
  }, []);

  useEffect(() => {
    let ignore = false;
  
    const loadDecks = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      console.log("USER:", user);
  
      if (!user) return;
  
      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("user_id", user.id);
  
      console.log("DECKS:", data);
      console.log("ERROR:", error);
  
      if (!ignore) {
        if (error) {
          console.error(error);
        } else {
          setDecks(data || []);
        }
      }
    };
  
    loadDecks();
  
    return () => {
      ignore = true;
    };
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
  <button
    className="rounded-lg bg-black px-4 py-2 text-white"
    onClick={connectGoogle}
  >
    Connect Google Sheets
  </button>
) : (
  <div className="rounded-lg bg-green-100 p-3 text-green-700">
    Google Sheets Connected
  </div>
)}

<div className="mt-6 space-y-4 bg-amber-500">
<h1 className="mb-2 text-3xl font-bold">
  {type === "phrases" ? "Phrase Decks" : "Word Decks"}
</h1>
<div>Deck count: {decks.length}</div>

{decks
  .filter((deck) => {
    if (!type) return true;
    return deck.type === type;
  })
  .map((deck) => (
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
