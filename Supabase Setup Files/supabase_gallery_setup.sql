-- Goal Guide BD: dynamic Gallery categories and images.
-- Run once in the Supabase SQL Editor.

create table if not exists public.gallery_settings (
  id integer primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint gallery_settings_singleton_id check (id = 1)
);

alter table public.gallery_settings enable row level security;
grant select on public.gallery_settings to anon, authenticated;
grant insert, update on public.gallery_settings to authenticated;

drop policy if exists "Public can read gallery settings" on public.gallery_settings;
create policy "Public can read gallery settings"
  on public.gallery_settings for select to anon, authenticated
  using (id = 1);

drop policy if exists "Authenticated admins can insert gallery settings" on public.gallery_settings;
create policy "Authenticated admins can insert gallery settings"
  on public.gallery_settings for insert to authenticated
  with check (id = 1);

drop policy if exists "Authenticated admins can update gallery settings" on public.gallery_settings;
create policy "Authenticated admins can update gallery settings"
  on public.gallery_settings for update to authenticated
  using (id = 1)
  with check (id = 1);

insert into public.gallery_settings (id, content)
values (
  1,
  '{
    "categories": [
      {"name": "Classes & Learning", "custom": false},
      {"name": "Events & Activities", "custom": false},
      {"name": "Students & Community", "custom": false},
      {"name": "Achievements", "custom": false},
      {"name": "Campus & Facilities", "custom": false},
      {"name": "Workshops", "custom": false}
    ],
    "images": []
  }'::jsonb
)
on conflict (id) do nothing;

-- File uploads use the site's existing public `site-images` bucket.
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read Goal Guide site images" on storage.objects;
create policy "Public can read Goal Guide site images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'site-images');

drop policy if exists "Authenticated admins can upload Goal Guide site images" on storage.objects;
create policy "Authenticated admins can upload Goal Guide site images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'site-images');
