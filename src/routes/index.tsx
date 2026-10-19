import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { formatPrice } from "@/data/watches";
import { useWatches } from "@/hooks/use-watches";
import { WatchDetail } from "@/components/WatchDetail";
import { ContactForm } from "@/components/ContactForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Los relojes de Miguel · Compraventa de relojes en Madrid" },
      {
        name: "description",
        content:
          "Compraventa de relojes de segunda mano en Madrid. Galería de piezas en stock con ficha completa y al menos 5 fotografías por reloj.",
      },
      { property: "og:title", content: "Los relojes de Miguel · Compraventa de relojes en Madrid" },
      {
        property: "og:description",
        content:
          "Relojes de segunda mano en Madrid, con ficha completa y fotografías de detalle.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { watches, loading, error } = useWatches();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(() => watches.find((w) => w.id === selectedId) ?? null, [watches, selectedId]);
  const setSelected = (w: { id: string } | null) => setSelectedId(w ? w.id : null);

  const featured = useMemo(
    () => watches.find((w) => w.featured && !w.sold) ?? watches.find((w) => !w.sold) ?? null,
    [watches],
  );
  const available = useMemo(() => watches.filter((w) => !w.sold).length, [watches]);

  const visible = watches;

  return (
    <div className="min-h-screen bg-ivory font-body text-ink selection:bg-brass/25">
      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="washi pointer-events-none absolute inset-x-0 top-0 h-28 opacity-60" />
        <div className="relative mx-auto max-w-[1200px] px-6 pt-10 pb-20">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-black tracking-tight">Los relojes</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-inksoft">de Miguel</span>
            </div>
            <nav className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.2em] text-inksoft md:flex">
              <a className="hover:text-ink" href="#stock">Stock</a>
              <a className="hover:text-ink" href="#vender">Vender</a>
              <a className="hover:text-ink" href="#contacto">Contacto</a>
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
                onClick={() => setSelected(featured)}
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
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-inksoft">Pieza destacada</p>
              </div>
            </div>
            )}
          </div>
        </div>
      </header>

      {/* GALLERY */}
      <section id="stock" className="mx-auto max-w-[1200px] scroll-mt-10 px-6 py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-brassdeep">Galería de stock</p>
            <h2 className="mt-2 font-display text-4xl font-black tracking-tight">Piezas en vitrina</h2>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading && <p className="col-span-full py-10 text-center text-inksoft">Cargando stock…</p>}
          {!loading && error && (
            <p className="col-span-full py-10 text-center text-inksoft">No se ha podido cargar el stock. Inténtalo de nuevo en unos minutos.</p>
          )}
          {!loading && !error && visible.length === 0 && (
            <p className="col-span-full py-10 text-center text-inksoft">Ahora mismo no hay piezas en vitrina. Vuelve pronto.</p>
          )}
          {visible.map((w) => {
            const isSold = w.sold;
            return (
              <article
                key={w.id}
                className={`paper-shadow group p-4 pb-5 transition-colors ${isSold ? "bg-cream" : "bg-paper"}`}
              >
                <button onClick={() => setSelected(w)} className="relative block w-full text-left">
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
                  <p className={`mt-1 font-mono text-[11px] uppercase tracking-[0.16em] ${isSold ? "text-inksoft/70" : "text-inksoft"}`}>
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
                        onClick={() => setSelected(w)}
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
                      onClick={() => setSelected(w)}
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

      {/* VENDER */}
      <section id="vender" className="relative overflow-hidden bg-cream">
        <div className="washi pointer-events-none absolute inset-x-0 bottom-0 h-24 opacity-50" />
        <div className="relative mx-auto grid max-w-[1200px] gap-10 px-6 py-20 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-brassdeep">Compramos tu reloj</p>
            <h2 className="mt-2 font-display text-4xl font-black tracking-tight">
              Valoración honesta,
              <br />
              <span className="font-normal italic">trato directo.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-inksoft">
              Escríbeme con fotos de tu pieza y su documentación y te doy una valoración sin
              compromiso. Si te encaja, acordamos los detalles de la entrega y el pago directamente.
            </p>
          </div>
          <div className="paper-shadow bg-paper p-8">
            <ol className="space-y-5">
              {[
                ["01", "Cuéntame qué pieza tienes", "Marca, modelo, referencia, año y estado general."],
                ["02", "Recibe una valoración", "La reviso con calma y te respondo sin compromiso."],
                ["03", "Acordamos entrega y pago", "En Madrid, con la documentación de la pieza."],
              ].map(([n, t, d]) => (
                <li key={n} className="flex gap-4 border-b border-dashed border-ink/15 pb-5 last:border-0 last:pb-0">
                  <span className="font-mono text-[12px] tracking-[0.2em] text-brass">{n}</span>
                  <div>
                    <p className="font-display text-lg font-semibold">{t}</p>
                    <p className="mt-1 text-sm leading-relaxed text-inksoft">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <a
              href="mailto:relojes@miguelgarcia.me?subject=Quiero%20vender%20mi%20reloj"
              className="mt-7 block bg-ink px-6 py-3 text-center font-mono text-[12px] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-brassdeep"
            >
              Solicitar valoración
            </a>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="mx-auto grid max-w-[1200px] scroll-mt-10 gap-10 px-6 py-20 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-brassdeep">Contacto</p>
          <h2 className="mt-2 font-display text-4xl font-black tracking-tight">
            ¿Te interesa una pieza
            <br />
            <span className="font-normal italic">o quieres vender la tuya?</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-inksoft">
            Escríbeme y te respondo lo antes posible. También puedes hacerlo directamente a
            relojes@miguelgarcia.me.
          </p>
        </div>
        <ContactForm />
      </section>

      {/* FOOTER */}
      <footer id="pie" className="bg-ink text-cream">
        <div className="mx-auto max-w-[1200px] px-6 py-14">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="font-display text-3xl font-black">Los relojes de Miguel</span>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/60">
                Compra y venta de relojes de segunda mano en Madrid.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-12 gap-y-4 font-mono text-[11px] uppercase tracking-[0.18em] text-cream/70">
              <a className="hover:text-cream" href="#stock">Stock</a>
              <a className="hover:text-cream" href="#vender">Vender</a>
              <a className="hover:text-cream" href="mailto:relojes@miguelgarcia.me">relojes@miguelgarcia.me</a>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-cream/15 pt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-cream/40">
            <span>© 2026 Los relojes de Miguel</span>
            <span>Madrid</span>
          </div>
        </div>
      </footer>

      <WatchDetail
        watch={selected}
        sold={selected ? selected.sold : false}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
