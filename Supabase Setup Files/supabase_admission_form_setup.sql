-- Goal Guide BD: editable Admission registration form dropdown choices.
-- Run this in the SQL Editor of the Supabase project used by Admin/script.js:
-- https://sdzbpsxkhpogbwixhulv.supabase.co
--
-- The current admin panel writes with the public anon key, so the settings
-- row policies below allow anon insert/update. Restricting writes to an
-- authenticated Supabase user requires connecting the admin login to Supabase Auth.

create table if not exists public.admission_form_settings (
  id integer primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint admission_form_settings_singleton_id check (id = 1)
);

alter table public.admission_form_settings enable row level security;
grant select, insert, update on public.admission_form_settings to anon, authenticated;

drop policy if exists "Public can read admission form settings" on public.admission_form_settings;
create policy "Public can read admission form settings"
  on public.admission_form_settings for select to anon, authenticated
  using (id = 1);

drop policy if exists "Admin client can insert admission form settings" on public.admission_form_settings;
create policy "Admin client can insert admission form settings"
  on public.admission_form_settings for insert to anon, authenticated
  with check (id = 1);

drop policy if exists "Admin client can update admission form settings" on public.admission_form_settings;
create policy "Admin client can update admission form settings"
  on public.admission_form_settings for update to anon, authenticated
  using (id = 1)
  with check (id = 1);

insert into public.admission_form_settings (id, content)
values (
  1,
  '{
    "courses": ["German A1", "German A2", "German B1", "German B2"],
    "shifts": ["Morning", "Afternoon", "Evening"],
    "learning_modes": ["Offline", "Online"],
    "countries": ["Bangladesh", "India", "Nepal", "Pakistan", "Other"],
    "reasons": ["Higher Education", "Work / Career", "Migration", "Family Reunion", "Goethe Exam Preparation", "Personal Interest"],
    "payment_methods": ["bKash", "Nagad", "Bank Transfer", "Cash", "Other"]
  }'::jsonb
)
on conflict (id) do nothing;
