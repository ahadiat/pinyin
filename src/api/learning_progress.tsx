import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const scriptURL =
  "https://script.google.com/macros/s/AKfycbwkFgG4cvLj5Mt0JV_ADx1VH1K2XAS-ZLrL64lAkudl1u6ePAipzMcd_vLtV0Hnn8ka/exec";

export function useStartLearning() {
  const [count, setCount] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { category } = useParams();

  const startLearning = async () => {
    setLoading(true);

    // Optional: keep sessionMode if needed for Finish button
    localStorage.setItem("sessionMode", "goal");

    // Send to Google Sheet
    const data = new FormData();
    data.append("category", category || "unknown");
    data.append("learned", String(count));
    data.append("total", String(count));

    try {
      await fetch(scriptURL, {
        method: "POST",
        body: data,
      });

      console.log("Saved to sheet");
    } catch (error) {
      console.error("Error saving:", error);
    }

    // 🔥 PASS count via navigation state
    navigate("/word/start", {
      state: {
        dailyLimit: count,
      },
    });
    
    setLoading(false);
  };

  return {
    count,
    setCount,
    loading,
    category,
    startLearning,
  };
}
