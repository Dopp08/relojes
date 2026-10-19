-- =====================================================================
-- Web de relojes · esquema completo
-- Ejecutar UNA vez en Supabase > SQL Editor del proyecto "relojes".
-- Los relojes vendidos se siguen viendo en la web 15 días (ver política
-- "watches_public_read"; para cambiar el plazo, edita el '15 days').
-- =====================================================================

-- 1) Roles (solo existe "admin") ---------------------------------------
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
create policy "Users can read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

-- 2) Relojes ------------------------------------------------------------
create table public.watches (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  reference text not null default '',
  year int,
  price numeric,                       -- null = "Consultar"
  category text not null default 'Otros',
  case_info text not null default '',
  movement text not null default '',
  condition text not null default '',
  extras text not null default '',
  description text not null default '',
  featured boolean not null default false,
  status text not null default 'available' check (status in ('available', 'sold')),
  sold_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- La fecha de venta se gestiona sola al cambiar el estado.
create or replace function public.watches_set_sold_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.status = 'sold' then
    if tg_op = 'INSERT' or old.status <> 'sold' or new.sold_at is null then
      new.sold_at := now();
    end if;
  else
    new.sold_at := null;
  end if;
  return new;
end $$;
create trigger watches_sold_at before insert or update on public.watches
  for each row execute function public.watches_set_sold_at();

alter table public.watches enable row level security;
grant select on public.watches to anon, authenticated;
grant insert, update, delete on public.watches to authenticated;
grant all on public.watches to service_role;

-- Público: disponibles + vendidos hace menos de 15 días.
create policy "watches_public_read" on public.watches
  for select to anon, authenticated
  using (status = 'available' or (status = 'sold' and sold_at > now() - interval '15 days'));
-- Admin: ve todo y gestiona todo.
create policy "watches_admin_read" on public.watches
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "watches_admin_insert" on public.watches
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "watches_admin_update" on public.watches
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "watches_admin_delete" on public.watches
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- 3) Fotos --------------------------------------------------------------
create table public.watch_photos (
  id uuid primary key default gen_random_uuid(),
  watch_id uuid not null references public.watches(id) on delete cascade,
  path text not null,                  -- ruta dentro del bucket watch-photos
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index watch_photos_watch_idx on public.watch_photos (watch_id, position);

alter table public.watch_photos enable row level security;
grant select on public.watch_photos to anon, authenticated;
grant insert, update, delete on public.watch_photos to authenticated;
grant all on public.watch_photos to service_role;

-- Una foto es visible si lo es su reloj (la RLS de watches se aplica dentro).
create policy "photos_public_read" on public.watch_photos
  for select to anon, authenticated
  using (exists (select 1 from public.watches w where w.id = watch_id));
create policy "photos_admin_insert" on public.watch_photos
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "photos_admin_update" on public.watch_photos
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "photos_admin_delete" on public.watch_photos
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- 4) Almacén de fotos (Storage) ----------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('watch-photos', 'watch-photos', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "watch_photos_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'watch-photos' and public.has_role(auth.uid(), 'admin'));
create policy "watch_photos_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'watch-photos' and public.has_role(auth.uid(), 'admin'));
create policy "watch_photos_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'watch-photos' and public.has_role(auth.uid(), 'admin'));
