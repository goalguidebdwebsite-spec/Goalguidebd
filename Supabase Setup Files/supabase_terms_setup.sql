-- Run once in the Supabase SQL Editor to enable editable Terms page content.
create table if not exists public.terms_settings (
  id integer primary key check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.terms_settings enable row level security;

drop policy if exists "Anyone can read terms settings" on public.terms_settings;
create policy "Anyone can read terms settings"
  on public.terms_settings for select
  to anon, authenticated
  using (id = 1);

drop policy if exists "Signed-in admins can save terms settings" on public.terms_settings;
create policy "Signed-in admins can save terms settings"
  on public.terms_settings for insert
  to authenticated
  with check (id = 1);

drop policy if exists "Signed-in admins can update terms settings" on public.terms_settings;
create policy "Signed-in admins can update terms settings"
  on public.terms_settings for update
  to authenticated
  using (id = 1)
  with check (id = 1);

grant select on public.terms_settings to anon, authenticated;
grant insert, update on public.terms_settings to authenticated;

insert into public.terms_settings (id, content)
values (1, '{
  "account_registration": "Please provide accurate and complete information when creating an account. You are responsible for keeping your account details secure and confidential.",
  "eligibility": "You must be at least {minimum_age} years old to use our services. By creating an account, you confirm that you meet this age requirement.",
  "minimum_age": 16,
  "course_access": "When you enroll in a course, we grant you a personal, non-transferable license to access its course materials. Access may be time-limited or indefinite, as stated at the time of enrollment.",
  "materials_sharing": "Course materials are for your individual use only. Sharing, reproducing, or distributing course content without our written permission is prohibited.",
  "payment_terms": "Course fees are due at the time of enrollment. Prices and available payment methods may change; the applicable fee and methods will be confirmed during registration.",
  "refund_policy": "You may request a refund within {refund_days} days of enrollment. Refund requests made after this period may not be accepted. Any course-specific conditions will be shared at enrollment.",
  "refund_days": 7,
  "respectful_behavior": "We aim to maintain a respectful learning environment. Harassment, abusive language, or disruptive behavior is not permitted in our classes or on our platform.",
  "prohibited_activities": "You may not use our services to disrupt classes, misuse course materials, interfere with our systems, or engage in unlawful activity.",
  "intellectual_property": "Our course materials, lessons, graphics, logos, and other content belong to Goal Guide BD or their respective rights holders and are protected by applicable intellectual property laws. You may not reproduce, distribute, or modify them without permission.",
  "liability": "We work to provide reliable courses and services, but we cannot guarantee specific learning, examination, or career outcomes. To the extent permitted by law, Goal Guide BD is not liable for indirect losses arising from use of our services.",
  "privacy_protection": "We respect your privacy. Please read our Privacy Policy to learn how we collect, use, and protect your personal information.",
  "modifications": "We may update these Terms and Conditions or our services from time to time. We will communicate significant changes through our website or by email. Continued use of our services after an update means you accept the revised terms.",
  "governing_law": "These Terms and Conditions are governed by the laws of {jurisdiction}. Any dispute arising from our services will be handled by the appropriate courts in {jurisdiction}.",
  "jurisdiction": "Bangladesh",
  "contact_intro": "If you have questions about these Terms and Conditions, please contact us:",
  "whatsapp": "+88 01717099770",
  "phone": "+88 01717099770",
  "email": "info.waisbd@gmail.com",
  "address": "House 2/1, 3rd Floor, Kalabagan, Dhanmondi, Dhaka 1205",
  "closing_note": "These Terms and Conditions are intended to make our services clear and transparent. Please contact us if you need any clarification."
}'::jsonb)
on conflict (id) do nothing;
