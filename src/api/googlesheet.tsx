import Papa from "papaparse";

export type Word = {
  id: number;
  Chinese: string;
  Pinyin: string;
  English: string;
  "Example Sentence (Pinyin)": string;
  "Example Meaning (English)": string;
};

const URL =
  "https://docs.google.com/spreadsheets/d/1USwIj9Q1VoFIRCqPEKSnsdw2UVGGjSIZmZY4NfCwTn0/export?format=csv&gid=1112890738";

export async function getWords(): Promise<Word[]> {
  try {
    const res = await fetch(URL);
    if (!res.ok) throw new Error("Failed to fetch words");

    const text = await res.text();

    const { data } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

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