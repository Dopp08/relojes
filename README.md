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

## Dónde está cada cosa

**Textos y secciones de la portada** (`src/components/home/`)
| Quiero cambiar… | Fichero |
|---|---|
| Logo, menú, titular «El tiempo no se vende», botones del principio, reloj destacado | `Hero.tsx` |
| Galería de relojes (tarjetas, etiqueta Vendido/Disponible, «Ver ficha») | `Stock.tsx` |
| Sección «Compramos tu reloj» (pasos 01-02-03 y botón de valoración) | `Valuation.tsx` |
| Sección «Contacto» | `Contacto.tsx` |
| Pie de página (email, © año) | `Footer.tsx` |
| Orden de las secciones | `src/routes/index.tsx` |
| Título y descripción para Google / redes de la portada | `src/routes/index.tsx` (arriba, `head`) |
| Título, idioma, imagen al compartir, iconos, página 404 | `src/routes/__root.tsx` |

**Ventana de cada reloj y formularios**
- Ficha emergente del reloj (galería, datos, «Solicitar pieza»): `src/components/WatchDetail.tsx`
- Formulario de contacto / consulta / valoración (campos, textos, mensaje de éxito): `src/components/ContactForm.tsx`

**Aspecto (colores, tipografías)**
- Colores (`--ivory`, `--ink`, `--brass`…), fuentes y sombras de papel: `src/styles.css`

**Panel privado `/gestion`**
- Pantalla principal (lista, vendido/disponible, plazo de 15 días): `src/routes/_authenticated/gestion.tsx`
- Formulario de alta/edición de relojes y subida de fotos: `src/components/gestion/WatchForm.tsx`
- Mensajes recibidos: `src/components/gestion/Messages.tsx`
- Clases de los campos del panel: `src/components/gestion/styles.ts`
- Login: `src/routes/auth.tsx`

**Datos y servicios**
- Lectura de relojes: `src/data/watches.ts` y `src/hooks/use-watches.ts` (marcas de reloj, mínimo de fotos, formato de precio)
- Conexión a Supabase: `src/integrations/supabase/client.ts`
- Base de datos (SQL): `supabase/migrations/`; aviso por email (Resend): `supabase/notify-contact.ts`
- Imágenes fijas (og.png, favicon, robots.txt): `public/`

**No tocar** (fontanería del framework): `src/routeTree.gen.ts`, `src/router.tsx`, `src/server.ts`, `src/start.ts`, `src/lib/error-*.ts`, `vite.config.ts`.
