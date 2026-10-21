import { ContactForm } from "@/components/ContactForm";

// Sección de contacto con el formulario general.
export function Contacto() {
  return (
    <section
      id="contacto"
      className="mx-auto grid max-w-[1200px] scroll-mt-10 gap-10 px-6 py-20 lg:grid-cols-2"
    >
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
  );
}
