-- Ejecutar DESPUÉS de crear tu usuario en Supabase > Authentication > Users.
-- Sustituye el correo por el tuyo.
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'TU_CORREO@EJEMPLO.COM'
on conflict do nothing;
