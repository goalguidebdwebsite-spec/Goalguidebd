-- Goal Guide BD: private admission registrations and private file uploads.
-- Run this in Supabase SQL Editor before enabling the registration form.
-- Admin reads/deletes require a signed-in Supabase Auth user.

create table if not exists public.admission_registrations (
  id uuid primary key,
  registration_code text not null unique,
  full_name text not null check (char_length(full_name) between 2 and 160),
  email text not null check (char_length(email) between 3 and 254),
  mobile text not null check (char_length(mobile) between 3 and 50),
  form_data jsonb not null default '{}'::jsonb check (jsonb_typeof(form_data) = 'object'),
  attachments jsonb not null default '[]'::jsonb check (jsonb_typeof(attachments) = 'array'),
  email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  constraint admission_registration_code_matches_id check (
    registration_code = 'GG-' || upper(substr(replace(id::text, '-', ''), 1, 16))
  )
);

create index if not exists admission_registrations_created_at_idx
  on public.admission_registrations (created_at desc);

alter table public.admission_registrations enable row level security;
revoke all on public.admission_registrations from anon, authenticated;
grant insert (id, registration_code, full_name, email, mobile, form_data, attachments)
  on public.admission_registrations to anon, authenticated;
grant select, delete on public.admission_registrations to authenticated;

drop policy if exists "Visitors can submit admission registrations" on public.admission_registrations;
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

drop policy if exists "Authenticated admins can read admission registrations" on public.admission_registrations;
create policy "Authenticated admins can read admission registrations"
  on public.admission_registrations for select to authenticated using (true);

drop policy if exists "Authenticated admins can delete admission registrations" on public.admission_registrations;
create policy "Authenticated admins can delete admission registrations"
  on public.admission_registrations for delete to authenticated using (true);

-- A private bucket keeps identity documents inaccessible to the public.
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
create policy "Visitors can upload registration files"
  on storage.objects for insert to anon, authenticated
  with check (
    bucket_id = 'registration-uploads'
    and (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
  );

drop policy if exists "Authenticated admins can read registration files" on storage.objects;
create policy "Authenticated admins can read registration files"
  on storage.objects for select to authenticated
  using (bucket_id = 'registration-uploads');

drop policy if exists "Authenticated admins can delete registration files" on storage.objects;
create policy "Authenticated admins can delete registration files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'registration-uploads');

-- Email is sent directly to the Formspree AJAX endpoint (form ID mrpbynea).
-- Configure that form to deliver to goalguidebdwebsite@gmail.com.
