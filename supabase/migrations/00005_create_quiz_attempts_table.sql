create table quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete set null,
  quiz_id uuid references quizzes(id) on delete set null,
  score integer not null,
  total_questions integer not null,
  created_at timestamp with time zone default now()
);

alter table quiz_attempts enable row level security;

create policy "Students can insert their own quiz results"
  on quiz_attempts for insert
  with check (auth.uid() = student_id);

create policy "Students can read their own quiz results"
  on quiz_attempts for select
  using (auth.uid() = student_id);

create policy "Admins can read all quiz results"
  on quiz_attempts for select
  using (exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  ));
