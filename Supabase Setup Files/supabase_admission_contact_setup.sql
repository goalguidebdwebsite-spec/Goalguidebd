-- Goal Guide BD: editable contact details for the Admission page question section.
-- Run this in the SQL Editor of the Supabase project used by admin/script.js.

create table if not exists public.admission_contact_settings (
  id integer primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint admission_contact_settings_singleton_id check (id = 1)
);

alter table public.admission_contact_settings enable row level security;
grant select, insert, update on public.admission_contact_settings to anon, authenticated;

drop policy if exists "Public can read admission contact settings" on public.admission_contact_settings;
create policy "Public can read admission contact settings"
  on public.admission_contact_settings for select to anon, authenticated
  using (id = 1);

drop policy if exists "Admin client can insert admission contact settings" on public.admission_contact_settings;
create policy "Admin client can insert admission contact settings"
  on public.admission_contact_settings for insert to anon, authenticated
  with check (id = 1);

drop policy if exists "Admin client can update admission contact settings" on public.admission_contact_settings;
create policy "Admin client can update admission contact settings"
  on public.admission_contact_settings for update to anon, authenticated
  using (id = 1)
  with check (id = 1);

insert into public.admission_contact_settings (id, content)
values (
  1,
  '{
    "phone": "+880 1717-099770",
    "available": "Saturday to Friday",
    "office_days": "Saturday to Thursday",
    "time": "10:00 AM - 07:00 PM",
    "email": "info.waisbd@gmail.com"
  }'::jsonb
)
on conflict (id) do nothing;
