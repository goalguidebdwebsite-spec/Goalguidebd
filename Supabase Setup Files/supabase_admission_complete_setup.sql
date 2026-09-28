-- Goal Guide BD: complete Admission page Supabase setup.
-- Run this entire file in Supabase Dashboard > SQL Editor.
-- Project: https://sdzbpsxkhpogbwixhulv.supabase.co
--
-- The Admin editor requires a signed-in Supabase Auth user. Public visitors
-- can read page choices, submit registrations, and upload form files only.

begin;

-- ---------------------------------------------------------------------------
-- Admission form dropdown choices, edited in Admin > Admission
-- ---------------------------------------------------------------------------
create table if not exists public.admission_form_settings (
  id integer primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint admission_form_settings_singleton_id check (id = 1)
);

alter table public.admission_form_settings enable row level security;
revoke all on public.admission_form_settings from anon, authenticated;
grant select on public.admission_form_settings to anon, authenticated;
grant insert, update on public.admission_form_settings to authenticated;

drop policy if exists "Public can read admission form settings" on public.admission_form_settings;
drop policy if exists "Admin client can insert admission form settings" on public.admission_form_settings;
drop policy if exists "Admin client can update admission form settings" on public.admission_form_settings;
drop policy if exists "Authenticated admins can insert admission form settings" on public.admission_form_settings;
drop policy if exists "Authenticated admins can update admission form settings" on public.admission_form_settings;

create policy "Public can read admission form settings"
  on public.admission_form_settings for select to anon, authenticated using (id = 1);
create policy "Authenticated admins can insert admission form settings"
  on public.admission_form_settings for insert to authenticated with check (id = 1);
create policy "Authenticated admins can update admission form settings"
  on public.admission_form_settings for update to authenticated using (id = 1) with check (id = 1);

insert into public.admission_form_settings (id, content)
values (1, '{
  "courses": ["German A1", "German A2", "German B1", "German B2"],
  "shifts": ["Morning", "Afternoon", "Evening"],
  "learning_modes": ["Offline", "Online"],
  "countries": ["Bangladesh", "India", "Nepal", "Pakistan", "Other"],
  "reasons": ["Higher Education", "Work / Career", "Migration", "Family Reunion", "Goethe Exam Preparation", "Personal Interest"],
  "payment_methods": ["bKash", "Nagad", "Bank Transfer", "Cash", "Other"]
}'::jsonb)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Admission questions/contact section values, edited in Admin > Admission
-- ---------------------------------------------------------------------------
create table if not exists public.admission_contact_settings (
  id integer primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint admission_contact_settings_singleton_id check (id = 1)
);

alter table public.admission_contact_settings enable row level security;
revoke all on public.admission_contact_settings from anon, authenticated;
grant select on public.admission_contact_settings to anon, authenticated;
grant insert, update on public.admission_contact_settings to authenticated;

drop policy if exists "Public can read admission contact settings" on public.admission_contact_settings;
drop policy if exists "Admin client can insert admission contact settings" on public.admission_contact_settings;
drop policy if exists "Admin client can update admission contact settings" on public.admission_contact_settings;
drop policy if exists "Authenticated admins can insert admission contact settings" on public.admission_contact_settings;
drop policy if exists "Authenticated admins can update admission contact settings" on public.admission_contact_settings;

create policy "Public can read admission contact settings"
  on public.admission_contact_settings for select to anon, authenticated using (id = 1);
create policy "Authenticated admins can insert admission contact settings"
  on public.admission_contact_settings for insert to authenticated with check (id = 1);
create policy "Authenticated admins can update admission contact settings"
  on public.admission_contact_settings for update to authenticated using (id = 1) with check (id = 1);

insert into public.admission_contact_settings (id, content)
values (1, '{
  "phone": "+880 1717-099770",
  "available": "Saturday to Friday",
  "office_days": "Saturday to Thursday",
  "time": "10:00 AM - 07:00 PM",
  "email": "info.waisbd@gmail.com"
}'::jsonb)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Registration records: private to signed-in Admin users
-- ---------------------------------------------------------------------------
create table if not exists public.admission_registrations (
  id uuid primary key,
  registration_code text not null unique,
  full_name text not null check (char_length(full_name) between 2 and 160),
  email text not null check (char_length(email) between 3 and 254),
  mobile text not null check (char_length(mobile) between 3 and 50),
  form_data jsonb not null default '{}'::jsonb check (jsonb_typeof(form_data) = 'object'),
  attachments jsonb not null default '[]'::jsonb check (jsonb_typeof(attachments) = 'array'),
  email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- Keep any earlier 10-character IDs valid, while current forms use 16 chars.
alter table public.admission_registrations
  drop constraint if exists admission_registration_code_matches_id;
alter table public.admission_registrations
  add constraint admission_registration_code_matches_id check (
    registration_code = 'GG-' || upper(substr(replace(id::text, '-', ''), 1, 16))
    or registration_code = 'GG-' || upper(substr(replace(id::text, '-', ''), 1, 10))
  );

create index if not exists admission_registrations_created_at_idx
  on public.admission_registrations (created_at desc);
-- The unique registration_code constraint creates an index for the Admin ID search.

alter table public.admission_registrations enable row level security;
revoke all on public.admission_registrations from anon, authenticated;
grant insert (id, registration_code, full_name, email, mobile, form_data, attachments)
  on public.admission_registrations to anon, authenticated;
grant select, delete on public.admission_registrations to authenticated;

drop policy if exists "Visitors can submit admission registrations" on public.admission_registrations;
drop policy if exists "Authenticated admins can read admission registrations" on public.admission_registrations;
drop policy if exists "Authenticated admins can delete admission registrations" on public.admission_registrations;

create policy "Visitors can submit admission registrations"
  on public.admission_registrations for insert to anon, authenticated
  with check (
    registration_code = 'GG-' || upper(substr(replace(id::text, '-', ''), 1, 16))
    and char_length(full_name) between 2 and 160
    and char_length(email) between 3 and 254
    and char_length(mobile) between 3 and 50
    and jsonb_typeof(form_data) = 'object'
    and jsonb_typeof(attachments) = 'array'
    and jsonb_array_length(attachments) = 3
  );
create policy "Authenticated admins can read admission registrations"
  on public.admission_registrations for select to authenticated using (true);
create policy "Authenticated admins can delete admission registrations"
  on public.admission_registrations for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Private file bucket: identity document, passport photo, payment proof
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'registration-uploads',
  'registration-uploads',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Visitors can upload registration files" on storage.objects;
drop policy if exists "Authenticated admins can read registration files" on storage.objects;
drop policy if exists "Authenticated admins can delete registration files" on storage.objects;

create policy "Visitors can upload registration files"
  on storage.objects for insert to anon, authenticated
  with check (
    bucket_id = 'registration-uploads'
    and (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
  );
create policy "Authenticated admins can read registration files"
  on storage.objects for select to authenticated using (bucket_id = 'registration-uploads');
create policy "Authenticated admins can delete registration files"
  on storage.objects for delete to authenticated using (bucket_id = 'registration-uploads');

commit;

-- Email is sent directly to the Formspree AJAX endpoint from the Admission
-- form and Admin retry action. The endpoint ID is mrpbynea. Ensure the form
-- is configured to deliver to goalguidebdwebsite@gmail.com.
