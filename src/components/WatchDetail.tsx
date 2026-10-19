import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { formatPrice, type Watch } from "@/data/watches";

interface Props {
  watch: Watch | null;
  sold: boolean;
  onClose: () => void;
}

const rotations = ["-rotate-2", "rotate-2", "-rotate-3", "rotate-3"];

export function WatchDetail({ watch, sold, onClose }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [watch?.id]);

  useEffect(() => {
    if (!watch) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [watch, onClose]);

  if (!watch) return null;
  const photo = watch.photos[active] ?? watch.photos[0] ?? { id: "", path: "", src: "", alt: `${watch.model} — Foto` };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Ficha de ${watch.brand} ${watch.model}`}
      onClick={onClose}
    >
      <div
        className="mx-auto my-6 max-w-5xl px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-cream paper-shadow p-4 sm:p-8">
          <button
            onClick={onClose}
            aria-label="Cerrar ficha"
            className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-ink text-cream transition-colors hover:bg-brassdeep"
          >
            <X className="size-4" />
          </button>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Collage gallery */}
            <div>
              <div className="torn paper-shadow rotate-1 bg-paper p-2">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  width={768}
                  height={768}
                  className={`aspect-square w-full object-cover transition ${sold ? "opacity-60 saturate-50" : ""}`}
                />
              </div>
              <div className="mt-4 grid grid-cols-5 gap-3">
                {watch.photos.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setActive(i)}
                    aria-label={`Ver foto ${i + 1} de ${watch.model}`}
                    className={`paper-shadow bg-paper p-1 transition ${rotations[i % rotations.length]} ${
                      i === active ? "outline-2 outline-brass" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={p.src}
                      alt=""
                      width={768}
                      height={768}
                      loading="lazy"
                      className={`aspect-square w-full object-cover ${sold ? "saturate-50" : ""}`}
                    />
                  </button>
                ))}
              </div>
              <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-inksoft">
                {active + 1} / {watch.photos.length} · {photo.alt.split("— ")[1]}
              </p>
            </div>

            {/* Spec sheet */}
            <div className="paper-shadow bg-paper p-6 sm:p-8">
              <div className="flex items-start justify-between gap-3 border-b border-ink/10 pb-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-brassdeep">{watch.brand}</p>
                  <h3 className={`mt-1 font-display text-2xl font-semibold ${sold ? "text-inksoft" : ""}`}>
                    {watch.model}
                  </h3>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-cream ${
                    sold ? "bg-sell" : "bg-avail"
                  }`}
                >
                  {sold ? "Vendido" : "Disponible"}
                </span>
              </div>

              <p className="mt-5 text-[15px] leading-relaxed text-inksoft">{watch.description}</p>

              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  ["Referencia", watch.reference],
                  ["Año", watch.year ? String(watch.year) : "—"],
                  ["Caja", watch.case],
                  ["Movimiento", watch.movement],
                  ["Estado", watch.condition],
                  ["Extras", watch.extras],
                ].map(([dt, dd]) => (
                  <div key={dt} className="border-b border-dashed border-ink/15 pb-2">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-inksoft">{dt}</dt>
                    <dd className="font-display text-base font-medium">{dd || "—"}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-7 flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-inksoft">Precio</p>
                  <p
                    className={`font-display text-4xl font-black ${
                      sold ? "text-sell/70 line-through" : "text-brass"
                    }`}
                  >
                    {formatPrice(watch.price)}
                  </p>
                </div>
                {!sold && (
                  <a
                    href={`mailto:relojes@miguelgarcia.me?subject=${encodeURIComponent(`Consulta por ${watch.brand} ${watch.model} (${watch.reference})`)}`}
                    className="bg-ink px-6 py-3 font-mono text-[12px] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-brassdeep"
                  >
                    Solicitar pieza
                  </a>
                )}
              </div>

              <div className="mt-6 flex items-center gap-2 bg-ivory px-4 py-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-avail">✓</span>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-inksoft">
                  Garantía de 1 año en el movimiento
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
