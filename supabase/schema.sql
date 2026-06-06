-- CareLink NDIS Platform — Database Schema
-- Run this against your Supabase project (SQL editor or supabase db push)

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists public.profiles (
  id uuid references auth.users primary key,
  full_name text,
  role text not null check (role in ('participant', 'worker', 'guardian')),
  ndis_number text,
  worker_screening_check text,
  created_at timestamptz default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  preferred_name text,
  date_of_birth date,
  primary_disability text,
  secondary_disabilities text[],
  communication_profile text,
  pronoun text,
  profile_photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.support_manuals (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.participants(id) on delete cascade,
  title text not null,
  content text not null,
  category text check (category in ('daily_routine', 'communication', 'mobility', 'personal_care', 'general')),
  is_critical boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.incident_types (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.participants(id) on delete cascade,
  name text not null,
  description text,
  response_steps text[],
  when_to_call_000 boolean default false,
  when_to_call_support_coordinator boolean default false,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.dietary_requirements (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.participants(id) on delete cascade,
  requirement_type text check (requirement_type in ('allergy', 'intolerance', 'preference', 'texture', 'religious', 'medical')),
  description text not null,
  severity text check (severity in ('life_threatening', 'serious', 'mild', 'preference')),
  notes text
);

create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.participants(id) on delete cascade,
  full_name text not null,
  relationship text not null,
  phone_primary text not null,
  phone_secondary text,
  is_primary_contact boolean default false,
  notes text
);

create table if not exists public.medical_info (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.participants(id) on delete cascade,
  gp_name text,
  gp_phone text,
  specialist_name text,
  specialist_phone text,
  medications jsonb,
  diagnoses jsonb,
  medicare_number text,
  health_insurance text,
  advance_care_directive_url text
);

create table if not exists public.behaviour_support_plans (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.participants(id) on delete cascade,
  title text not null,
  document_url text,
  summary text,
  triggers text[],
  de_escalation_strategies text[],
  last_reviewed date,
  reviewed_by text
);

create table if not exists public.worker_participant_links (
  id uuid primary key default gen_random_uuid(),
  worker_profile_id uuid references public.profiles(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete cascade,
  status text check (status in ('pending', 'approved', 'revoked')) default 'pending',
  linked_at timestamptz default now(),
  linked_by uuid references public.profiles(id),
  unique(worker_profile_id, participant_id)
);

create table if not exists public.shift_notes (
  id uuid primary key default gen_random_uuid(),
  worker_profile_id uuid references public.profiles(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete cascade,
  shift_date date not null,
  shift_start timestamptz,
  shift_end timestamptz,
  note_text text not null,
  mood_rating int check (mood_rating between 1 and 5),
  incidents_occurred boolean default false,
  incident_description text,
  created_at timestamptz default now()
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  worker_profile_id uuid references public.profiles(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete cascade,
  started_at timestamptz default now(),
  ended_at timestamptz
  -- NOTE: Individual messages are NOT stored in DB by design.
  -- Chat history lives in client state only for the duration of the session.
  -- This is a deliberate privacy decision. See PRIVACY.md.
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.participants enable row level security;
alter table public.support_manuals enable row level security;
alter table public.incident_types enable row level security;
alter table public.dietary_requirements enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.medical_info enable row level security;
alter table public.behaviour_support_plans enable row level security;
alter table public.worker_participant_links enable row level security;
alter table public.shift_notes enable row level security;
alter table public.chat_sessions enable row level security;

-- profiles: users can read and update their own profile
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- participants: owner can do all; approved workers can select
create policy "participants_select_own" on public.participants
  for select using (profile_id = auth.uid());

create policy "participants_update_own" on public.participants
  for update using (profile_id = auth.uid());

create policy "participants_insert_own" on public.participants
  for insert with check (profile_id = auth.uid());

create policy "participants_select_worker" on public.participants
  for select using (
    exists (
      select 1 from public.worker_participant_links wpl
      where wpl.worker_profile_id = auth.uid()
        and wpl.participant_id = participants.id
        and wpl.status = 'approved'
    )
  );

-- support_manuals: approved workers can select; participants can manage their own
create policy "support_manuals_worker_select" on public.support_manuals
  for select using (
    exists (
      select 1 from public.worker_participant_links wpl
      where wpl.worker_profile_id = auth.uid()
        and wpl.participant_id = support_manuals.participant_id
        and wpl.status = 'approved'
    )
  );

create policy "support_manuals_participant" on public.support_manuals
  for all using (
    exists (
      select 1 from public.participants p where p.id = support_manuals.participant_id and p.profile_id = auth.uid()
    )
  );

-- incident_types
create policy "incident_types_worker_select" on public.incident_types
  for select using (
    exists (
      select 1 from public.worker_participant_links wpl
      where wpl.worker_profile_id = auth.uid()
        and wpl.participant_id = incident_types.participant_id
        and wpl.status = 'approved'
    )
  );

create policy "incident_types_participant" on public.incident_types
  for all using (
    exists (
      select 1 from public.participants p where p.id = incident_types.participant_id and p.profile_id = auth.uid()
    )
  );

-- dietary_requirements
create policy "dietary_worker_select" on public.dietary_requirements
  for select using (
    exists (
      select 1 from public.worker_participant_links wpl
      where wpl.worker_profile_id = auth.uid()
        and wpl.participant_id = dietary_requirements.participant_id
        and wpl.status = 'approved'
    )
  );

create policy "dietary_participant" on public.dietary_requirements
  for all using (
    exists (
      select 1 from public.participants p where p.id = dietary_requirements.participant_id and p.profile_id = auth.uid()
    )
  );

-- emergency_contacts
create policy "contacts_worker_select" on public.emergency_contacts
  for select using (
    exists (
      select 1 from public.worker_participant_links wpl
      where wpl.worker_profile_id = auth.uid()
        and wpl.participant_id = emergency_contacts.participant_id
        and wpl.status = 'approved'
    )
  );

create policy "contacts_participant" on public.emergency_contacts
  for all using (
    exists (
      select 1 from public.participants p where p.id = emergency_contacts.participant_id and p.profile_id = auth.uid()
    )
  );

-- medical_info
create policy "medical_worker_select" on public.medical_info
  for select using (
    exists (
      select 1 from public.worker_participant_links wpl
      where wpl.worker_profile_id = auth.uid()
        and wpl.participant_id = medical_info.participant_id
        and wpl.status = 'approved'
    )
  );

create policy "medical_participant" on public.medical_info
  for all using (
    exists (
      select 1 from public.participants p where p.id = medical_info.participant_id and p.profile_id = auth.uid()
    )
  );

-- behaviour_support_plans
create policy "bsp_worker_select" on public.behaviour_support_plans
  for select using (
    exists (
      select 1 from public.worker_participant_links wpl
      where wpl.worker_profile_id = auth.uid()
        and wpl.participant_id = behaviour_support_plans.participant_id
        and wpl.status = 'approved'
    )
  );

create policy "bsp_participant" on public.behaviour_support_plans
  for all using (
    exists (
      select 1 from public.participants p where p.id = behaviour_support_plans.participant_id and p.profile_id = auth.uid()
    )
  );

-- worker_participant_links: workers and participants can view their own links
create policy "links_worker_select" on public.worker_participant_links
  for select using (worker_profile_id = auth.uid());

create policy "links_participant_select" on public.worker_participant_links
  for select using (
    exists (
      select 1 from public.participants p
      where p.id = worker_participant_links.participant_id and p.profile_id = auth.uid()
    )
  );

-- shift_notes: workers can insert and select their own; participants can select about themselves
create policy "shift_notes_worker_insert" on public.shift_notes
  for insert with check (worker_profile_id = auth.uid());

create policy "shift_notes_worker_select" on public.shift_notes
  for select using (worker_profile_id = auth.uid());

create policy "shift_notes_participant_select" on public.shift_notes
  for select using (
    exists (
      select 1 from public.participants p
      where p.id = shift_notes.participant_id and p.profile_id = auth.uid()
    )
  );

-- chat_sessions: workers can insert only (no message content stored)
create policy "chat_sessions_worker_insert" on public.chat_sessions
  for insert with check (worker_profile_id = auth.uid());

create policy "chat_sessions_worker_upsert" on public.chat_sessions
  for update using (worker_profile_id = auth.uid());
