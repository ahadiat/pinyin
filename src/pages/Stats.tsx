import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Profile() {
  const [userEmail, setUserEmail] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUser();
    loadKeys();
  }, []);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUserEmail(data.user.email || "");
    }
  }

  async function loadKeys() {
    const { data: session } = await supabase.auth.getSession();

    if (!session.session) return;

    const res = await fetch("http://localhost:5001/api/keys", {
      headers: {
        Authorization: `Bearer ${session.session.access_token}`
      }
    });

    const data = await res.json();

    if (data) {
      setGeminiKey(data.gemini_key || "");
      setOpenrouterKey(data.openrouter_key || "");
    }
  }

  async function saveKeys() {
    const { data: session } = await supabase.auth.getSession();

    if (!session.session) return;

    const res = await fetch("http://localhost:5001/api/save-keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.session.access_token}`
      },
      body: JSON.stringify({
        geminiKey,
        openrouterKey
      })
    });

    const data = await res.json();

    setMessage(data.message || "Saved!");
  }

  return (
    <div style={{ padding: "40px", maxWidth: "500px", margin: "auto" }}>
      <h2>Profile</h2>

      <div style={{ marginBottom: "20px" }}>
        <strong>Email:</strong>
        <div>{userEmail}</div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>Gemini API Key</label>
        <input
          type="text"
          value={geminiKey}
          onChange={(e) => setGeminiKey(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>OpenRouter API Key</label>
        <input
          type="text"
          value={openrouterKey}
          onChange={(e) => setOpenrouterKey(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <button onClick={saveKeys}>Save Keys</button>

      {message && <p>{message}</p>}
    </div>
  );
}