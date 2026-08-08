create or replace function get_student_rank(target_id uuid)
returns table (rank bigint, total bigint, avg_score numeric) as $$
begin
  return query
  with student_stats as (
    select student_id,
           avg(score::numeric / nullif(total_questions, 0) * 100) as avg_score
    from quiz_attempts
    group by student_id
  )
  select
    coalesce((select count(*) from student_stats s2 where s2.avg_score > coalesce(s1.avg_score, 0)) + 1, 1)::bigint as rank,
    (select count(*) from student_stats)::bigint as total,
    coalesce(s1.avg_score, 0) as avg_score
  from student_stats s1
  where s1.student_id = target_id;
end;
$$ language plpgsql security definer;