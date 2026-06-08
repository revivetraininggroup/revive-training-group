-- Client onboarding form
create table public.client_onboarding (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id) on delete cascade not null unique,

  -- Injuries / limitations
  injuries text,
  physical_limitations text,

  -- Training experience & equipment
  training_experience text, -- beginner / intermediate / advanced
  years_training text,
  equipment_access text, -- home / gym / both
  equipment_details text,

  -- Schedule & availability
  days_per_week int,
  preferred_days text,
  session_duration text, -- 30 / 45 / 60 / 90 min
  best_time_to_train text, -- morning / afternoon / evening

  -- Lifestyle
  job_type text, -- sedentary / active / physical labor
  avg_sleep_hours text,
  stress_level text, -- low / moderate / high
  water_intake text,

  -- Supplements & nutrition
  current_supplements text,
  dietary_restrictions text,
  meals_per_day text,
  nutrition_experience text,

  -- Anything else
  additional_notes text,

  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.client_onboarding enable row level security;

create policy "Client manages own onboarding" on public.client_onboarding
  for all using (client_id = auth.uid());

create policy "Coach reads client onboarding" on public.client_onboarding
  for select using (
    exists (select 1 from public.clients where id = client_id and coach_id = auth.uid())
  );

grant all on public.client_onboarding to authenticated;
