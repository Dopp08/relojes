import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { btn } from "./styles";

// Bandeja de mensajes recibidos por los formularios.
type Msg = {
  id: string;
  name: string;
  email: string;
  message: string;
  topic: string;
  read: boolean;
  created_at: string;
};

export function Messages({ enabled }: { enabled: boolean }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return setErr(error.message);
    setMsgs((data ?? []) as Msg[]);
  }

  useEffect(() => {
    if (enabled) void load();
  }, [enabled]);

  async function toggleRead(m: Msg) {
    await supabase.from("contact_messages").update({ read: !m.read }).eq("id", m.id);
    await load();
  }
  async function del(m: Msg) {
    if (!window.confirm("¿Borrar este mensaje?")) return;
    await supabase.from("contact_messages").delete().eq("id", m.id);
    await load();
  }

  if (!enabled) return null;
  const unread = msgs.filter((m) => !m.read).length;
  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-black">
        Mensajes de contacto {unread > 0 && <span className="text-sell">({unread} sin leer)</span>}
      </h2>
      {err && <p className="mt-2 text-sm text-sell">{err}</p>}
      {msgs.length === 0 && !err && (
        <p className="mt-2 text-sm text-inksoft">No hay mensajes todavía.</p>
      )}
      <div className="mt-4 space-y-3">
        {msgs.map((m) => (
          <div key={m.id} className={`paper-shadow p-4 ${m.read ? "bg-cream" : "bg-paper"}`}>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brassdeep">
              {m.topic}
            </p>
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-lg font-semibold">
                {m.name} ·{" "}
                <a className="underline" href={`mailto:${m.email}`}>
                  {m.email}
                </a>
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-inksoft">
                {new Date(m.created_at).toLocaleString("es-ES")}
              </p>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => toggleRead(m)}
                className={`${btn} border border-ink/20 hover:border-ink`}
              >
                {m.read ? "Marcar sin leer" : "Marcar leído"}
              </button>
              <button
                onClick={() => del(m)}
                className={`${btn} border border-sell/40 text-sell hover:border-sell`}
              >
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
