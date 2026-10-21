import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useWatches } from "@/hooks/use-watches";
import { WatchDetail } from "@/components/WatchDetail";
import { Hero } from "@/components/home/Hero";
import { Stock } from "@/components/home/Stock";
import { Valuation } from "@/components/home/Valuation";
import { Contacto } from "@/components/home/Contacto";
import { Footer } from "@/components/home/Footer";

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
        content: "Relojes de segunda mano en Madrid, con ficha completa y fotografías de detalle.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://relojes.miguelgarcia.me/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://relojes.miguelgarcia.me/" }],
  }),
  component: Index,
});

function Index() {
  const { watches, loading, error } = useWatches();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => watches.find((w) => w.id === selectedId) ?? null,
    [watches, selectedId],
  );
  const setSelected = (w: { id: string } | null) => setSelectedId(w ? w.id : null);

  const featured = useMemo(
    () => watches.find((w) => w.featured && !w.sold) ?? watches.find((w) => !w.sold) ?? null,
    [watches],
  );
  const available = useMemo(() => watches.filter((w) => !w.sold).length, [watches]);

  return (
    <div className="min-h-screen bg-ivory font-body text-ink selection:bg-brass/25">
      <Hero available={available} featured={featured} onSelect={setSelected} />
      <Stock watches={watches} loading={loading} error={error} onSelect={setSelected} />
      <Valuation />
      <Contacto />
      <Footer />

      <WatchDetail
        watch={selected}
        sold={selected ? selected.sold : false}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
