-- Goal Guide BD: final shared settings for the German Language page and the
-- German A1, A2, B1, and B2 detail pages.
-- Run this script in the Supabase SQL Editor. Re-running it preserves saved
-- course values; the seed is inserted only when row id=1 does not exist.

create table if not exists public.german_language_settings (
  id integer primary key check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.german_language_settings enable row level security;

-- The admin editor upserts one JSON document at id=1. Public pages only read it.
revoke all on table public.german_language_settings from public, anon, authenticated;
grant select on table public.german_language_settings to anon, authenticated;
grant insert, update on table public.german_language_settings to authenticated;

drop policy if exists "Public can read German Language settings" on public.german_language_settings;
create policy "Public can read German Language settings"
  on public.german_language_settings
  for select
  to anon, authenticated
  using (id = 1);

drop policy if exists "Authenticated admins can insert German Language settings" on public.german_language_settings;
create policy "Authenticated admins can insert German Language settings"
  on public.german_language_settings
  for insert
  to authenticated
  with check (id = 1);

drop policy if exists "Authenticated admins can update German Language settings" on public.german_language_settings;
create policy "Authenticated admins can update German Language settings"
  on public.german_language_settings
  for update
  to authenticated
  using (id = 1)
  with check (id = 1);

insert into public.german_language_settings (id, content)
values (
  1,
  '{
    "courses": [
      {
        "level": "A1",
        "title": "German A1",
        "image": "Images/german-a1.webp",
        "duration": "12 Weeks",
        "fee": "18,500 BDT",
        "description": "Learn essential German language skills including basic grammar, vocabulary, listening, and speaking for everyday communication and a strong foundation.",
        "link_text": "Explore More",
        "link_url": "German_Language/German A1/index.html"
      },
      {
        "level": "A2",
        "title": "German A2",
        "image": "Images/german-a2.webp",
        "duration": "12 Weeks",
        "fee": "18,500 BDT",
        "description": "Build on your A1 knowledge by improving sentence structure, vocabulary, listening, and speaking skills to communicate confidently in daily situations.",
        "link_text": "Explore More",
        "link_url": "German_Language/German A2/index.html"
      },
      {
        "level": "B1",
        "title": "German B1",
        "image": "Images/german-b1.webp",
        "duration": "12 Weeks",
        "fee": "18,500 BDT",
        "description": "Develop independent German communication skills for academic, professional, and social contexts with structured grammar and exam-focused practice.",
        "link_text": "Explore More",
        "link_url": "German_Language/German B1/index.html"
      },
      {
        "level": "B2",
        "title": "German B2",
        "image": "Images/german-b2.webp",
        "duration": "12 Weeks",
        "fee": "18,500 BDT",
        "description": "Achieve advanced German proficiency with fluent communication, complex grammar, academic writing, and comprehensive Goethe-Zertifikat B2 preparation.",
        "link_text": "Explore More",
        "link_url": "German_Language/German B2/index.html"
      }
    ]
  }'::jsonb
)
on conflict (id) do nothing;

-- The admin image editor uploads to this existing public bucket. Keep the
-- bucket public for page display; require Supabase Auth for uploads.
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Authenticated admins can upload German course images" on storage.objects;
create policy "Authenticated admins can upload German course images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'site-images'
    and (storage.foldername(name))[1] = 'german-language'
  );
