"use client";
import { useState } from "react";

const TAG_OPTIONS = ["high_stress", "poor_sleep", "skipped_meals", "no_outdoors", "social_contact"];

export default function Home() {
  const [symptom, setSymptom] = useState(3);
  const [tags, setTags] = useState<string[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const submit = async () => {
    setLoading(true);
    setError(null);
    setSignature(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          symptom,
          tags,
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
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">TriggerTrace</h1>
      <p className="text-sm text-gray-600">
        Log today's symptom and behaviors. Each entry is stamped on Solana Devnet.
      </p>

      <section className="space-y-2">
        <label className="block text-sm font-medium">Symptom severity (0–5): {symptom}</label>
        <input
          type="range"
          min={0}
          max={5}
          value={symptom}
          onChange={(e) => setSymptom(Number(e.target.value))}
          className="w-full"
        />
      </section>

      <section className="space-y-2">
        <p className="text-sm font-medium">Behaviors today</p>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={`rounded-full border px-3 py-1 text-sm ${
                tags.includes(t) ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={submit}
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Writing to Solana…" : "Log check-in"}
      </button>

      {signature && (
        <div className="rounded border p-3 text-sm break-all">
          <p className="font-medium">On-chain ✓</p>
          <a
            className="text-blue-600 underline"
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
          >
            {signature}
          </a>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="rounded border p-4 text-sm space-y-1">
        <p className="font-medium">Insight (demo)</p>
        <p>On days tagged <code>high_stress</code>, your symptom score averages +1.8 higher.</p>
        <p className="text-gray-500">Based on the last 7 check-ins.</p>
      </section>
    </main>
  );
}
