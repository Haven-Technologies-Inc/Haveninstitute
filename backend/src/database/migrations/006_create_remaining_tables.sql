-- Haven Institute - Remaining Database Tables Migration
-- Run after schema.sql

USE haven_institute;

-- ============================================================================
-- 8. QUIZ RESPONSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS quiz_responses (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id CHAR(36) NOT NULL,
    question_id CHAR(36) NOT NULL,
    user_answer JSON NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INT DEFAULT 0,
    question_number INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (session_id) REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_question_id (question_id)
) ENGINE=InnoDB;

-- ============================================================================
-- 9. CAT SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cat_sessions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    status ENUM('in_progress', 'completed', 'abandoned', 'passed', 'failed') DEFAULT 'in_progress',
    
    -- CAT Algorithm State
    ability_estimate DECIMAL(5, 3) DEFAULT 0.000,
    standard_error DECIMAL(5, 3) DEFAULT 1.000,
    confidence_interval_lower DECIMAL(5, 3),
    confidence_interval_upper DECIMAL(5, 3),
    passing_probability DECIMAL(5, 2) DEFAULT 50.00,
    
    -- Progress
    questions_answered INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    current_difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    
    -- Question Tracking
    question_ids JSON,
    answered_question_ids JSON,
    
    -- NCLEX Rules
    minimum_questions INT DEFAULT 75,
    maximum_questions INT DEFAULT 145,
    
    -- Timing
    time_limit_minutes INT DEFAULT 300,
    time_spent_seconds INT DEFAULT 0,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    
    -- Results
    final_result ENUM('pass', 'fail', 'inconclusive'),
    category_performance JSON,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_started_at (started_at)
) ENGINE=InnoDB;

-- ============================================================================
-- 10. CAT RESPONSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cat_responses (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id CHAR(36) NOT NULL,
    question_id CHAR(36) NOT NULL,
    user_answer JSON NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INT DEFAULT 0,
    question_number INT NOT NULL,
    
    -- IRT Data at time of response
    ability_before DECIMAL(5, 3),
    ability_after DECIMAL(5, 3),
    standard_error_before DECIMAL(5, 3),
    standard_error_after DECIMAL(5, 3),
    question_difficulty DECIMAL(5, 3),
    question_discrimination DECIMAL(5, 3),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (session_id) REFERENCES cat_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_question_id (question_id)
) ENGINE=InnoDB;

-- ============================================================================
-- 11. STUDY GOALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS study_goals (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    goal_type ENUM('questions_per_day', 'study_hours', 'cat_tests', 'flashcards', 'custom') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_value INT NOT NULL,
    current_value INT DEFAULT 0,
    period ENUM('daily', 'weekly', 'monthly', 'total') DEFAULT 'daily',
    status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_period (period)
) ENGINE=InnoDB;

