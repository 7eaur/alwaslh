-- Add 'cancelled' status to question_generation_tasks
ALTER TABLE question_generation_tasks 
DROP CONSTRAINT IF EXISTS question_generation_tasks_status_check;

ALTER TABLE question_generation_tasks 
ADD CONSTRAINT question_generation_tasks_status_check 
CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'));