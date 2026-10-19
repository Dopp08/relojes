import { supabase } from "@/integrations/supabase/client";
import type { WatchPhotoRow, WatchRow } from "@/integrations/supabase/types";

export const PHOTO_BUCKET = "watch-photos";
export const MIN_PHOTOS = 5;

export interface Watch {
  id: string;
  brand: string;
  model: string;
  reference: string;
  year: number | null;
  price: number | null; // null = consultar
  category: string;
  case: string;
  movement: string;
  condition: string;
  extras: string;
  description: string;
  featured: boolean;
  sold: boolean;
  soldAt: string | null;
  photos: { id: string; path: string; src: string; alt: string }[];
}

const photoLabels = ["Vista frontal", "Detalle de esfera", "Perfil y corona", "Brazalete y cierre", "En muñeca"];

export function photoUrl(path: string) {
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

type WatchWithPhotos = WatchRow & { watch_photos: WatchPhotoRow[] };

export function toWatch(row: WatchWithPhotos): Watch {
  const photos = [...(row.watch_photos ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((p, i) => ({
      id: p.id,
      path: p.path,
      src: photoUrl(p.path),
      alt: `${row.model} — ${photoLabels[i] ?? `Foto ${i + 1}`}`,
    }));
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    reference: row.reference,
    year: row.year,
    price: row.price === null ? null : Number(row.price),
    category: row.category,
    case: row.case_info,
    movement: row.movement,
    condition: row.condition,
    extras: row.extras,
    description: row.description,
    featured: row.featured,
    sold: row.status === "sold",
    soldAt: row.sold_at,
    photos,
  };
}

/** Devuelve los relojes que el usuario actual puede ver (el público, sólo los visibles; el admin, todos). */
export async function fetchWatches(): Promise<Watch[]> {
  const { data, error } = await supabase
    .from("watches")
    .select("*, watch_photos(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as WatchWithPhotos[]).map(toWatch);
}

export const formatPrice = (price: number | null) =>
  price === null ? "Consultar" : `${price.toLocaleString("es-ES")} €`;
