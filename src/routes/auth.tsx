import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso privado · Los relojes de Miguel" },
      { name: "description", content: "Acceso restringido a la gestión de stock." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Acceso privado · Los relojes de Miguel" },
      { property: "og:description", content: "Acceso restringido a la gestión de stock." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await navigate({ to: "/gestion" });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "No se ha podido completar la operación.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ivory px-6 font-body text-ink">
      <div className="paper-shadow w-full max-w-md bg-paper p-8">
        <span className="font-display text-2xl font-black tracking-tight">Los relojes de Miguel</span>
        <h1 className="mt-4 font-display text-3xl font-black tracking-tight">Acceso privado</h1>
        <p className="mt-2 text-sm text-inksoft">
          Área reservada para la gestión del stock. No accesible desde la web pública.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-inksoft">Correo</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1 w-full border border-ink/20 bg-ivory px-3 py-2 outline-none focus:border-ink"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-inksoft">Contraseña</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1 w-full border border-ink/20 bg-ivory px-3 py-2 outline-none focus:border-ink"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-ink px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-cream disabled:opacity-60"
          >
            {busy ? "Un momento…" : "Entrar"}
          </button>
        </form>

        {msg && <p className="mt-4 text-sm text-sell">{msg}</p>}

      </div>
    </main>
  );
}
