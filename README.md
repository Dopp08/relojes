# Web de compraventa de relojes

Escaparate con galería de stock. El stock vive en Supabase y se gestiona desde `/gestion` (privada).

## Puesta en marcha

1. **Supabase** (SQL Editor): ejecutar `supabase/migrations/20261019000000_relojes_schema.sql` y después `20261019000100_contacto.sql` (formulario de contacto) y `20261019000200_contacto_motivo.sql` (motivo del mensaje). Actualizar también la función `notify-contact` con `supabase/notify-contact.ts`.
2. **Supabase > Authentication**: desactivar el registro público (Sign In / Providers > "Allow new users to sign up" = off), crear tu usuario (Users > Add user) y ejecutar `supabase/make_admin.sql` con tu correo.
3. **Local**: `npm install` y `npm run dev`. Las claves públicas de Supabase ya están en `.env`.
4. **Vercel**: importar el repositorio y añadir la variable de entorno `NITRO_PRESET=vercel`. Framework: Other. Build: `npm run build`.

## Reglas de negocio

- Un reloj marcado como vendido sigue visible 15 días (política `watches_public_read` y constante `SOLD_VISIBLE_DAYS` en `src/routes/_authenticated/gestion.tsx`; cambiar ambos a la vez).
- Cada reloj necesita al menos 5 fotos (se reducen a WebP de 1600 px al subirlas).
