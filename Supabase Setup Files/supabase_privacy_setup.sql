-- Run once in the Supabase SQL Editor to enable editable Privacy Policy content.
create table if not exists public.privacy_settings (
  id integer primary key check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.privacy_settings enable row level security;

drop policy if exists "Anyone can read privacy settings" on public.privacy_settings;
create policy "Anyone can read privacy settings"
  on public.privacy_settings for select
  to anon, authenticated
  using (id = 1);

drop policy if exists "Signed-in admins can save privacy settings" on public.privacy_settings;
create policy "Signed-in admins can save privacy settings"
  on public.privacy_settings for insert
  to authenticated
  with check (id = 1);

drop policy if exists "Signed-in admins can update privacy settings" on public.privacy_settings;
create policy "Signed-in admins can update privacy settings"
  on public.privacy_settings for update
  to authenticated
  using (id = 1)
  with check (id = 1);

grant select on public.privacy_settings to anon, authenticated;
grant insert, update on public.privacy_settings to authenticated;

insert into public.privacy_settings (id, content)
values (1, '{
  "personal_information": "When you submit a registration or contact form, we may collect the details you provide, such as your name, contact information, course interests, address, and any files you choose to send.",
  "usage_information": "Basic technical information may be processed when you use this website to deliver pages, maintain service reliability, and help protect the site from misuse.",
  "use_information": "We use submitted information to respond to questions, manage course registration, provide requested services, communicate relevant updates, and maintain the security and operation of our website.",
  "sharing_information": "We may share information with trusted service providers that help us host the website, process forms, store data, or provide services. We share only what is needed for those purposes and do not sell personal information.",
  "cookies_storage": "This website may use browser storage to remember published site content and improve page loading. Your browser settings let you manage or clear locally stored website data.",
  "data_security": "We use reasonable safeguards designed to protect information from unauthorized access, loss, or misuse. No website or method of online transmission can be guaranteed completely secure.",
  "data_retention": "We keep information for as long as needed to respond to you, provide our services, meet operational needs, and handle any follow-up matters. You may contact us to ask about information you have submitted.",
  "privacy_choices": "You may contact us to ask what personal information you have provided, request a correction, or ask us to remove it where we are able to do so. We may need to retain some records for legitimate operational or legal reasons.",
  "children_privacy": "Our services are intended for people who are at least {minimum_age} years old. If you believe a child has submitted personal information to us, please contact us so we can review the request.",
  "minimum_age": 16,
  "policy_changes": "We may update this Privacy Policy when our services or information practices change. The latest version will be published on this page, with its effective wording applying from the time it is posted.",
  "contact_intro": "If you have questions or requests about this Privacy Policy or your personal information, please contact us:",
  "whatsapp": "+88 01717099770",
  "phone": "+88 01717099770",
  "email": "info.waisbd@gmail.com",
  "address": "House 2/1, 3rd Floor, Kalabagan, Dhanmondi, Dhaka 1205",
  "closing_note": "We will review privacy questions and requests sent through the contact details above."
}'::jsonb)
on conflict (id) do nothing;
