-- Haven Institute Database Schema
-- MariaDB 10.11+

CREATE DATABASE IF NOT EXISTS haven_institute CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE haven_institute;

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('student', 'instructor', 'editor', 'moderator', 'admin') DEFAULT 'student',
    subscription_tier ENUM('Free', 'Pro', 'Premium') DEFAULT 'Free',
    avatar_url VARCHAR(500),
    phone_number VARCHAR(20),
    bio TEXT,

    -- Preferences
    preferred_study_time VARCHAR(50),
    goals JSON,
    nclex_type ENUM('RN', 'PN'),
    exam_date DATE,
    target_score INT,
    weak_areas JSON,

    -- Onboarding
    has_completed_onboarding BOOLEAN DEFAULT FALSE,
    onboarding_data JSON,

    -- Status & Timestamps
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_subscription (subscription_tier),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================================
-- 2. SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token_hash),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB;

-- ============================================================================
-- 3. SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    plan_type ENUM('Free', 'Pro', 'Premium') NOT NULL,
    status ENUM('active', 'canceled', 'expired', 'past_due') DEFAULT 'active',

    -- Stripe Integration
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    stripe_payment_method_id VARCHAR(255),

    -- Billing
    amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    billing_period ENUM('month', 'year') DEFAULT 'month',

    -- Dates
    current_period_start DATETIME,
    current_period_end DATETIME,
    trial_end DATETIME,
    canceled_at DATETIME,
    ended_at DATETIME,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_stripe_customer (stripe_customer_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================================================
-- 4. PAYMENT TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    subscription_id CHAR(36),

    -- Payment Details
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'succeeded', 'failed', 'refunded') DEFAULT 'pending',

    -- Metadata
    payment_method VARCHAR(50),
    description TEXT,
    metadata JSON,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_stripe_payment (stripe_payment_intent_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================================
-- 5. NCLEX CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS nclex_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    parent_id INT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (parent_id) REFERENCES nclex_categories(id) ON DELETE SET NULL,
    INDEX idx_parent_id (parent_id),
    INDEX idx_code (code)
) ENGINE=InnoDB;

-- Insert 8 official NCLEX subcategories
INSERT INTO nclex_categories (name, code, description, display_order) VALUES
('Management of Care', 'MGMT_CARE', 'Providing integrated, cost-effective care by coordinating, supervising, and/or collaborating', 1),
('Safety and Infection Control', 'SAFETY_INFECT', 'Protecting clients and healthcare personnel from health and environmental hazards', 2),
('Health Promotion and Maintenance', 'HEALTH_PROMO', 'Assisting clients to incorporate health promotion and disease prevention practices', 3),
('Psychosocial Integrity', 'PSYCHOSOCIAL', 'Promoting emotional, mental, and social well-being', 4),
('Basic Care and Comfort', 'BASIC_CARE', 'Providing comfort and assistance in the performance of activities of daily living', 5),
('Pharmacological Therapies', 'PHARMACOLOGY', 'Managing and providing care related to medication administration', 6),
('Reduction of Risk Potential', 'RISK_REDUCTION', 'Reducing the likelihood of clients developing complications or health problems', 7),
('Physiological Adaptation', 'PHYSIO_ADAPT', 'Managing and providing care for clients with acute, chronic, or life-threatening conditions', 8)
ON DUPLICATE KEY UPDATE name=name;

-- ============================================================================
-- 6. QUESTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS questions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category_id INT NOT NULL,

    -- Question Content
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'multiple_response', 'fill_blank', 'ordered_response', 'hot_spot') DEFAULT 'multiple_choice',

    -- Options (for multiple choice/response)
    options JSON,

    -- Fill in the blank
    correct_answers JSON,

    -- Ordered response
    correct_order JSON,

    -- Hot spot
    hot_spot_data JSON,

    -- Metadata
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    explanation TEXT,
    rationale TEXT,
    `references` TEXT,
    tags JSON,

    -- IRT Parameters (Item Response Theory)
    discrimination DECIMAL(5, 3) DEFAULT 1.000,
    difficulty_irt DECIMAL(5, 3) DEFAULT 0.000,
    guessing DECIMAL(5, 3) DEFAULT 0.000,

    -- Usage Statistics
    times_used INT DEFAULT 0,
    times_correct INT DEFAULT 0,
    average_time_seconds INT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_by CHAR(36),
    verified_by CHAR(36),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES nclex_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category_id (category_id),
    INDEX idx_difficulty (difficulty),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_question_text (question_text)
) ENGINE=InnoDB;

-- ============================================================================
-- 7. QUIZ SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,

    -- Session Type
    session_type ENUM('practice', 'cat_test', 'nclex_simulator', 'timed_test') DEFAULT 'practice',

    -- Configuration
    category_ids JSON,
    difficulty ENUM('easy', 'medium', 'hard', 'mixed') DEFAULT 'mixed',
    question_count INT,
    time_limit_minutes INT,

    -- CAT Specific
    is_adaptive BOOLEAN DEFAULT FALSE,
    ability_estimate DECIMAL(5, 3),
    standard_error DECIMAL(5, 3),
    confidence_interval_lower DECIMAL(5, 3),
    confidence_interval_upper DECIMAL(5, 3),

    -- Progress
    current_question_index INT DEFAULT 0,
    status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress',

    -- Results
    score INT,
    total_questions INT,
    correct_answers INT,
    passing_probability DECIMAL(5, 2),

    -- Timing
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    total_time_seconds INT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_type (session_type),
    INDEX idx_status (status),
    INDEX idx_started_at (started_at)
) ENGINE=InnoDB;

-- Continue with remaining tables...
-- (Due to length, I'll create separate migration files for the remaining 17 tables)
