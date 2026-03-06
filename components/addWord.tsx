import { useState } from "react";
type WordResult = {
  Chinese: string;
  Pinyin: string;
  English: string;
  ExampleSentencePinyin: string;
  ExampleMeaningEnglish: string;
};

export default function AddWord() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WordResult | null>(null);

  const generateWord = async () => {
    if (!input) return;

    setLoading(true);

    const prompt = `
You are a Mandarin dictionary generator.

Return ONLY JSON in this format:
{
  "Chinese": "",
  "Pinyin": "",
  "English": "",
  "ExampleSentencePinyin": "",
  "ExampleMeaningEnglish": ""
}

Word: ${input}
`;

    try {
      // @ts-ignore
      const response = await window.puter.ai.chat(prompt, {
        model: "gpt-5-nano",
      });

      const parsed = JSON.parse(response.message.content);
      setResult(parsed);
    } catch (err) {
      console.error(err);
      alert("AI failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4">Add New Word</h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter English word (e.g. laptop)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded-lg p-2"
          />
          <button
            onClick={generateWord}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {result && (
          <div className="mt-6 space-y-2 text-sm">
            <div><b>Chinese:</b> {result.Chinese}</div>
            <div><b>Pinyin:</b> {result.Pinyin}</div>
            <div><b>English:</b> {result.English}</div>
            <div><b>Example (Pinyin):</b> {result.ExampleSentencePinyin}</div>
            <div><b>Example Meaning:</b> {result.ExampleMeaningEnglish}</div>
          </div>
        )}
      </div>
    </div>
  );
}