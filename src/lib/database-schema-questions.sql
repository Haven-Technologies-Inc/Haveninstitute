-- ============================================================================
-- QUESTIONS & QUIZ SESSIONS - Extension to database schema
-- ============================================================================
-- This file adds standalone questions table and quiz session management

-- ============================================================================
-- QUESTIONS (Question Bank)
-- ============================================================================
-- Standalone questions table for question bank (CAT, practice, etc.)
-- This is separate from quiz_questions which are tied to specific quizzes
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of answer options
  correct_answer INTEGER NOT NULL, -- Index of correct option
  explanation TEXT NOT NULL,
  rationales TEXT[], -- Individual rationales for each option
  category TEXT NOT NULL,
  subcategory TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  discrimination DECIMAL(3, 2), -- Discrimination parameter for IRT/CAT (0-2)
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'select_all', 'fill_blank', 'ordered_response')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0, -- How many times this question has been used
  success_rate DECIMAL(5, 2), -- Overall success rate for analytics
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- QUIZ SESSIONS
-- ============================================================================
-- Active quiz/test sessions for tracking user progress through a quiz
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL, -- NULL for CAT or practice sessions
  session_type TEXT NOT NULL CHECK (session_type IN ('quiz', 'cat', 'practice', 'timed_practice')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),

  -- Session configuration
  total_questions INTEGER NOT NULL,
  time_limit INTEGER, -- In seconds, NULL for untimed
  passing_score INTEGER DEFAULT 70,

  -- Current progress
  current_question_index INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,

  -- Question order and answers
  question_ids UUID[] NOT NULL, -- Ordered array of question IDs
  user_answers JSONB DEFAULT '[]'::jsonb, -- Array of {questionId, answer, isCorrect, timeSpent}

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_elapsed INTEGER DEFAULT 0, -- Total time spent in seconds

  -- CAT-specific fields
  ability_estimate DECIMAL(5, 2), -- Current ability estimate for CAT
  confidence_level DECIMAL(5, 2), -- Confidence in ability estimate

  -- Results (populated on completion)
  final_score INTEGER,
  final_percentage DECIMAL(5, 2),
  passed BOOLEAN,

  -- Metadata
  settings JSONB DEFAULT '{}'::jsonb, -- Additional session settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- QUESTION USAGE TRACKING
-- ============================================================================
-- Track which questions were used in which sessions for analytics
CREATE TABLE IF NOT EXISTS public.question_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user_answer INTEGER, -- Index of selected answer
  is_correct BOOLEAN NOT NULL,
  time_spent INTEGER, -- Seconds spent on this question
  presented_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(session_id, question_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Questions indexes
CREATE INDEX idx_questions_category ON public.questions(category);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX idx_questions_category_difficulty ON public.questions(category, difficulty);
CREATE INDEX idx_questions_is_active ON public.questions(is_active);
CREATE INDEX idx_questions_created_by ON public.questions(created_by);
CREATE INDEX idx_questions_tags ON public.questions USING GIN(tags);

-- Quiz sessions indexes
CREATE INDEX idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_quiz_id ON public.quiz_sessions(quiz_id);
CREATE INDEX idx_quiz_sessions_status ON public.quiz_sessions(status);
CREATE INDEX idx_quiz_sessions_session_type ON public.quiz_sessions(session_type);
CREATE INDEX idx_quiz_sessions_user_status ON public.quiz_sessions(user_id, status);
CREATE INDEX idx_quiz_sessions_started_at ON public.quiz_sessions(started_at);

-- Question usage indexes
CREATE INDEX idx_question_usage_question_id ON public.question_usage(question_id);
CREATE INDEX idx_question_usage_session_id ON public.question_usage(session_id);
CREATE INDEX idx_question_usage_user_id ON public.question_usage(user_id);
CREATE INDEX idx_question_usage_is_correct ON public.question_usage(is_correct);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_usage ENABLE ROW LEVEL SECURITY;

-- Questions policies
CREATE POLICY "Public questions are viewable by everyone" ON public.questions
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create questions" ON public.questions
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own questions" ON public.questions
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own questions" ON public.questions
  FOR DELETE USING (created_by = auth.uid());

-- Quiz sessions policies
CREATE POLICY "Users can view their own quiz sessions" ON public.quiz_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz sessions" ON public.quiz_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz sessions" ON public.quiz_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quiz sessions" ON public.quiz_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Question usage policies
CREATE POLICY "Users can view their own question usage" ON public.question_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own question usage" ON public.question_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update question usage stats
CREATE OR REPLACE FUNCTION update_question_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.questions
  SET
    usage_count = usage_count + 1,
    success_rate = (
      SELECT AVG(CASE WHEN is_correct THEN 100 ELSE 0 END)
      FROM public.question_usage
      WHERE question_id = NEW.question_id
    )
  WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update question stats on new usage
CREATE TRIGGER update_question_stats_trigger
  AFTER INSERT ON public.question_usage
  FOR EACH ROW EXECUTE FUNCTION update_question_stats();

-- Function to update quiz session last activity
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update session last activity
CREATE TRIGGER update_quiz_session_activity
  BEFORE UPDATE ON public.quiz_sessions
  FOR EACH ROW EXECUTE FUNCTION update_session_activity();

-- Function to update updated_at timestamp for questions
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for quiz sessions updated_at
CREATE TRIGGER update_quiz_sessions_updated_at
  BEFORE UPDATE ON public.quiz_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPFUL VIEWS
-- ============================================================================

-- View for question statistics
CREATE OR REPLACE VIEW question_stats AS
SELECT
  q.id,
  q.question,
  q.category,
  q.difficulty,
  q.usage_count,
  q.success_rate,
  COUNT(qu.id) as total_attempts,
  SUM(CASE WHEN qu.is_correct THEN 1 ELSE 0 END) as correct_attempts,
  AVG(qu.time_spent) as avg_time_spent
FROM public.questions q
LEFT JOIN public.question_usage qu ON q.id = qu.question_id
GROUP BY q.id, q.question, q.category, q.difficulty, q.usage_count, q.success_rate;

-- View for active quiz sessions
CREATE OR REPLACE VIEW active_quiz_sessions AS
SELECT
  qs.*,
  u.name as user_name,
  u.email as user_email,
  qz.title as quiz_title
FROM public.quiz_sessions qs
JOIN public.users u ON qs.user_id = u.id
LEFT JOIN public.quizzes qz ON qs.quiz_id = qz.id
WHERE qs.status = 'active';
