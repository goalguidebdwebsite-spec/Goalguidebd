-- Goal Guide BD: Class Schedule settings for the admin editor and public page.
-- Re-running this file preserves any schedule already saved in row id=1.

create table if not exists public.class_schedule_settings (
  id integer primary key check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.class_schedule_settings enable row level security;

drop policy if exists "Public can read Class Schedule settings" on public.class_schedule_settings;
create policy "Public can read Class Schedule settings"
  on public.class_schedule_settings
  for select
  to anon, authenticated
  using (id = 1);

drop policy if exists "Authenticated admins can insert Class Schedule settings" on public.class_schedule_settings;
create policy "Authenticated admins can insert Class Schedule settings"
  on public.class_schedule_settings
  for insert
  to authenticated
  with check (id = 1);

drop policy if exists "Authenticated admins can update Class Schedule settings" on public.class_schedule_settings;
create policy "Authenticated admins can update Class Schedule settings"
  on public.class_schedule_settings
  for update
  to authenticated
  using (id = 1)
  with check (id = 1);

revoke all on table public.class_schedule_settings from public, anon, authenticated;
grant select on table public.class_schedule_settings to anon, authenticated;
grant insert, update on table public.class_schedule_settings to authenticated;

insert into public.class_schedule_settings (id, content)
values (
  1,
  '{
    "weekday_heading": "Saturday to Thursday Batch",
    "weekday_rows": [
      {"session": "Morning", "time": "9:00 am", "days": "Sat, Mon, Wed or Sun, Tue, Thu"},
      {"session": "Forenoon", "time": "11:00 am", "days": "Sat, Mon, Wed or Sun, Tue, Thu"},
      {"session": "Afternoon", "time": "3:30 pm", "days": "Sat, Mon, Wed or Sun, Tue, Thu"},
      {"session": "Evening", "time": "7:00 pm", "days": "Sat, Mon, Wed or Sun, Tue, Thu"},
      {"session": "Night (online)", "time": "9:00 pm", "days": "Sat, Mon, Wed or Sun, Tue, Thu"}
    ],
    "weekend_heading": "Weekend Batch",
    "weekend_rows": [
      {"session": "Afternoon", "time": "3:30 pm", "days": "Friday & Saturday"},
      {"session": "Evening", "time": "6:45 pm", "days": "Friday & Saturday"}
    ]
  }'::jsonb
)
on conflict (id) do nothing;
