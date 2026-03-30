import { useEffect, useState } from "react";

const CLIENT_ID = "640627176506-q55u5jk26lesi4q7icsgu8v8ls2q4uhc.apps.googleusercontent.com";
const API_KEY = "AIzaSyDa6bJDeeODmuVs1X4PUDVq-qDTjJ2Uw5Q";

// IMPORTANT: allow write access
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file"
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load GAPI
    const script1 = document.createElement("script");
    script1.src = "https://apis.google.com/js/api.js";
    script1.onload = () => {
      window.gapi.load("client", async () => {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        setGapiReady(true);
      });
    };
    document.body.appendChild(script1);

    // Load Google Identity Services
    const script2 = document.createElement("script");
    script2.src = "https://accounts.google.com/gsi/client";
    script2.onload = () => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (resp: any) => {
          if (resp.error) {
            console.error(resp);
            return;
          }
          setIsAuthenticated(true);
        },
      });
      setTokenClient(client);
      setGisReady(true);
    };
    document.body.appendChild(script2);
  }, []);

  // Step 1: Login
  const handleAuth = () => {
    tokenClient.requestAccessToken({ prompt: "consent" });
  };

  // Step 2: Create a new deck (Google Sheet)
  const createDeck = async () => {
    try {
      const response =
        await window.gapi.client.sheets.spreadsheets.create({
          properties: {
            title: "My Flashcard Deck",
          },
          sheets: [
            {
              properties: {
                title: "Deck 1",
              },
            },
          ],
        });

      const spreadsheetId = response.result.spreadsheetId;

      console.log("Created Sheet ID:", spreadsheetId);

      // Add headers
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Deck 1!A1:C1",
        valueInputOption: "RAW",
        resource: {
          values: [["Word", "Meaning", "Example"]],
        },
      });

      alert("Deck created successfully!");

    } catch (error) {
      console.error("Error creating deck:", error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Flashcard Deck (Google Sheets)</h1>

      {gapiReady && gisReady && !isAuthenticated && (
        <button onClick={handleAuth}>
          Connect Google
        </button>
      )}

      {isAuthenticated && (
        <button onClick={createDeck}>
          Create New Deck
        </button>
      )}
    </div>
  );
}