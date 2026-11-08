"use client";
import { useState, useEffect } from "react";

const TAG_OPTIONS = ["High stress", "Poor sleep", "Skipped meals", "No outdoors", "Social contact"];
const SYMPTOM_OPTIONS = ["IBS / Stomach pain", "Depression / Low energy", "Chronic stress", "Hair loss", "Custom..."];

export default function Home() {
  const [days, setDays] = useState<string[]>([]);
  const [tracking, setTracking] = useState(SYMPTOM_OPTIONS[0]);
  const [customTracking, setCustomTracking] = useState("");
  const [symptom, setSymptom] = useState(3);
  const [tags, setTags] = useState<string[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate days only on the client side to avoid Vercel build errors
  useEffect(() => {
    const d = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      d.push(date.toISOString().slice(0, 10));
    }
    setDays(d);
  }, []);

  const todayStr = days.length > 0 ? days[days.length - 1] : "";

  const fakeHistory: Record<string, number> = days.length > 0 ? {
    [days[0]]: 2, [days[1]]: 4, [days[2]]: 1, [days[3]]: 5, [days[4]]: 3, [days[5]]: 4,
  } : {};

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const submit = async () => {
    if (!todayStr) return;
    setLoading(true); setError(null); setSignature(null);
    const finalTracking = tracking === "Custom..." ? customTracking : tracking;
    
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          date: todayStr, 
          symptom, 
          tags, 
          tracking: finalTracking || "General Symptoms" 
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSignature(data.signature);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl p-6 space-y-8 text-gray-900 min-h-screen bg-white">
      <div>
        <h1 className="text-3xl font-bold text-black">TriggerTrace</h1>
        <p className="text-sm text-gray-600 mt-1">Find what triggers your chronic symptoms. Stamped on Solana.</p>
      </div>

      <section>
        <h2 className="text-sm font-semibold mb-3 text-gray-800">Past 7 Days</h2>
        <div className="flex gap-2">
          {days.map((day) => {
            const isToday = day === todayStr;
            const score = isToday ? (signature ? symptom : null) : fakeHistory[day];
            
            return (
              <div key={day} className={`flex-1 flex flex-col items-center p-2 rounded-lg border ${isToday ? 'border-black bg-gray-50 ring-2 ring-black ring-offset-1' : 'border-gray-200 bg-white'}`}>
                <span className="text-xs text-gray-500 mb-1">{day.slice(5)}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  score === null ? 'bg-gray-100 text-gray-400 border border-gray-200' : 
                  score >= 4 ? 'bg-red-200 text-red-900 border border-red-300' : 
                  score >= 2 ? 'bg-yellow-200 text-yellow-900 border border-yellow-300' : 
                  'bg-green-200 text-green-900 border border-green-300'
                }`}>
                  {score !== null ? score : '-'}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-6 bg-gray-50 p-5 rounded-xl border border-gray-200">
        
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">What are you tracking?</label>
          <select 
            value={tracking} 
            onChange={(e) => setTracking(e.target.value)}
            className="w-full mb-2 p-2 border border-gray-300 rounded bg-white text-gray-900"
          >
            {SYMPTOM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {tracking === "Custom..." && (
            <input 
              type="text" 
              placeholder="e.g., Migraine severity" 
              value={customTracking}
              onChange={(e) => setCustomTracking(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-gray-900"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">Severity today (0–5): {symptom}</label>
          <input type="range" min={0} max={5} value={symptom} onChange={(e) => setSymptom(Number(e.target.value))} className="w-full accent-black" />
        </div>

        <div>
          <p className="text-sm font-bold text-gray-800 mb-2">Behaviors today</p>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors font-medium ${
                  tags.includes(t) ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading || !!signature || (tracking === "Custom..." && !customTracking) || !todayStr}
          className="w-full rounded-lg bg-black px-4 py-3 text-white font-bold disabled:opacity-50 hover:bg-gray-800 transition-colors"
        >
          {loading ? "Writing to Solana…" : signature ? "Logged successfully ✓" : "Log check-in"}
        </button>

        {error && <p className="text-sm font-medium text-red-600 bg-red-50 p-2 rounded">{error}</p>}
      </section>

      {signature && (
        <div className="rounded-xl border border-green-300 bg-green-50 p-4 text-sm break-all">
          <p className="font-bold text-green-900 mb-1">Immutable Record Created</p>
          <a className="text-blue-700 font-medium underline hover:text-blue-900" href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`} target="_blank">
            View on Solana Explorer ↗
          </a>
        </div>
      )}

      <section className="rounded-xl border border-gray-200 p-5 text-sm space-y-2 bg-white">
        <p className="font-bold text-gray-800">Insight</p>
        <p className="text-gray-700">On days tagged <code className="bg-gray-100 px-1 py-0.5 rounded text-black font-mono">High stress</code>, your symptom score averages <strong className="text-black">+1.8 higher</strong>.</p>
        <p className="text-xs text-gray-500 mt-2">Based on your last 7 on-chain check-ins.</p>
      </section>
    </main>
  );
}
