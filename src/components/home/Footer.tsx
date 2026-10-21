// Pie de página.
export function Footer() {
  return (
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
            <a className="hover:text-cream" href="#stock">
              Stock
            </a>
            <a className="hover:text-cream" href="#vender">
              Vender
            </a>
            <span>relojes@miguelgarcia.me</span>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-cream/15 pt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-cream/40">
          <span>© 2026 Los relojes de Miguel</span>
          <span>Madrid</span>
        </div>
      </div>
    </footer>
  );
}
