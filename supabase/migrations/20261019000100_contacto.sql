-- Formulario de contacto: cualquiera puede ENVIAR un mensaje, solo el admin puede LEERLO.
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 200),
  message text not null check (char_length(message) between 1 and 3000),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;

create policy "contact_public_insert" on public.contact_messages
  for insert to anon, authenticated with check (true);
create policy "contact_admin_read" on public.contact_messages
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "contact_admin_update" on public.contact_messages
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "contact_admin_delete" on public.contact_messages
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
