-- Create saved_questions table
create table if not exists saved_questions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  question jsonb not null,
  question_index int not null,
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Add RLS policies
alter table saved_questions enable row level security;

-- Students can view their own saved questions
create policy "Students can view own saved questions"
  on saved_questions for select
  using (auth.uid() = student_id);

-- Students can insert their own saved questions
create policy "Students can save questions"
  on saved_questions for insert
  with check (auth.uid() = student_id);

-- Students can delete their own saved questions
create policy "Students can delete saved questions"
  on saved_questions for delete
  using (auth.uid() = student_id);

-- Create index for faster queries
create index if not exists idx_saved_questions_student on saved_questions(student_id, saved_at desc);
create index if not exists idx_saved_questions_lesson on saved_questions(lesson_id);
