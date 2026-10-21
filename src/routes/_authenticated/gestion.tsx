import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PHOTO_BUCKET, formatPrice, type Watch } from "@/data/watches";
import { useWatches } from "@/hooks/use-watches";
import { supabase } from "@/integrations/supabase/client";
import { WatchForm } from "@/components/gestion/WatchForm";
import { Messages } from "@/components/gestion/Messages";
import { input, label, btn } from "@/components/gestion/styles";

// Debe coincidir con el plazo ('15 days') de la política watches_public_read en Supabase.
const SOLD_VISIBLE_DAYS = 15;

export const Route = createFileRoute("/_authenticated/gestion")({
  head: () => ({
    meta: [{ title: "Gestión de stock" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Gestion,
});

function daysLeft(soldAt: string | null) {
  if (!soldAt) return null;
  const end = new Date(soldAt).getTime() + SOLD_VISIBLE_DAYS * 86_400_000;
  return Math.ceil((end - Date.now()) / 86_400_000);
}

function Gestion() {
  const navigate = useNavigate();
  const { watches, loading, refresh } = useWatches();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [editing, setEditing] = useState<Watch | "new" | null>(null);

  useEffect(() => {
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      setEmail(userData.user?.email ?? "");
      if (!userData.user) return setIsAdmin(false);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!error && !!data);
    })();
  }, []);

  const availableCount = useMemo(() => watches.filter((w) => !w.sold).length, [watches]);

  async function run(id: string, fn: () => Promise<void>, msg: string) {
    setPending(id);
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(`${msg} ${e instanceof Error ? e.message : ""}`.trim());
    } finally {
      setPending(null);
    }
  }

  const toggleSold = (w: Watch) =>
    run(
      w.id,
      async () => {
        const { error } = await supabase
          .from("watches")
          .update({ status: w.sold ? "available" : "sold" })
          .eq("id", w.id);
        if (error) throw error;
      },
      "No se ha podido guardar el cambio.",
    );

  const toggleFeatured = (w: Watch) =>
    run(
      w.id,
      async () => {
        if (!w.featured) {
          const { error: e1 } = await supabase
            .from("watches")
            .update({ featured: false })
            .neq("id", w.id);
          if (e1) throw e1;
        }
        const { error } = await supabase
          .from("watches")
          .update({ featured: !w.featured })
          .eq("id", w.id);
        if (error) throw error;
      },
      "No se ha podido cambiar el destacado.",
    );

  const remove = (w: Watch) => {
    if (!window.confirm(`¿Borrar ${w.brand} ${w.model} y sus fotos? No se puede deshacer.`)) return;
    return run(
      w.id,
      async () => {
        const paths = w.photos.map((p) => p.path);
        const { error } = await supabase.from("watches").delete().eq("id", w.id);
        if (error) throw error;
        if (paths.length) await supabase.storage.from(PHOTO_BUCKET).remove(paths);
      },
      "No se ha podido borrar.",
    );
  };

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="min-h-screen bg-ivory px-6 py-12 font-body text-ink">
      <div className="mx-auto max-w-[1000px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-brassdeep">
              Panel privado
            </p>
            <h1 className="mt-2 font-display text-4xl font-black tracking-tight">
              Gestión de stock
            </h1>
            <p className="mt-2 text-sm text-inksoft">
              {email} · {availableCount} disponibles de {watches.length}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setEditing("new")}
              disabled={isAdmin !== true}
              className={`${btn} bg-ink text-cream hover:bg-brassdeep`}
            >
              + Añadir reloj
            </button>
            <button onClick={signOut} className={`${btn} border border-ink/20 hover:border-ink`}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {isAdmin === false && (
          <p className="paper-shadow mt-6 bg-paper p-4 text-sm text-sell">
            Tu cuenta no tiene permisos de administrador. Ejecuta el script make_admin.sql en
            Supabase.
          </p>
        )}
        {error && <p className="mt-4 text-sm text-sell">{error}</p>}

        {editing && (
          <WatchForm
            key={editing === "new" ? "new" : editing.id}
            watch={editing === "new" ? null : editing}
            onCancel={() => setEditing(null)}
            onSaved={async () => {
              setEditing(null);
              await refresh();
            }}
          />
        )}

        <div className="mt-8 space-y-3">
          {loading && <p className="text-sm text-inksoft">Cargando…</p>}
          {!loading && watches.length === 0 && (
            <p className="text-sm text-inksoft">
              Todavía no hay relojes. Pulsa «Añadir reloj» para crear el primero.
            </p>
          )}
          {watches.map((w) => {
            const left = daysLeft(w.soldAt);
            const busy = pending === w.id;
            return (
              <div
                key={w.id}
                className="paper-shadow flex flex-wrap items-center gap-4 bg-paper p-3"
              >
                <img
                  src={w.photos[0]?.src}
                  alt=""
                  width={128}
                  height={128}
                  loading="lazy"
                  className={`h-16 w-16 object-cover ${w.sold ? "opacity-60 saturate-50" : ""}`}
                />
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-semibold">
                    {w.brand} {w.model} {w.featured && <span title="Destacado">★</span>}
                  </h2>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-inksoft">
                    {w.reference} · {formatPrice(w.price)} · {w.photos.length} fotos
                  </p>
                  {w.sold && left !== null && (
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-inksoft">
                      {left > 0
                        ? `Visible en la web ${left} día${left === 1 ? "" : "s"} más`
                        : "Ya oculto en la web"}
                    </p>
                  )}
                </div>
                <span
                  className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-cream ${
                    w.sold ? "bg-sell" : "bg-avail"
                  }`}
                >
                  {w.sold ? "Vendido" : "Disponible"}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleSold(w)}
                    disabled={busy || isAdmin !== true}
                    className={`${btn} text-cream ${w.sold ? "bg-avail hover:bg-avail/85" : "bg-sell hover:bg-sell/85"}`}
                  >
                    {busy ? "Guardando…" : w.sold ? "Marcar disponible" : "Marcar vendido"}
                  </button>
                  <button
                    onClick={() => toggleFeatured(w)}
                    disabled={busy || isAdmin !== true || w.sold}
                    className={`${btn} border border-ink/20 hover:border-ink`}
                  >
                    {w.featured ? "Quitar destacado" : "Destacar"}
                  </button>
                  <button
                    onClick={() => setEditing(w)}
                    disabled={isAdmin !== true}
                    className={`${btn} border border-ink/20 hover:border-ink`}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => remove(w)}
                    disabled={busy || isAdmin !== true}
                    className={`${btn} border border-sell/40 text-sell hover:border-sell`}
                  >
                    Borrar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <Messages enabled={isAdmin === true} />
      </div>
    </main>
  );
}
