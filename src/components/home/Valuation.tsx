import { useState } from "react";
import { ContactForm } from "@/components/ContactForm";

// Sección "Vender": pasos + formulario de valoración desplegable.
export function Valuation() {
  const [valuationOpen, setValuationOpen] = useState(false);
  return (
    <section id="vender" className="relative overflow-hidden bg-cream">
      <div className="washi pointer-events-none absolute inset-x-0 bottom-0 h-24 opacity-50" />
      <div className="relative mx-auto grid max-w-[1200px] gap-10 px-6 py-20 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-brassdeep">
            Compramos tu reloj
          </p>
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
              [
                "01",
                "Cuéntame qué pieza tienes",
                "Marca, modelo, referencia, año y estado general.",
              ],
              ["02", "Recibe una valoración", "La reviso con calma y te respondo sin compromiso."],
              ["03", "Acordamos entrega y pago", "En Madrid, con la documentación de la pieza."],
            ].map(([n, t, d]) => (
              <li
                key={n}
                className="flex gap-4 border-b border-dashed border-ink/15 pb-5 last:border-0 last:pb-0"
              >
                <span className="font-mono text-[12px] tracking-[0.2em] text-brass">{n}</span>
                <div>
                  <p className="font-display text-lg font-semibold">{t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-inksoft">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => setValuationOpen((v) => !v)}
            aria-expanded={valuationOpen}
            className="mt-7 block w-full bg-ink px-6 py-3 text-center font-mono text-[12px] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-brassdeep"
          >
            {valuationOpen ? "Cerrar" : "Solicitar valoración"}
          </button>
          {valuationOpen && (
            <div className="mt-5 border-t border-dashed border-ink/20">
              <ContactForm embedded variant="valuation" topic="Valoración de reloj" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
