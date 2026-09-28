-- Shared Blog feed for Home, About Us, German Language, and Blog pages.
-- Run in the Supabase SQL Editor. Existing posts are preserved on re-run.
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  image_url text not null check (length(trim(image_url)) > 0),
  description text not null check (length(trim(description)) > 0),
  pdf_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add the PDF column to projects that created blog_posts before PDF downloads
-- were supported. Old posts remain visible and can be edited with a PDF later.
alter table public.blog_posts add column if not exists pdf_url text;

alter table public.blog_posts enable row level security;

drop policy if exists "Anyone can view blog posts" on public.blog_posts;
create policy "Anyone can view blog posts"
  on public.blog_posts for select
  to anon, authenticated
  using (true);

drop policy if exists "Signed-in admins can add blog posts" on public.blog_posts;
create policy "Signed-in admins can add blog posts"
  on public.blog_posts for insert
  to authenticated
  with check (true);

drop policy if exists "Signed-in admins can edit blog posts" on public.blog_posts;
create policy "Signed-in admins can edit blog posts"
  on public.blog_posts for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Signed-in admins can delete blog posts" on public.blog_posts;
create policy "Signed-in admins can delete blog posts"
  on public.blog_posts for delete
  to authenticated
  using (true);

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;

-- PDFs are served publicly from a dedicated bucket; only signed-in admins can
-- upload or remove them. The admin uses unique paths and does not overwrite.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-pdfs', 'blog-pdfs', true, 26214400, array['application/pdf']::text[])
on conflict (id) do update set
  public = true,
  file_size_limit = 26214400,
  allowed_mime_types = array['application/pdf']::text[];

drop policy if exists "Signed-in admins can upload blog PDFs" on storage.objects;
create policy "Signed-in admins can upload blog PDFs"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'blog-pdfs'
    and (storage.foldername(name))[1] = 'blog-posts'
  );

drop policy if exists "Signed-in admins can delete blog PDFs" on storage.objects;
create policy "Signed-in admins can delete blog PDFs"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'blog-pdfs'
    and (storage.foldername(name))[1] = 'blog-posts'
  );

-- Preserve the three posts already stored by the old home-page editor when
-- this new shared table is empty. Safe to run again after setup.
do $$
begin
  if to_regclass('public.home_blogs_settings') is not null
     and not exists (select 1 from public.blog_posts) then
    execute $migration$
      insert into public.blog_posts (image_url, description, sort_order)
      select
        post.value->>'image',
        post.value->>'title',
        (post.ordinality - 1)::integer
      from public.home_blogs_settings as settings
      cross join lateral jsonb_array_elements(
        case
          when jsonb_typeof(settings.content->'posts') = 'array'
            then settings.content->'posts'
          else '[]'::jsonb
        end
      ) with ordinality as post(value, ordinality)
      where settings.id = 1
        and length(trim(coalesce(post.value->>'image', ''))) > 0
        and length(trim(coalesce(post.value->>'title', ''))) > 0
    $migration$;
  end if;
end
$$;
