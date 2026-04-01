"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

// ✅ Use ENV (important)
const CLIENT_ID = import.meta.env.CLIENT_ID as string
const API_KEY = import.meta.env.API_KEY as string

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
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [gapiReady, setGapiReady] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(false);

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
        .single();

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
      if (!gapiReady) {
        alert("Google API not ready");
        return;
      }
  
      setLoading(true);
      await getAccessToken();
  
      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      if (!user) throw new Error("User not logged in");
  
      const res =
        await window.gapi.client.sheets.spreadsheets.create({
          properties: { title: "My Flashcard Deck" },
        });
  
      const spreadsheetId = res.result.spreadsheetId;
  
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "A1:C1",
        valueInputOption: "RAW",
        resource: {
          values: [["Word", "Meaning", "Example"]],
        },
      });
  
      // ✅ FIXED INSERT
      await supabase.from("decks").insert({
        user_id: user.id,
        name: "My Flashcard Deck",      // ✅ correct column
        gsheet_id: spreadsheetId,       // ✅ correct column
        type: "google_sheet",           // optional but good
      });
  
      window.open(res.result.spreadsheetUrl, "_blank");
    } catch (err) {
      console.error(err);
      alert("Failed to create deck.");
    } finally {
      setLoading(false);
    }
  };
  
  // =========================
  // RENAME DECK
  // =========================
  const renameDeck = async (deckId: string, newName: string) => {
    try {
      if (!gapiReady) {
        alert("Google API not ready");
        return;
      }
  
      const { data: deck, error } = await supabase
        .from("decks")
        .select("gsheet_id") // ✅ correct column
        .eq("id", deckId)
        .single();
  
      if (error || !deck) throw error;
  
      await getAccessToken();
  
      await window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: deck.gsheet_id, // ✅ correct
        resource: {
          requests: [
            {
              updateSpreadsheetProperties: {
                properties: { title: newName },
                fields: "title",
              },
            },
          ],
        },
      });
  
      // ✅ update YOUR column
      await supabase
        .from("decks")
        .update({ name: newName }) // ✅ correct column
        .eq("id", deckId);
  
      alert("Deck renamed successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to rename deck.");
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
      </div>
    </div>
  );
}
