import { useState } from "react";
import { MIN_PHOTOS, PHOTO_BUCKET, type Watch } from "@/data/watches";
import { supabase } from "@/integrations/supabase/client";
import { resizeToWebp } from "@/lib/image";
import { input, label, btn } from "./styles";

// Formulario para añadir / editar un reloj y subir sus fotos.
type PhotoItem = {
  key: string;
  existing?: { id: string; path: string };
  file?: File;
  preview: string;
};

export function WatchForm({
  watch,
  onCancel,
  onSaved,
}: {
  watch: Watch | null;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [f, setF] = useState({
    brand: watch?.brand ?? "",
    model: watch?.model ?? "",
    reference: watch?.reference ?? "",
    year: watch?.year ? String(watch.year) : "",
    price: watch?.price != null ? String(watch.price) : "",
    case_info: watch?.case ?? "",
    movement: watch?.movement ?? "",
    condition: watch?.condition ?? "",
    extras: watch?.extras ?? "",
    description: watch?.description ?? "",
  });
  const [photos, setPhotos] = useState<PhotoItem[]>(
    (watch?.photos ?? []).map((p) => ({
      key: p.id,
      existing: { id: p.id, path: p.path },
      preview: p.src,
    })),
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set =
    (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
    if (photos.length < MIN_PHOTOS)
      return setErr(
        `Cada reloj necesita al menos ${MIN_PHOTOS} fotos (ahora hay ${photos.length}).`,
      );
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
          const { error } = await supabase.storage
            .from(PHOTO_BUCKET)
            .upload(path, blob, { contentType: "image/webp" });
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
        const { error } = await supabase
          .from("watch_photos")
          .delete()
          .in(
            "id",
            removed.map((p) => p.id),
          );
        if (error) throw error;
        await supabase.storage.from(PHOTO_BUCKET).remove(removed.map((p) => p.path));
      }
      for (const [position, p] of finalPaths.entries()) {
        if (p.existingId) {
          const { error } = await supabase
            .from("watch_photos")
            .update({ position })
            .eq("id", p.existingId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("watch_photos")
            .insert({ watch_id: id, path: p.path, position });
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
      <h2 className="font-display text-2xl font-black">
        {watch ? "Editar reloj" : "Añadir reloj"}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Marca *</span>
          <input required className={input} value={f.brand} onChange={set("brand")} />
        </label>
        <label className="block">
          <span className={label}>Modelo *</span>
          <input required className={input} value={f.model} onChange={set("model")} />
        </label>
        <label className="block">
          <span className={label}>Referencia</span>
          <input className={input} value={f.reference} onChange={set("reference")} />
        </label>
        <label className="block">
          <span className={label}>Año</span>
          <input
            type="number"
            min={1900}
            max={2100}
            className={input}
            value={f.year}
            onChange={set("year")}
          />
        </label>
        <label className="block">
          <span className={label}>Precio en € (vacío = «Consultar»)</span>
          <input
            type="number"
            min={0}
            step="any"
            className={input}
            value={f.price}
            onChange={set("price")}
          />
        </label>
        <label className="block">
          <span className={label}>Caja (tamaño · material)</span>
          <input className={input} value={f.case_info} onChange={set("case_info")} />
        </label>
        <label className="block">
          <span className={label}>Movimiento</span>
          <input className={input} value={f.movement} onChange={set("movement")} />
        </label>
        <label className="block">
          <span className={label}>Estado</span>
          <input className={input} value={f.condition} onChange={set("condition")} />
        </label>
        <label className="block">
          <span className={label}>Extras (caja, papeles…)</span>
          <input className={input} value={f.extras} onChange={set("extras")} />
        </label>
      </div>
      <label className="block">
        <span className={label}>Descripción</span>
        <textarea rows={4} className={input} value={f.description} onChange={set("description")} />
      </label>

      <div>
        <span className={label}>
          Fotos (mínimo {MIN_PHOTOS}; la primera es la principal) · {photos.length} añadidas
        </span>
        <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {photos.map((p, i) => (
            <div key={p.key} className="bg-ivory p-1">
              <img src={p.preview} alt="" className="aspect-square w-full object-cover" />
              <div className="mt-1 flex items-center justify-between font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  className="px-1 hover:text-brass"
                  aria-label="Mover antes"
                >
                  ←
                </button>
                <span>{i + 1}</span>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  className="px-1 hover:text-brass"
                  aria-label="Mover después"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => setPhotos((arr) => arr.filter((x) => x.key !== p.key))}
                  className="px-1 text-sell"
                  aria-label="Quitar foto"
                >
                  ✕
                </button>
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
          <span className="bg-ink px-5 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-cream">
            + Añadir fotos
          </span>
          <span className="text-sm text-inksoft">
            Pulsa aquí o arrastra las fotos. Puedes elegir varias a la vez · {photos.length} de{" "}
            {MIN_PHOTOS} mínimas
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
        <button
          type="submit"
          disabled={busy}
          className={`${btn} bg-ink text-cream hover:bg-brassdeep`}
        >
          {busy ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className={`${btn} border border-ink/20 hover:border-ink`}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