-- ============================================================================
-- 12. STUDY ACTIVITIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS study_activities (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    activity_type ENUM('quiz', 'cat_test', 'flashcard', 'reading', 'video', 'practice', 'review') NOT NULL,
    reference_id CHAR(36),
    reference_type VARCHAR(50),
    duration_minutes INT DEFAULT 0,
    questions_answered INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    points_earned INT DEFAULT 0,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================================
-- 13. STUDY PLANS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS study_plans (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    exam_date DATE,
    status ENUM('draft', 'active', 'completed', 'abandoned') DEFAULT 'draft',
    study_hours_per_day DECIMAL(4, 2) DEFAULT 2.00,
    preferred_study_time VARCHAR(50),
    weak_areas JSON,
    strong_areas JSON,
    ai_generated BOOLEAN DEFAULT FALSE,
    total_items INT DEFAULT 0,
    completed_items INT DEFAULT 0,
    progress_percentage DECIMAL(5, 2) DEFAULT 0.00,
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_exam_date (exam_date)
) ENGINE=InnoDB;

-- ============================================================================
-- 14. STUDY PLAN ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS study_plan_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    plan_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    item_type ENUM('reading', 'quiz', 'flashcards', 'video', 'practice', 'review', 'cat_test') NOT NULL,
    category_id INT,
    scheduled_date DATE,
    scheduled_time TIME,
    duration_minutes INT DEFAULT 30,
    status ENUM('pending', 'in_progress', 'completed', 'skipped') DEFAULT 'pending',
    priority INT DEFAULT 0,
    order_index INT DEFAULT 0,
    completed_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (plan_id) REFERENCES study_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES nclex_categories(id) ON DELETE SET NULL,
    INDEX idx_plan_id (plan_id),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================================================
-- 15. FLASHCARD DECKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS flashcard_decks (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT,
    is_public BOOLEAN DEFAULT FALSE,
    is_official BOOLEAN DEFAULT FALSE,
    card_count INT DEFAULT 0,
    difficulty ENUM('easy', 'medium', 'hard', 'mixed') DEFAULT 'mixed',
    tags JSON,
    cover_image_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES nclex_categories(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_is_public (is_public)
) ENGINE=InnoDB;

-- ============================================================================
-- 16. FLASHCARDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS flashcards (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    deck_id CHAR(36) NOT NULL,
    front_content TEXT NOT NULL,
    back_content TEXT NOT NULL,
    front_image_url VARCHAR(500),
    back_image_url VARCHAR(500),
    hints JSON,
    tags JSON,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    order_index INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (deck_id) REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    INDEX idx_deck_id (deck_id)
) ENGINE=InnoDB;

-- ============================================================================
-- 17. USER FLASHCARD PROGRESS TABLE (SRS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_flashcard_progress (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    flashcard_id CHAR(36) NOT NULL,
    deck_id CHAR(36) NOT NULL,
    
    -- Spaced Repetition Data
    ease_factor DECIMAL(4, 2) DEFAULT 2.50,
    interval_days INT DEFAULT 1,
    repetitions INT DEFAULT 0,
    next_review_date DATE,
    last_review_date DATE,
    
    -- Performance
    times_reviewed INT DEFAULT 0,
    times_correct INT DEFAULT 0,
    times_incorrect INT DEFAULT 0,
    average_response_time_ms INT,
    
    -- Status
    status ENUM('new', 'learning', 'review', 'mastered') DEFAULT 'new',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE,
    FOREIGN KEY (deck_id) REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_flashcard (user_id, flashcard_id),
    INDEX idx_user_id (user_id),
    INDEX idx_next_review (next_review_date),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================================================
-- 18. STUDY MATERIALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS study_materials (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    material_type ENUM('ebook', 'article', 'video', 'audio', 'document', 'link') NOT NULL,
    category_id INT,
    
    -- Content
    content_url VARCHAR(500),
    file_path VARCHAR(500),
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    duration_minutes INT,
    page_count INT,
    
    -- Metadata
    author VARCHAR(255),
    publisher VARCHAR(255),
    isbn VARCHAR(20),
    publication_date DATE,
    tags JSON,
    cover_image_url VARCHAR(500),
    
    -- Access
    is_premium BOOLEAN DEFAULT FALSE,
    price DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Stats
    view_count INT DEFAULT 0,
    download_count INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    
    created_by CHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES nclex_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_material_type (material_type),
    INDEX idx_category_id (category_id),
    INDEX idx_is_premium (is_premium)
) ENGINE=InnoDB;

-- ============================================================================
-- 19. USER STUDY MATERIALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_study_materials (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    material_id CHAR(36) NOT NULL,
    
    -- Progress
    progress_percentage DECIMAL(5, 2) DEFAULT 0.00,
    current_page INT DEFAULT 0,
    current_position INT DEFAULT 0,
    time_spent_minutes INT DEFAULT 0,
    
    -- Status
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    is_favorite BOOLEAN DEFAULT FALSE,
    
    -- Notes & Highlights
    notes JSON,
    highlights JSON,
    bookmarks JSON,
    
    -- Rating
    user_rating INT,
    review TEXT,
    
    started_at DATETIME,
    completed_at DATETIME,
    last_accessed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES study_materials(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_material (user_id, material_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================================================
-- 20. STUDY GROUPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS study_groups (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id CHAR(36) NOT NULL,
    
    -- Settings
    is_public BOOLEAN DEFAULT TRUE,
    max_members INT DEFAULT 50,
    join_code VARCHAR(20) UNIQUE,
    
    -- Focus
    focus_categories JSON,
    exam_date DATE,
    
    -- Stats
    member_count INT DEFAULT 1,
    message_count INT DEFAULT 0,
    
    -- Media
    avatar_url VARCHAR(500),
    banner_url VARCHAR(500),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id),
    INDEX idx_is_public (is_public),
    INDEX idx_join_code (join_code)
) ENGINE=InnoDB;

-- ============================================================================
-- 21. STUDY GROUP MEMBERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS study_group_members (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    group_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    role ENUM('owner', 'admin', 'moderator', 'member') DEFAULT 'member',
    status ENUM('active', 'muted', 'banned') DEFAULT 'active',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active_at DATETIME,

    FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_group_member (group_id, user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ============================================================================
-- 22. STUDY GROUP MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS study_group_messages (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    group_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file', 'quiz', 'flashcard', 'system') DEFAULT 'text',
    attachment_url VARCHAR(500),
    reply_to_id CHAR(36),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_id) REFERENCES study_group_messages(id) ON DELETE SET NULL,
    INDEX idx_group_id (group_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================================
-- 23. FORUM POSTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS forum_posts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('general', 'question', 'study_tips', 'resources', 'success_stories', 'support') DEFAULT 'general',
    tags JSON,
    
    -- Stats
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    
    -- Status
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_answered BOOLEAN DEFAULT FALSE,
    accepted_answer_id CHAR(36),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_search (title, content)
) ENGINE=InnoDB;

-- ============================================================================
-- 24. FORUM COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS forum_comments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    post_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    parent_id CHAR(36),
    content TEXT NOT NULL,
    like_count INT DEFAULT 0,
    is_accepted BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES forum_comments(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ============================================================================
-- 25. USER SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL UNIQUE,
    
    -- Notification Preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    study_reminders BOOLEAN DEFAULT TRUE,
    weekly_reports BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    
    -- Study Preferences
    daily_goal_questions INT DEFAULT 20,
    daily_goal_minutes INT DEFAULT 60,
    preferred_difficulty ENUM('easy', 'medium', 'hard', 'adaptive') DEFAULT 'adaptive',
    show_explanations BOOLEAN DEFAULT TRUE,
    auto_advance BOOLEAN DEFAULT FALSE,
    
    -- Display Preferences
    theme ENUM('light', 'dark', 'system') DEFAULT 'system',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    
    -- Privacy
    profile_visibility ENUM('public', 'friends', 'private') DEFAULT 'public',
    show_progress BOOLEAN DEFAULT TRUE,
    show_activity BOOLEAN DEFAULT TRUE,
    
    -- Security
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 26. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    type ENUM('system', 'achievement', 'reminder', 'social', 'subscription', 'study') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    metadata JSON,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================================
-- 27. ACHIEVEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS achievements (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('study', 'quiz', 'cat', 'social', 'streak', 'special') NOT NULL,
    icon_url VARCHAR(500),
    points INT DEFAULT 0,
    requirement_type VARCHAR(50) NOT NULL,
    requirement_value INT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================================
-- 28. USER ACHIEVEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    achievement_id CHAR(36) NOT NULL,
    progress INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    INDEX idx_user_id (user_id),
    INDEX idx_is_completed (is_completed)
) ENGINE=InnoDB;

-- ============================================================================
-- 29. FILE UPLOADS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS file_uploads (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    upload_type ENUM('avatar', 'attachment', 'material', 'question_image', 'other') DEFAULT 'other',
    reference_id CHAR(36),
    reference_type VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_upload_type (upload_type)
) ENGINE=InnoDB;

-- ============================================================================
-- SEED DEFAULT ACHIEVEMENTS
-- ============================================================================
INSERT INTO achievements (id, code, name, description, category, points, requirement_type, requirement_value) VALUES
(UUID(), 'first_quiz', 'First Steps', 'Complete your first quiz', 'quiz', 10, 'quizzes_completed', 1),
(UUID(), 'quiz_master_10', 'Quiz Enthusiast', 'Complete 10 quizzes', 'quiz', 50, 'quizzes_completed', 10),
(UUID(), 'quiz_master_50', 'Quiz Master', 'Complete 50 quizzes', 'quiz', 100, 'quizzes_completed', 50),
(UUID(), 'first_cat', 'CAT Beginner', 'Complete your first CAT test', 'cat', 25, 'cat_tests_completed', 1),
(UUID(), 'cat_champion', 'CAT Champion', 'Pass a CAT test', 'cat', 100, 'cat_tests_passed', 1),
(UUID(), 'streak_3', 'Getting Started', '3-day study streak', 'streak', 15, 'study_streak', 3),
(UUID(), 'streak_7', 'Week Warrior', '7-day study streak', 'streak', 50, 'study_streak', 7),
(UUID(), 'streak_30', 'Monthly Master', '30-day study streak', 'streak', 200, 'study_streak', 30),
(UUID(), 'flashcard_100', 'Card Shark', 'Review 100 flashcards', 'study', 30, 'flashcards_reviewed', 100),
(UUID(), 'questions_500', 'Question Crusher', 'Answer 500 questions', 'study', 100, 'questions_answered', 500),
(UUID(), 'perfect_quiz', 'Perfectionist', 'Get 100% on a quiz', 'quiz', 50, 'perfect_quizzes', 1),
(UUID(), 'social_butterfly', 'Social Butterfly', 'Join 3 study groups', 'social', 25, 'groups_joined', 3),
(UUID(), 'helpful_member', 'Helpful Member', 'Get 10 likes on forum posts', 'social', 40, 'forum_likes_received', 10)
ON DUPLICATE KEY UPDATE name = name;
