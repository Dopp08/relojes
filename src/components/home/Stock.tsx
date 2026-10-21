import { formatPrice } from "@/data/watches";
import type { Watch } from "@/data/watches";

// Galería de relojes (disponibles y vendidos recientes).
export function Stock({
  watches,
  loading,
  error,
  onSelect,
}: {
  watches: Watch[];
  loading: boolean;
  error: string | null;
  onSelect: (w: Watch) => void;
}) {
  const visible = watches;
  return (
    <section id="stock" className="mx-auto max-w-[1200px] scroll-mt-10 px-6 py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-brassdeep">
            Galería de stock
          </p>
          <h2 className="mt-2 font-display text-4xl font-black tracking-tight">
            Piezas en vitrina
          </h2>
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <p className="col-span-full py-10 text-center text-inksoft">Cargando stock…</p>}
        {!loading && error && (
          <p className="col-span-full py-10 text-center text-inksoft">
            No se ha podido cargar el stock. Inténtalo de nuevo en unos minutos.
          </p>
        )}
        {!loading && !error && visible.length === 0 && (
          <p className="col-span-full py-10 text-center text-inksoft">
            Ahora mismo no hay piezas en vitrina. Vuelve pronto.
          </p>
        )}
        {visible.map((w) => {
          const isSold = w.sold;
          return (
            <article
              key={w.id}
              className={`paper-shadow group p-4 pb-5 transition-colors ${isSold ? "bg-cream" : "bg-paper"}`}
            >
              <button onClick={() => onSelect(w)} className="relative block w-full text-left">
                <img
                  src={w.photos[0]?.src}
                  alt={w.photos[0]?.alt ?? `${w.brand} ${w.model}`}
                  width={768}
                  height={768}
                  loading="lazy"
                  className={`aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.02] ${
                    isSold ? "opacity-60 saturate-50" : ""
                  }`}
                />
                <span
                  className={`absolute top-3 right-3 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-cream ${
                    isSold ? "bg-sell" : "bg-avail"
                  }`}
                >
                  {isSold ? "Vendido" : "Disponible"}
                </span>
                <span className="absolute bottom-3 left-3 bg-ink/85 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-cream">
                  {w.photos.length} fotos
                </span>
              </button>
              <div className="mt-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3
                    className={`font-display text-xl leading-tight font-semibold ${
                      isSold ? "text-inksoft line-through decoration-sell/60" : ""
                    }`}
                  >
                    {w.brand} {w.model}
                  </h3>
                  <span
                    className={`font-display text-lg font-semibold whitespace-nowrap ${
                      isSold ? "text-sell/80 line-through" : "text-brass"
                    }`}
                  >
                    {formatPrice(w.price)}
                  </span>
                </div>
                <p
                  className={`mt-1 font-mono text-[11px] uppercase tracking-[0.16em] ${isSold ? "text-inksoft/70" : "text-inksoft"}`}
                >
                  {[w.case, w.year].filter(Boolean).join(" · ")}
                </p>
                <div className={`mt-3 flex -space-x-2 ${isSold ? "opacity-50" : ""}`}>
                  {w.photos.slice(1, 5).map((p) => (
                    <img
                      key={p.id}
                      src={p.src}
                      alt=""
                      width={768}
                      height={768}
                      loading="lazy"
                      className="h-9 w-9 rounded-full object-cover outline-2 outline-paper"
                    />
                  ))}
                  {w.photos.length > 5 && (
                    <button
                      onClick={() => onSelect(w)}
                      className={`grid h-9 w-9 place-items-center rounded-full font-mono text-[10px] text-cream outline-2 outline-paper ${
                        isSold ? "bg-sell" : "bg-brass"
                      }`}
                    >
                      +{w.photos.length - 5}
                    </button>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelect(w)}
                    className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink hover:text-brass"
                  >
                    Ver ficha <span>→</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
