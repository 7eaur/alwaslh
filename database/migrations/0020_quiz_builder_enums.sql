ALTER TYPE quiz_status ADD VALUE IF NOT EXISTS 'review';
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'direct';
ALTER TYPE question_bank_event_action ADD VALUE IF NOT EXISTS 'regenerate';
