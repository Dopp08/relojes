import { formatPrice } from "@/data/watches";
import type { Watch } from "@/data/watches";

// Cabecera: logo, menú, titular y reloj destacado.
export function Hero({
  available,
  featured,
  onSelect,
}: {
  available: number;
  featured: Watch | null;
  onSelect: (w: Watch) => void;
}) {
  return (
    <header className="relative overflow-hidden">
      <div className="washi pointer-events-none absolute inset-x-0 top-0 h-28 opacity-60" />
      <div className="relative mx-auto max-w-[1200px] px-6 pt-10 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-black tracking-tight">Los relojes</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-inksoft">
              de Miguel
            </span>
          </div>
          <nav className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.2em] text-inksoft md:flex">
            <a className="hover:text-ink" href="#stock">
              Stock
            </a>
            <a className="hover:text-ink" href="#vender">
              Vender
            </a>
            <a className="hover:text-ink" href="#contacto">
              Contacto
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-inksoft sm:inline">
              Madrid
            </span>
            <span className="rounded-full border border-ink/15 bg-paper px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]">
              {available} disponibles
            </span>
          </div>
        </div>

        <div className="mt-16 grid items-end gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="mb-6 inline-block -rotate-1 bg-brass px-3 py-1 font-mono text-[11px] uppercase tracking-[0.28em] text-cream">
              Compra &amp; venta de relojes
            </div>
            <h1 className="font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] font-black tracking-tight">
              El tiempo
              <br />
              <span className="font-display font-normal italic">no se</span>{" "}
              <span className="relative inline-block">
                <span className="absolute inset-x-0 bottom-2 -z-0 h-4 bg-brass/30" />
                <span className="relative">vende.</span>
              </span>
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-inksoft">
              Relojes de segunda mano en stock, cada uno con ficha completa y al menos cinco
              fotografías de detalle.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#stock"
                className="group inline-flex items-center gap-3 bg-ink px-7 py-4 font-mono text-[12px] uppercase tracking-[0.2em] text-cream transition-colors hover:bg-brassdeep"
              >
                Explorar stock
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <a
                href="#vender"
                className="inline-flex items-center gap-2 border-b border-ink/30 pb-1 font-mono text-[12px] uppercase tracking-[0.2em] text-ink hover:border-brass hover:text-brass"
              >
                Vender tu pieza
              </a>
            </div>
          </div>

          {/* Hero collage cutout */}
          {featured && featured.photos[0] && (
            <div className="relative md:col-span-5">
              <button
                onClick={() => onSelect(featured)}
                className="torn paper-shadow block w-full rotate-2 bg-paper p-3 pr-4 pb-6 text-left transition-transform hover:rotate-1"
              >
                <img
                  src={featured.photos[0].src}
                  alt={featured.photos[0].alt}
                  width={768}
                  height={768}
                  className="aspect-[4/5] w-full object-cover"
                />
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="font-display text-lg leading-tight font-semibold">
                      {featured.brand} {featured.model}
                    </p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-inksoft">
                      {featured.case}
                    </p>
                  </div>
                  <span className="font-display text-xl font-semibold text-brass">
                    {formatPrice(featured.price)}
                  </span>
                </div>
              </button>
              <div className="paper-shadow absolute -bottom-6 -left-6 -rotate-6 border border-ink/10 bg-cream px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-inksoft">
                  Pieza destacada
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
