import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MIN_PHOTOS, formatPrice, type Watch } from "@/data/watches";
import { useWatches } from "@/hooks/use-watches";
import { supabase } from "@/integrations/supabase/client";
import { PHOTO_BUCKET } from "@/data/watches";
import { resizeToWebp } from "@/lib/image";

// Debe coincidir con el plazo ('15 days') de la política watches_public_read en Supabase.
const SOLD_VISIBLE_DAYS = 15;

export const Route = createFileRoute("/_authenticated/gestion")({
  head: () => ({
    meta: [
      { title: "Gestión de stock" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Gestion,
});

const input = "mt-1 w-full border border-ink/20 bg-ivory px-3 py-2 outline-none focus:border-ink";
const label = "font-mono text-[11px] uppercase tracking-[0.18em] text-inksoft";
const btn = "px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors disabled:opacity-50";

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
          const { error: e1 } = await supabase.from("watches").update({ featured: false }).neq("id", w.id);
          if (e1) throw e1;
        }
        const { error } = await supabase.from("watches").update({ featured: !w.featured }).eq("id", w.id);
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
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-brassdeep">Panel privado</p>
            <h1 className="mt-2 font-display text-4xl font-black tracking-tight">Gestión de stock</h1>
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
            Tu cuenta no tiene permisos de administrador. Ejecuta el script make_admin.sql en Supabase.
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
            <p className="text-sm text-inksoft">Todavía no hay relojes. Pulsa «Añadir reloj» para crear el primero.</p>
          )}
          {watches.map((w) => {
            const left = daysLeft(w.soldAt);
            const busy = pending === w.id;
            return (
              <div key={w.id} className="paper-shadow flex flex-wrap items-center gap-4 bg-paper p-3">
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
                      {left > 0 ? `Visible en la web ${left} día${left === 1 ? "" : "s"} más` : "Ya oculto en la web"}
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
                  <button onClick={() => setEditing(w)} disabled={isAdmin !== true} className={`${btn} border border-ink/20 hover:border-ink`}>
                    Editar
                  </button>
                  <button onClick={() => remove(w)} disabled={busy || isAdmin !== true} className={`${btn} border border-sell/40 text-sell hover:border-sell`}>
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

type PhotoItem = { key: string; existing?: { id: string; path: string }; file?: File; preview: string };

function WatchForm({ watch, onCancel, onSaved }: { watch: Watch | null; onCancel: () => void; onSaved: () => Promise<void> }) {
  const [f, setF] = useState({
    brand: watch?.brand ?? "",
    model: watch?.model ?? "",
    reference: watch?.reference ?? "",
    year: watch?.year ? String(watch.year) : "",
    price: watch?.price != null ? String(watch.price) : "",
    category: watch?.category ?? "",
    case_info: watch?.case ?? "",
    movement: watch?.movement ?? "",
    condition: watch?.condition ?? "",
    extras: watch?.extras ?? "",
    description: watch?.description ?? "",
  });
  const [photos, setPhotos] = useState<PhotoItem[]>(
    (watch?.photos ?? []).map((p) => ({ key: p.id, existing: { id: p.id, path: p.path }, preview: p.src })),
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  function addFiles(files: FileList | null) {
    if (!files) return;
    const items = Array.from(files).map((file) => ({
      key: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((p) => [...p, ...items]);
  }

  const move = (i: number, d: -1 | 1) =>
    setPhotos((p) => {
      const j = i + d;
      if (j < 0 || j >= p.length) return p;
      const copy = [...p];
      [copy[i], copy[j]] = [copy[j]!, copy[i]!];
      return copy;
    });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (photos.length < MIN_PHOTOS) return setErr(`Cada reloj necesita al menos ${MIN_PHOTOS} fotos (ahora hay ${photos.length}).`);
    setBusy(true);
    const uploaded: string[] = [];
    try {
      const id = watch?.id ?? crypto.randomUUID();
      const row = {
        brand: f.brand.trim(),
        model: f.model.trim(),
        reference: f.reference.trim(),
        year: f.year ? Number(f.year) : null,
        price: f.price.trim() === "" ? null : Number(f.price),
        category: f.category.trim() || "Otros",
        case_info: f.case_info.trim(),
        movement: f.movement.trim(),
        condition: f.condition.trim(),
        extras: f.extras.trim(),
        description: f.description.trim(),
      };

      // 1) Subir fotos nuevas (reducidas a WebP)
      const finalPaths: { path: string; existingId?: string }[] = [];
      for (const [i, p] of photos.entries()) {
        if (p.existing) {
          finalPaths.push({ path: p.existing.path, existingId: p.existing.id });
        } else if (p.file) {
          const blob = await resizeToWebp(p.file);
          const path = `${id}/${Date.now()}-${i}.webp`;
          const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: "image/webp" });
          if (error) throw error;
          uploaded.push(path);
          finalPaths.push({ path });
        }
      }

      // 2) Guardar el reloj
      if (watch) {
        const { error } = await supabase.from("watches").update(row).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("watches").insert({ id, ...row });
        if (error) throw error;
      }

      // 3) Sincronizar fotos: borrar las quitadas, actualizar orden, insertar nuevas
      const keptIds = new Set(finalPaths.map((p) => p.existingId).filter(Boolean) as string[]);
      const removed = (watch?.photos ?? []).filter((p) => !keptIds.has(p.id));
      if (removed.length) {
        const { error } = await supabase.from("watch_photos").delete().in("id", removed.map((p) => p.id));
        if (error) throw error;
        await supabase.storage.from(PHOTO_BUCKET).remove(removed.map((p) => p.path));
      }
      for (const [position, p] of finalPaths.entries()) {
        if (p.existingId) {
          const { error } = await supabase.from("watch_photos").update({ position }).eq("id", p.existingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("watch_photos").insert({ watch_id: id, path: p.path, position });
          if (error) throw error;
        }
      }
      await onSaved();
    } catch (e2) {
      if (uploaded.length) await supabase.storage.from(PHOTO_BUCKET).remove(uploaded);
      setErr(e2 instanceof Error ? e2.message : "No se ha podido guardar.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="paper-shadow mt-8 space-y-4 bg-paper p-6">
      <h2 className="font-display text-2xl font-black">{watch ? "Editar reloj" : "Añadir reloj"}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className={label}>Marca *</span><input required className={input} value={f.brand} onChange={set("brand")} /></label>
        <label className="block"><span className={label}>Modelo *</span><input required className={input} value={f.model} onChange={set("model")} /></label>
        <label className="block"><span className={label}>Referencia</span><input className={input} value={f.reference} onChange={set("reference")} /></label>
        <label className="block"><span className={label}>Año</span><input type="number" min={1900} max={2100} className={input} value={f.year} onChange={set("year")} /></label>
        <label className="block"><span className={label}>Precio en € (vacío = «Consultar»)</span><input type="number" min={0} step="any" className={input} value={f.price} onChange={set("price")} /></label>
        <label className="block"><span className={label}>Categoría (Diver, Clásico…)</span><input className={input} value={f.category} onChange={set("category")} /></label>
        <label className="block"><span className={label}>Caja (tamaño · material)</span><input className={input} value={f.case_info} onChange={set("case_info")} /></label>
        <label className="block"><span className={label}>Movimiento</span><input className={input} value={f.movement} onChange={set("movement")} /></label>
        <label className="block"><span className={label}>Estado</span><input className={input} value={f.condition} onChange={set("condition")} /></label>
        <label className="block"><span className={label}>Extras (caja, papeles…)</span><input className={input} value={f.extras} onChange={set("extras")} /></label>
      </div>
      <label className="block"><span className={label}>Descripción</span><textarea rows={4} className={input} value={f.description} onChange={set("description")} /></label>

      <div>
        <span className={label}>Fotos (mínimo {MIN_PHOTOS}; la primera es la principal) · {photos.length} añadidas</span>
        <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {photos.map((p, i) => (
            <div key={p.key} className="bg-ivory p-1">
              <img src={p.preview} alt="" className="aspect-square w-full object-cover" />
              <div className="mt-1 flex items-center justify-between font-mono text-[11px]">
                <button type="button" onClick={() => move(i, -1)} className="px-1 hover:text-brass" aria-label="Mover antes">←</button>
                <span>{i + 1}</span>
                <button type="button" onClick={() => move(i, 1)} className="px-1 hover:text-brass" aria-label="Mover después">→</button>
                <button type="button" onClick={() => setPhotos((arr) => arr.filter((x) => x.key !== p.key))} className="px-1 text-sell" aria-label="Quitar foto">✕</button>
              </div>
            </div>
          ))}
        </div>
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-brass bg-ivory px-4 py-10 text-center transition-colors hover:bg-cream"
        >
          <span className="bg-ink px-5 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-cream">+ Añadir fotos</span>
          <span className="text-sm text-inksoft">
            Pulsa aquí o arrastra las fotos. Puedes elegir varias a la vez · {photos.length} de {MIN_PHOTOS} mínimas
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {err && <p className="text-sm text-sell">{err}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={busy} className={`${btn} bg-ink text-cream hover:bg-brassdeep`}>
          {busy ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" onClick={onCancel} disabled={busy} className={`${btn} border border-ink/20 hover:border-ink`}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

type Msg = { id: string; name: string; email: string; message: string; read: boolean; created_at: string };

function Messages({ enabled }: { enabled: boolean }) {
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
      {msgs.length === 0 && !err && <p className="mt-2 text-sm text-inksoft">No hay mensajes todavía.</p>}
      <div className="mt-4 space-y-3">
        {msgs.map((m) => (
          <div key={m.id} className={`paper-shadow p-4 ${m.read ? "bg-cream" : "bg-paper"}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-lg font-semibold">
                {m.name} · <a className="underline" href={`mailto:${m.email}`}>{m.email}</a>
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-inksoft">
                {new Date(m.created_at).toLocaleString("es-ES")}
              </p>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => toggleRead(m)} className={`${btn} border border-ink/20 hover:border-ink`}>
                {m.read ? "Marcar sin leer" : "Marcar leído"}
              </button>
              <button onClick={() => del(m)} className={`${btn} border border-sell/40 text-sell hover:border-sell`}>
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
