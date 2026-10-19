import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const field = "mt-1 w-full border border-ink/20 bg-ivory px-3 py-2 outline-none focus:border-ink";
const lab = "font-mono text-[11px] uppercase tracking-[0.18em] text-inksoft";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [f, setF] = useState({ name: "", email: "", message: "", website: "" });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Campo trampa para bots: si está relleno, fingimos éxito sin enviar nada.
    if (f.website) return setState("sent");
    setState("sending");
    const { error } = await supabase.from("contact_messages").insert({
      name: f.name.trim(),
      email: f.email.trim(),
      message: f.message.trim(),
    });
    setState(error ? "error" : "sent");
  }

  if (state === "sent") {
    return (
      <div className="paper-shadow bg-paper p-8">
        <p className="font-display text-2xl font-semibold">Mensaje enviado</p>
        <p className="mt-2 text-inksoft">Gracias. Te respondo al correo que me has indicado lo antes posible.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="paper-shadow space-y-4 bg-paper p-8">
      <label className="block">
        <span className={lab}>Nombre</span>
        <input required maxLength={100} className={field} value={f.name} onChange={set("name")} autoComplete="name" />
      </label>
      <label className="block">
        <span className={lab}>Correo</span>
        <input required type="email" maxLength={200} className={field} value={f.email} onChange={set("email")} autoComplete="email" />
      </label>
      <label className="block">
        <span className={lab}>Mensaje</span>
        <textarea required rows={5} maxLength={3000} className={field} value={f.message} onChange={set("message")} />
      </label>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          No rellenar
          <input tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} />
        </label>
      </div>
      {state === "error" && (
        <p className="text-sm text-sell">No se ha podido enviar. Inténtalo de nuevo o escríbeme a relojes@miguelgarcia.me.</p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="w-full bg-ink px-6 py-3 font-mono text-[12px] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-brassdeep disabled:opacity-60"
      >
        {state === "sending" ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}
