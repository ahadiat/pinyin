import { useEffect, useState } from "react";

const CLIENT_ID = "640627176506-q55u5jk26lesi4q7icsgu8v8ls2q4uhc.apps.googleusercontent.com";
const API_KEY = "AIzaSyDa6bJDeeODmuVs1X4PUDVq-qDTjJ2Uw5Q";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
const DISCOVERY_DOC = "https://sheets.googleapis.com/$discovery/rest?version=v4";

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export default function Lest() {
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [gapiReady, setGapiReady] = useState(false);
  const [gisReady, setGisReady] = useState(false);

  useEffect(() => {
    // Load GAPI script
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

    // Load GIS script
    const script2 = document.createElement("script");
    script2.src = "https://accounts.google.com/gsi/client";
    script2.onload = () => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (resp: any) => {
          if (resp.error) return;
          await listMajors();
        },
      });
      setTokenClient(client);
      setGisReady(true);
    };
    document.body.appendChild(script2);
  }, []);

  const handleAuth = () => {
    tokenClient.requestAccessToken({ prompt: "consent" });
  };

  const listMajors = async () => {
    const res = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      range: "Class Data!A2:E",
    });

    console.log(res.result.values);
  };

  return (
    <div>
      <h1>Google Sheets Test</h1>
      {gapiReady && gisReady && (
        <button onClick={handleAuth}>Authorize</button>
      )}
    </div>
  );
}