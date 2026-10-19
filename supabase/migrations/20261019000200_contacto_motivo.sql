-- Motivo del mensaje (consulta por un reloj, valoración, contacto general).
alter table public.contact_messages
  add column topic text not null default 'Contacto general'
  check (char_length(topic) between 1 and 200);
