-- Goal Guide BD: complete Home page settings setup.
-- Run this file once in the Supabase SQL Editor. It is safe to run again:
-- existing content is preserved and missing default rows are inserted.

create table if not exists public.hero_settings (
  id integer primary key check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.home_german_courses_settings (
  id integer primary key check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.home_about_settings (
  id integer primary key check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.home_mission_settings (
  id integer primary key check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.home_journey_settings (
  id integer primary key check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.home_why_choose_settings (
  id integer primary key check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.hero_settings enable row level security;
alter table public.home_german_courses_settings enable row level security;
alter table public.home_about_settings enable row level security;
alter table public.home_mission_settings enable row level security;
alter table public.home_journey_settings enable row level security;
alter table public.home_why_choose_settings enable row level security;

-- Public pages can read. Admin writes require the signed-in Supabase Auth user.
revoke all on public.hero_settings, public.home_german_courses_settings,
  public.home_about_settings, public.home_mission_settings,
  public.home_journey_settings, public.home_why_choose_settings from public, anon, authenticated;
grant select on public.hero_settings, public.home_german_courses_settings,
  public.home_about_settings, public.home_mission_settings,
  public.home_journey_settings, public.home_why_choose_settings to anon, authenticated;
grant insert, update on public.hero_settings, public.home_german_courses_settings,
  public.home_about_settings, public.home_mission_settings,
  public.home_journey_settings, public.home_why_choose_settings to authenticated;

-- Remove older policies on these tables so anon write policies cannot conflict
-- with the authenticated-only admin policy created below.
do $$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array[
        'hero_settings', 'home_german_courses_settings', 'home_about_settings',
        'home_mission_settings', 'home_journey_settings', 'home_why_choose_settings'
      ])
  loop
    execute format('drop policy %I on %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  end loop;
end
$$;

do $$
declare
  settings_table text;
begin
  foreach settings_table in array array[
    'hero_settings', 'home_german_courses_settings', 'home_about_settings',
    'home_mission_settings', 'home_journey_settings', 'home_why_choose_settings'
  ] loop
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (id = 1)',
      'read_' || settings_table, settings_table
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (id = 1)',
      'insert_' || settings_table, settings_table
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (id = 1) with check (id = 1)',
      'update_' || settings_table, settings_table
    );
  end loop;
end
$$;

-- This public image bucket is used by Home image uploads and other Admin upload tools.
-- Public visitors can read files; signed-in Admin users can manage them.
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read site images" on storage.objects;
create policy "Public can read site images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'site-images');

drop policy if exists "Authenticated admins can upload site images" on storage.objects;
create policy "Authenticated admins can upload site images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'site-images');

drop policy if exists "Authenticated admins can update site images" on storage.objects;
create policy "Authenticated admins can update site images"
  on storage.objects for update to authenticated
  using (bucket_id = 'site-images')
  with check (bucket_id = 'site-images');

drop policy if exists "Authenticated admins can delete site images" on storage.objects;
create policy "Authenticated admins can delete site images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'site-images');

-- Carry the existing shared German settings into the new Home-only row when
-- available, updating only the four Home card image paths.
do $$
begin
  if to_regclass('public.german_language_settings') is not null then
    insert into public.home_german_courses_settings (id, content)
    select 1,
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(coalesce(content, '{}'::jsonb), '{courses,0,image}', '"Images/German_A1.webp"'::jsonb, true),
            '{courses,1,image}', '"Images/German_A2.webp"'::jsonb, true
          ),
          '{courses,2,image}', '"Images/German_B1.webp"'::jsonb, true
        ),
        '{courses,3,image}', '"Images/German_B2.webp"'::jsonb, true
      )
    from public.german_language_settings
    where id = 1
    on conflict (id) do nothing;
  end if;
end
$$;

insert into public.hero_settings (id, content) values (1, '{
  "heading_start":"MASTER THE",
  "heading_highlight":"GERMAN LANGUAGE",
  "heading_end":"WITH CONFIDENCE",
  "text":"Professional German language training in Dhaka for study, career and migration purposes."
}'::jsonb) on conflict (id) do nothing;

insert into public.home_german_courses_settings (id, content) values (1, '{
  "section_heading":"Choose Your German Learning Path",
  "section_subtitle":"CEFR-aligned courses designed to prepare you for Goethe-Zertifikat exams.",
  "courses":[
    {"level":"A1","title":"German A1","image":"Images/German_A1.webp","description":"Learn essential German language skills including basic grammar, vocabulary, listening, and speaking for everyday communication and a strong foundation.","link_text":"Explore More","link_url":"German_Language/index.html#a1"},
    {"level":"A2","title":"German A2","image":"Images/German_A2.webp","description":"Build on your A1 knowledge by improving sentence structure, vocabulary, listening, and speaking skills to communicate confidently in daily situations.","link_text":"Explore More","link_url":"German_Language/index.html#a2"},
    {"level":"B1","title":"German B1","image":"Images/German_B1.webp","description":"Develop independent German communication skills for academic, professional, and social contexts with structured grammar and exam-focused practice.","link_text":"Explore More","link_url":"German_Language/index.html#b1"},
    {"level":"B2","title":"German B2","image":"Images/German_B2.webp","description":"Achieve advanced German proficiency with fluent communication, complex grammar, academic writing, and comprehensive Goethe-Zertifikat B2 preparation.","link_text":"Explore More","link_url":"German_Language/index.html#b2"}
  ]
}'::jsonb) on conflict (id) do nothing;

insert into public.home_about_settings (id, content) values (1, '{
  "heading":"About WAIS - German Language School Dhaka",
  "intro":"WAIS BD is a trusted German language institute in Dhaka, offering German language A1-B2 courses since 2013 with a focus on Goethe exam preparation and practical communication skills.",
  "body":"WAIS BD - German Language School Dhaka has been providing structured German language education since 2013. We specialize in CEFR-aligned courses from A1 to B2, designed to prepare students for Goethe-Zertifikat examinations and real-world communication.",
  "image":"Images/home-about.webp",
  "button_text":"MORE ABOUT US",
  "button_url":"About_Us/index.html"
}'::jsonb) on conflict (id) do nothing;

insert into public.home_mission_settings (id, content) values (1, '{
  "heading":"WAIS BD Mission & Vision",
  "intro":"WAIS BD is a trusted German language institute in Dhaka, offering A1-B2 courses since 2013 with a focus on Goethe exam preparation and practical communication skills.",
  "body":"WAIS BD - German Language School Dhaka has been providing structured German language education since 2013. We specialize in CEFR-aligned courses from A1 to B2, designed to prepare students for Goethe-Zertifikat examinations and real-world communication. Our experienced instructors focus on grammar accuracy, practical conversation, and exam-oriented training. With small batch sizes and personalized guidance, we help students confidently achieve their academic, professional, and migration goals in German-speaking countries.",
  "image":"Images/home-mission.webp"
}'::jsonb) on conflict (id) do nothing;

insert into public.home_journey_settings (id, content) values (1, '{
  "heading":"Start Your German Language Journey Today",
  "button_text":"Registration Now",
  "button_url":"Admission/index.html",
  "number":"3500",
  "stat_text":"Over 3k students have successfully learned German."
}'::jsonb) on conflict (id) do nothing;

insert into public.home_why_choose_settings (id, content) values (1, '{
  "heading":"Why Choose Us",
  "subtitle":"Learn German with Confidence, Quality and Proven Success",
  "cards":[
    {"title":"Expert Guidance & Quality Education","text":"Learn from experienced instructors using a CEFR-aligned curriculum designed to build strong German language skills and prepare you for Goethe-Zertifikat exams."},
    {"title":"Proven Success Since 2013","text":"With over 3,000 students trained, WAIS has a strong track record of helping learners achieve academic, professional, and migration goals."},
    {"title":"Personalized Learning Experience","text":"Small batch sizes, structured lessons, and individual attention ensure faster progress and confident communication at every level from A1 to B2."}
  ]
}'::jsonb) on conflict (id) do nothing;
