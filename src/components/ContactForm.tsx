import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const field = "mt-1 w-full border border-ink/20 bg-ivory px-3 py-2 outline-none focus:border-ink";
const lab = "font-mono text-[11px] uppercase tracking-[0.18em] text-inksoft";

const boxOptions = ["Con caja y papeles", "Solo caja", "Solo papeles", "Sin caja ni papeles"];

type Variant = "contact" | "watch" | "valuation";

interface Props {
  /** contact = formulario general; watch = consulta por una pieza; valuation = valoración de un reloj del cliente. */
  variant?: Variant;
  /** Motivo que verás en el aviso por email y en /gestion. */
  topic?: string;
  /** Sin sombra ni relleno, para usarlo dentro de otra tarjeta. */
  embedded?: boolean;
}

const copy: Record<Variant, { button: string; done: string; messageLabel: string }> = {
  contact: {
    button: "Enviar mensaje",
    done: "Gracias. Te respondo al correo que me has indicado lo antes posible.",
    messageLabel: "Mensaje",
  },
  watch: {
    button: "Enviar consulta",
    done: "Gracias. Te respondo sobre esta pieza al correo que me has indicado lo antes posible.",
    messageLabel: "Mensaje",
  },
  valuation: {
    button: "Enviar solicitud de valoración",
    done: "Gracias. Reviso tu reloj y te respondo con la valoración al correo que me has indicado.",
    messageLabel: "Cuéntame más (año, estado, dónde lo compraste…)",
  },
};

export function ContactForm({ variant = "contact", topic, embedded = false }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [f, setF] = useState({ name: "", email: "", message: "", website: "", brand: "", model: "", box: "" });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const finalTopic = (topic ?? (variant === "valuation" ? "Valoración de reloj" : "Contacto general")).slice(0, 200);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Campo trampa para bots: si está relleno, fingimos éxito sin enviar nada.
    if (f.website) return setState("sent");
    setState("sending");

    const extra = f.message.trim();
    const message =
      variant === "valuation"
        ? [`Marca: ${f.brand.trim()}`, `Modelo: ${f.model.trim()}`, `Caja y papeles: ${f.box}`, extra ? `\n${extra}` : ""]
            .join("\n")
            .trim()
        : extra;

    const { error } = await supabase.from("contact_messages").insert({
      name: f.name.trim(),
      email: f.email.trim(),
      message,
      topic: finalTopic,
    });
    setState(error ? "error" : "sent");
  }

  const box = embedded ? "space-y-4 pt-5" : "paper-shadow space-y-4 bg-paper p-8";

  if (state === "sent") {
    return (
      <div className={embedded ? "pt-5" : "paper-shadow bg-paper p-8"}>
        <p className="font-display text-2xl font-semibold">Mensaje enviado</p>
        <p className="mt-2 text-inksoft">{copy[variant].done}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`${box} ${embedded ? "" : ""}`}>
      {variant === "valuation" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={lab}>Marca</span>
              <input required maxLength={80} className={field} value={f.brand} onChange={set("brand")} />
            </label>
            <label className="block">
              <span className={lab}>Modelo</span>
              <input required maxLength={80} className={field} value={f.model} onChange={set("model")} />
            </label>
          </div>
          <label className="block">
            <span className={lab}>Caja y papeles</span>
            <select required className={field} value={f.box} onChange={set("box")}>
              <option value="" disabled>
                Elige una opción
              </option>
              {boxOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
      <label className="block">
        <span className={lab}>Nombre</span>
        <input required maxLength={100} className={field} value={f.name} onChange={set("name")} autoComplete="name" />
      </label>
      <label className="block">
        <span className={lab}>Correo</span>
        <input required type="email" maxLength={200} className={field} value={f.email} onChange={set("email")} autoComplete="email" />
      </label>
      <label className="block">
        <span className={lab}>{copy[variant].messageLabel}</span>
        <textarea
          required={variant !== "valuation"}
          rows={variant === "valuation" ? 4 : 5}
          maxLength={2500}
          className={field}
          value={f.message}
          onChange={set("message")}
        />
      </label>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          No rellenar
          <input tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} />
        </label>
      </div>
      {state === "error" && (
        <p className="text-sm text-sell">No se ha podido enviar. Inténtalo de nuevo en unos minutos.</p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="w-full bg-ink px-6 py-3 font-mono text-[12px] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-brassdeep disabled:opacity-60"
      >
        {state === "sending" ? "Enviando…" : copy[variant].button}
      </button>
    </form>
  );
}
