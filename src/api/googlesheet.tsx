

export type Word = {
  id: number;
  Chinese: string;
  Pinyin: string;
  English: string;
  "Example Sentence (Pinyin)": string;
  "Example Meaning (English)": string;
};

const URL =
  "https://script.google.com/macros/s/AKfycbwK4Zomdp8zsUJGlOg4gg5gZY03kNMiX9uzm3EL2P51jlSoUG7dFjCEnAdnNJ4tkLNRtA/exec";

  export async function getWords(): Promise<Word[]> {
    try {
      const res = await fetch(URL);
      if (!res.ok) throw new Error("Failed to fetch words");
  
      const data = await res.json();
  
      return (data as any[]).map((row) => ({
        id: Number(row.id),
        Chinese: row.Chinese ?? "",
        Pinyin: row.Pinyin ?? "",
        English: row.English ?? "",
        "Example Sentence (Pinyin)":
          row["Example Sentence (Pinyin)"] ?? "",
        "Example Meaning (English)":
          row["Example Meaning (English)"] ?? "",
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }