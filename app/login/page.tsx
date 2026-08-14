"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? "Connexion impossible");
        return;
      }
      // Rechargement complet indispensable : le bootstrap global a déjà tourné
      // sur /login sans session. Une navigation client ne le remonte pas.
      window.location.replace("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-60">IBES</p>
          <h1 className="font-display text-3xl font-bold mt-2">Connexion</h1>
        </div>
        <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3" placeholder="Identifiant" autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)} required autoFocus />
        {error && <p className="text-sm opacity-80">{error}</p>}
        <button className="w-full rounded-xl bg-ink text-graphite px-4 py-3 font-semibold disabled:opacity-50" disabled={loading}>{loading ? "Connexion…" : "Se connecter"}</button>
      </form>
    </main>
  );
}
