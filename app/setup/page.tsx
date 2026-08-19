"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function SetupPage() {
  const [mode, setMode] = useState<"new" | "existing" | "reset">("new");
  const [currentLogin, setCurrentLogin] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.location.hash === "#reset") setMode("reset");
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, currentLogin, login, password, setupSecret }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? "Initialisation impossible");
        return;
      }
      window.location.replace("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-60">IBES</p>
          <h1 className="font-display text-3xl font-bold mt-2">{mode === "reset" ? "Nouveau mot de passe" : "Créer un accès"}</h1>
          <p className="mt-2 text-sm text-muted">{mode === "reset" ? "Saisis l’identifiant du compte, un nouveau mot de passe et le code de première connexion." : "Choisis ton identifiant et ton mot de passe. Les comptes existants peuvent aussi être initialisés ici."}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/10 p-1 text-xs">
          <button type="button" onClick={() => setMode("new")} className={`rounded-lg px-3 py-2 ${mode === "new" ? "bg-teal text-graphite" : "text-muted"}`}>Nouveau compte</button>
          <button type="button" onClick={() => setMode("existing")} className={`rounded-lg px-3 py-2 ${mode === "existing" ? "bg-teal text-graphite" : "text-muted"}`}>Compte existant</button>
          <button type="button" onClick={() => setMode("reset")} className={`rounded-lg px-3 py-2 ${mode === "reset" ? "bg-teal text-graphite" : "text-muted"}`}>Mot de passe oublié</button>
        </div>
        {mode === "existing" && <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3" placeholder="Identifiant actuel" autoComplete="username" value={currentLogin} onChange={(event) => setCurrentLogin(event.target.value)} required autoFocus />}
        <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3" placeholder={mode === "reset" ? "Identifiant du compte" : "Identifiant"} autoComplete="username" value={login} onChange={(event) => setLogin(event.target.value)} required autoFocus={mode !== "existing"} />
        <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3" type="password" placeholder="Mot de passe (8 caractères minimum)" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
        <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3" type="password" placeholder="Confirmer le mot de passe" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={8} />
        <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3" type="password" placeholder="Code de première connexion" autoComplete="one-time-code" value={setupSecret} onChange={(event) => setSetupSecret(event.target.value)} required />
        {error && <p className="text-sm text-alert">{error}</p>}
        <button className="w-full rounded-xl bg-ink text-graphite px-4 py-3 font-semibold disabled:opacity-50" disabled={loading}>{loading ? "Enregistrement…" : mode === "reset" ? "Réinitialiser et se connecter" : "Créer mon accès"}</button>
        <p className="text-center text-sm text-muted">Déjà initialisé ? <Link href="/login" className="text-teal">Se connecter</Link></p>
      </form>
    </main>
  );
}
