import { useEffect, useState } from "react";

export default function LocalStorageViewer() {
  const [storage, setStorage] = useState<{ key: string; value: string }[]>([]);

  const loadStorage = () => {
    const items: { key: string; value: string }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        items.push({
          key,
          value: localStorage.getItem(key) || "",
        });
      }
    }

    setStorage(items);
  };

  useEffect(() => {
    loadStorage();
  }, []);

  const clearAll = () => {
    localStorage.clear();
    loadStorage();
  };

  const refresh = () => {
    loadStorage();
  };

  return (
    <div className="min-h-screen p-8 bg-slate-100">
      <h1 className="text-3xl font-black mb-6">LocalStorage Debug</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={refresh}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>

        <button
          onClick={clearAll}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Clear All
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        {storage.length === 0 ? (
          <p>No localStorage data found.</p>
        ) : (
          <ul className="space-y-3">
            {storage.map((item) => (
              <li
                key={item.key}
                className="border-b pb-2"
              >
                <strong>{item.key}</strong>
                <div className="text-slate-600 break-all">
                  {item.value}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
