"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
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
        body: JSON.stringify({ login, password }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? "Connexion impossible");
        return;
      }
      router.replace("/");
      router.refresh();
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
        <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3" placeholder="Identifiant" autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)} required />
        <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3" placeholder="Mot de passe" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm opacity-80">{error}</p>}
        <button className="w-full rounded-xl bg-ink text-graphite px-4 py-3 font-semibold disabled:opacity-50" disabled={loading}>{loading ? "Connexion…" : "Se connecter"}</button>
      </form>
    </main>
  );
}
