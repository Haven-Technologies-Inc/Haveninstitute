# Haven Institute Backend - Technical Specifications

## 🎯 Overview

This document provides complete technical specifications for implementing the Haven Institute backend using **Node.js**, **Express**, **TypeScript**, and **MariaDB**. This backend will replace the current localStorage-based mock system with a production-ready API.

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Authentication & Authorization](#authentication--authorization)
6. [Data Models](#data-models)
7. [File Structure](#file-structure)
8. [Environment Setup](#environment-setup)
9. [Implementation Steps](#implementation-steps)
10. [Security Considerations](#security-considerations)
11. [Error Handling](#error-handling)
12. [Testing Strategy](#testing-strategy)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│              (Current Implementation)                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTPS/REST API
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                   API Gateway Layer                         │
│                  (Express Middleware)                       │
│   • CORS • Rate Limiting • Request Validation • Auth        │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                  Business Logic Layer                       │
│           (Controllers & Services)                          │
│   • User Management • Quiz Engine • Analytics               │
│   • Payment Processing • AI Integration • Content Mgmt      │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                   Data Access Layer                         │
│                 (Repository Pattern)                        │
│   • ORM/Query Builder • Data Validation • Caching           │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                    MariaDB Database                         │
│   • Users • Questions • Results • Subscriptions             │
│   • Books • Forum • Analytics • Audit Logs                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  External Services                          │
│   • Stripe (Payments) • OpenAI (AI) • Email (SMTP)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### **Core Technologies**
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js 4.18+
- **Language**: TypeScript 5.0+
- **Database**: MariaDB 10.11+
- **ORM**: Sequelize 6.35+ or TypeORM 0.3+

### **Essential Libraries**

#### Authentication & Security
```json
{
  "bcryptjs": "^2.4.3",           // Password hashing
  "jsonwebtoken": "^9.0.2",       // JWT tokens
  "express-rate-limit": "^7.1.5", // Rate limiting
  "helmet": "^7.1.0",             // Security headers
  "cors": "^2.8.5",               // CORS handling
  "express-validator": "^7.0.1"   // Input validation
}
```

#### Database & ORM
```json
{
  "sequelize": "^6.35.2",         // ORM
  "sequelize-typescript": "^2.1.6", // TypeScript support
  "mariadb": "^3.2.3"             // MariaDB driver
}
```

#### Payment Processing
```json
{
  "stripe": "^14.10.0"            // Stripe SDK
}
```

#### AI Integration
```json
{
  "openai": "^4.24.1"             // OpenAI SDK
}
```

#### Utilities
```json
{
  "dotenv": "^16.3.1",            // Environment variables
  "winston": "^3.11.0",           // Logging
  "joi": "^17.11.0",              // Schema validation
  "express-async-errors": "^3.1.1", // Async error handling
  "multer": "^1.4.5-lts.1",       // File uploads
  "nodemailer": "^6.9.7",         // Email sending
  "redis": "^4.6.12"              // Caching (optional)
}
```

---

## 🗄️ Database Schema

### **Database Configuration**
```sql
-- Create database
CREATE DATABASE haven_institute CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE haven_institute;
```

### **1. Users Table**
```sql
CREATE TABLE users (
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
    goals JSON,  -- Array of learning goals
    nclex_type ENUM('RN', 'PN'),
    exam_date DATE,
    target_score INT,
    weak_areas JSON,  -- Array of weak category IDs
    
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
```

### **2. Sessions Table**
```sql
CREATE TABLE sessions (
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
```

### **3. Subscriptions Table**
```sql
CREATE TABLE subscriptions (
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
```

### **4. Payment Transactions Table**
```sql
CREATE TABLE payment_transactions (
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
```

### **5. NCLEX Categories Table**
```sql
CREATE TABLE nclex_categories (
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
('Physiological Adaptation', 'PHYSIO_ADAPT', 'Managing and providing care for clients with acute, chronic, or life-threatening conditions', 8);
```

### **6. Questions Table**
```sql
CREATE TABLE questions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category_id INT NOT NULL,
    
    -- Question Content
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'multiple_response', 'fill_blank', 'ordered_response', 'hot_spot') DEFAULT 'multiple_choice',
    
    -- Options (for multiple choice/response)
    options JSON,  -- Array of option objects: [{id, text, isCorrect}]
    
    -- Fill in the blank
    correct_answers JSON,  -- Array of acceptable answers
    
    -- Ordered response
    correct_order JSON,  -- Array of correct order
    
    -- Hot spot
    hot_spot_data JSON,  -- Coordinates and image data
    
    -- Metadata
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    explanation TEXT,
    rationale TEXT,
    references TEXT,
    tags JSON,  -- Array of tags
    
    -- IRT Parameters (Item Response Theory)
    discrimination DECIMAL(5, 3) DEFAULT 1.000,  -- a parameter
    difficulty_irt DECIMAL(5, 3) DEFAULT 0.000,  -- b parameter
    guessing DECIMAL(5, 3) DEFAULT 0.000,        -- c parameter
    
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
```

### **7. Quiz Sessions Table**
```sql
CREATE TABLE quiz_sessions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    
    -- Session Type
    session_type ENUM('practice', 'cat_test', 'nclex_simulator', 'timed_test') DEFAULT 'practice',
    
    -- Configuration
    category_ids JSON,  -- Array of category IDs
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
```

### **8. Quiz Answers Table**
```sql
CREATE TABLE quiz_answers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id CHAR(36) NOT NULL,
    question_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    
    -- Answer Data
    user_answer JSON,  -- Flexible for different question types
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INT,
    
    -- Metadata
    question_order INT,
    flagged_for_review BOOLEAN DEFAULT FALSE,
    confidence_level ENUM('not_sure', 'somewhat_sure', 'very_sure'),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_question_id (question_id),
    INDEX idx_is_correct (is_correct)
) ENGINE=InnoDB;
```

### **9. Flashcards Table**
```sql
CREATE TABLE flashcards (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category_id INT NOT NULL,
    
    -- Card Content
    front_text TEXT NOT NULL,
    back_text TEXT NOT NULL,
    image_url VARCHAR(500),
    
    -- Metadata
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    tags JSON,
    
    -- Statistics
    times_reviewed INT DEFAULT 0,
    times_mastered INT DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_by CHAR(36),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES nclex_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category_id (category_id),
    INDEX idx_is_active (is_active),
    FULLTEXT idx_front_text (front_text)
) ENGINE=InnoDB;
```

### **10. User Flashcard Progress Table**
```sql
CREATE TABLE user_flashcard_progress (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    flashcard_id CHAR(36) NOT NULL,
    
    -- Spaced Repetition
    mastery_level ENUM('learning', 'reviewing', 'mastered') DEFAULT 'learning',
    ease_factor DECIMAL(5, 3) DEFAULT 2.500,
    interval_days INT DEFAULT 1,
    repetitions INT DEFAULT 0,
    next_review_date DATE,
    
    -- Statistics
    times_seen INT DEFAULT 0,
    times_correct INT DEFAULT 0,
    last_result ENUM('wrong', 'hard', 'good', 'easy'),
    
    last_reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_flashcard (user_id, flashcard_id),
    INDEX idx_user_id (user_id),
    INDEX idx_next_review (next_review_date),
    INDEX idx_mastery_level (mastery_level)
) ENGINE=InnoDB;
```

### **11. Books Table**
```sql
CREATE TABLE books (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    -- Book Information
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255) DEFAULT 'Haven Institute Team',
    description TEXT,
    cover_image_url VARCHAR(500),
    category VARCHAR(100),
    
    -- Content
    total_pages INT DEFAULT 0,
    file_path VARCHAR(500),  -- Path to PDF or content file
    
    -- Access Control
    required_subscription ENUM('Free', 'Pro', 'Premium') DEFAULT 'Free',
    
    -- Metadata
    published_date DATE,
    isbn VARCHAR(20),
    tags JSON,
    
    -- Statistics
    total_reads INT DEFAULT 0,
    average_rating DECIMAL(3, 2),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_required_subscription (required_subscription),
    FULLTEXT idx_title (title)
) ENGINE=InnoDB;
```

### **12. Book Chapters Table**
```sql
CREATE TABLE book_chapters (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    book_id CHAR(36) NOT NULL,
    
    -- Chapter Info
    chapter_number INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    content LONGTEXT,
    
    -- Navigation
    start_page INT,
    end_page INT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_book_id (book_id),
    INDEX idx_chapter_number (chapter_number)
) ENGINE=InnoDB;
```

### **13. User Book Progress Table**
```sql
CREATE TABLE user_book_progress (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    book_id CHAR(36) NOT NULL,
    
    -- Progress
    current_page INT DEFAULT 1,
    total_pages_read INT DEFAULT 0,
    completion_percentage DECIMAL(5, 2) DEFAULT 0.00,
    
    -- Bookmarks
    bookmarks JSON,  -- Array of page numbers with notes
    highlights JSON,  -- Array of highlight objects
    notes JSON,      -- Array of note objects
    
    -- Statistics
    total_time_minutes INT DEFAULT 0,
    last_page_read INT,
    
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_read_at DATETIME,
    completed_at DATETIME,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_book (user_id, book_id),
    INDEX idx_user_id (user_id),
    INDEX idx_completion (completion_percentage)
) ENGINE=InnoDB;
```

### **14. Forum Categories Table**
```sql
CREATE TABLE forum_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(50),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug)
) ENGINE=InnoDB;

-- Insert default forum categories
INSERT INTO forum_categories (name, description, slug, icon, display_order) VALUES
('General Discussion', 'General NCLEX and nursing topics', 'general', 'MessageSquare', 1),
('Study Tips', 'Share your study strategies and tips', 'study-tips', 'BookOpen', 2),
('Test Anxiety', 'Support for managing test anxiety', 'test-anxiety', 'Heart', 3),
('NCLEX Experience', 'Share your NCLEX test day experiences', 'nclex-experience', 'Award', 4),
('Question Discussion', 'Discuss specific practice questions', 'questions', 'HelpCircle', 5),
('Study Groups', 'Find and organize study groups', 'study-groups', 'Users', 6);
```

### **15. Forum Posts Table**
```sql
CREATE TABLE forum_posts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category_id INT NOT NULL,
    user_id CHAR(36) NOT NULL,
    
    -- Post Content
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    
    -- Status
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    -- Statistics
    view_count INT DEFAULT 0,
    reply_count INT DEFAULT 0,
    upvote_count INT DEFAULT 0,
    
    -- Metadata
    tags JSON,
    edited_at DATETIME,
    edited_by CHAR(36),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (edited_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category_id (category_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_deleted (is_deleted),
    FULLTEXT idx_title_content (title, content)
) ENGINE=InnoDB;
```

### **16. Forum Replies Table**
```sql
CREATE TABLE forum_replies (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    post_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    parent_reply_id CHAR(36),  -- For nested replies
    
    -- Reply Content
    content TEXT NOT NULL,
    
    -- Status
    is_deleted BOOLEAN DEFAULT FALSE,
    is_solution BOOLEAN DEFAULT FALSE,  -- Mark as solution
    
    -- Statistics
    upvote_count INT DEFAULT 0,
    
    -- Metadata
    edited_at DATETIME,
    edited_by CHAR(36),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_reply_id) REFERENCES forum_replies(id) ON DELETE CASCADE,
    FOREIGN KEY (edited_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_reply_id (parent_reply_id),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_content (content)
) ENGINE=InnoDB;
```

### **17. Study Plans Table**
```sql
CREATE TABLE study_plans (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    
    -- Plan Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    target_exam_date DATE,
    
    -- Weekly Goals
    target_questions_per_week INT DEFAULT 100,
    target_study_hours_per_week DECIMAL(5, 2) DEFAULT 10.00,
    
    -- Progress
    total_questions_completed INT DEFAULT 0,
    total_study_hours DECIMAL(7, 2) DEFAULT 0.00,
    completion_percentage DECIMAL(5, 2) DEFAULT 0.00,
    
    -- Status
    status ENUM('active', 'completed', 'paused') DEFAULT 'active',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_target_exam_date (target_exam_date)
) ENGINE=InnoDB;
```

### **18. Study Sessions Table**
```sql
CREATE TABLE study_sessions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    study_plan_id CHAR(36),
    
    -- Session Details
    session_type ENUM('quiz', 'flashcard', 'reading', 'video', 'other') DEFAULT 'quiz',
    category_id INT,
    
    -- Timing
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration_minutes INT,
    
    -- Activity
    questions_answered INT DEFAULT 0,
    flashcards_reviewed INT DEFAULT 0,
    pages_read INT DEFAULT 0,
    
    -- Notes
    notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (study_plan_id) REFERENCES study_plans(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES nclex_categories(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_study_plan_id (study_plan_id),
    INDEX idx_start_time (start_time)
) ENGINE=InnoDB;
```

### **19. AI Chat Sessions Table**
```sql
CREATE TABLE ai_chat_sessions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    
    -- Session Info
    title VARCHAR(500),
    context_type ENUM('general', 'question_help', 'concept_review', 'study_plan') DEFAULT 'general',
    
    -- Usage Stats
    message_count INT DEFAULT 0,
    tokens_used INT DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;
```

### **20. AI Chat Messages Table**
```sql
CREATE TABLE ai_chat_messages (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id CHAR(36) NOT NULL,
    
    -- Message Content
    role ENUM('user', 'assistant', 'system') NOT NULL,
    content TEXT NOT NULL,
    
    -- AI Metadata
    model VARCHAR(50),
    tokens_used INT,
    finish_reason VARCHAR(50),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;
```

### **21. Analytics Events Table**
```sql
CREATE TABLE analytics_events (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    
    -- Event Details
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(100),
    event_action VARCHAR(100),
    event_label VARCHAR(255),
    
    -- Event Data
    event_value DECIMAL(10, 2),
    metadata JSON,
    
    -- Context
    page_url VARCHAR(500),
    referrer VARCHAR(500),
    user_agent TEXT,
    ip_address VARCHAR(45),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;
```

### **22. Audit Logs Table**
```sql
CREATE TABLE audit_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    
    -- Action Details
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    
    -- Changes
    old_values JSON,
    new_values JSON,
    
    -- Context
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_entity_type (entity_type),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;
```

### **23. Website Content Table**
```sql
CREATE TABLE website_content (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    -- Content Details
    content_key VARCHAR(100) NOT NULL UNIQUE,
    content_type ENUM('hero', 'feature', 'testimonial', 'faq', 'pricing', 'footer') NOT NULL,
    
    -- Content Data
    title VARCHAR(500),
    subtitle VARCHAR(500),
    description TEXT,
    content JSON,  -- Flexible JSON for different content types
    
    -- Media
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    
    -- Display
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Versioning
    version INT DEFAULT 1,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_content_key (content_key),
    INDEX idx_content_type (content_type),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB;
```

### **24. Settings Table**
```sql
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Setting Details
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    
    -- Metadata
    category VARCHAR(100),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,  -- Can be accessed by frontend
    
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_setting_key (setting_key),
    INDEX idx_category (category)
) ENGINE=InnoDB;

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
('site_name', 'Haven Institute', 'string', 'general', 'Site name', TRUE),
('site_tagline', 'Excellence in NCLEX Preparation', 'string', 'general', 'Site tagline', TRUE),
('support_email', 'support@haveninstitute.com', 'string', 'contact', 'Support email', TRUE),
('ai_enabled', 'true', 'boolean', 'features', 'AI features enabled', FALSE),
('openai_api_key', '', 'string', 'ai', 'OpenAI API Key', FALSE),
('openai_model', 'gpt-4', 'string', 'ai', 'OpenAI Model', FALSE),
('stripe_enabled', 'true', 'boolean', 'payments', 'Stripe payments enabled', FALSE),
('stripe_publishable_key', '', 'string', 'payments', 'Stripe Publishable Key', TRUE),
('stripe_secret_key', '', 'string', 'payments', 'Stripe Secret Key', FALSE),
('max_questions_free', '50', 'number', 'limits', 'Max questions for free users', TRUE),
('max_questions_pro', '500', 'number', 'limits', 'Max questions for pro users', TRUE),
('max_questions_premium', '-1', 'number', 'limits', 'Max questions for premium users (-1 = unlimited)', TRUE);
```

---

## 🔌 API Endpoints

### **Base URL**: `https://api.haveninstitute.com/v1`

### **Authentication Endpoints**

#### 1. Register User
```typescript
POST /auth/register
Content-Type: application/json

Request Body:
{
  "email": "string",
  "password": "string",  // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
  "fullName": "string",
  "nclexType": "RN" | "PN"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "string",
      "fullName": "string",
      "role": "student",
      "hasCompletedOnboarding": false
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### 2. Login
```typescript
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "string",
  "password": "string"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "string",
      "fullName": "string",
      "role": "student" | "admin",
      "subscription": "Free" | "Pro" | "Premium",
      "hasCompletedOnboarding": boolean
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### 3. Refresh Token
```typescript
POST /auth/refresh
Content-Type: application/json

Request Body:
{
  "refreshToken": "string"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

#### 4. Logout
```typescript
POST /auth/logout
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 5. Forgot Password
```typescript
POST /auth/forgot-password
Content-Type: application/json

Request Body:
{
  "email": "string"
}

Response: 200 OK
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### 6. Reset Password
```typescript
POST /auth/reset-password
Content-Type: application/json

Request Body:
{
  "token": "reset_token",
  "newPassword": "string"
}

Response: 200 OK
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### **User Management Endpoints**

#### 7. Get Current User
```typescript
GET /users/me
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "string",
    "fullName": "string",
    "role": "student" | "admin",
    "subscription": "Free" | "Pro" | "Premium",
    "avatarUrl": "string",
    "phoneNumber": "string",
    "bio": "string",
    "preferences": {
      "preferredStudyTime": "string",
      "goals": ["string"],
      "nclexType": "RN" | "PN",
      "examDate": "date",
      "targetScore": "number",
      "weakAreas": ["category_id"]
    },
    "hasCompletedOnboarding": boolean,
    "createdAt": "datetime",
    "lastLogin": "datetime"
  }
}
```

#### 8. Update User Profile
```typescript
PATCH /users/me
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "fullName": "string",
  "phoneNumber": "string",
  "bio": "string",
  "avatarUrl": "string",
  "preferences": {
    "preferredStudyTime": "string",
    "goals": ["string"],
    "examDate": "date",
    "targetScore": "number"
  }
}

Response: 200 OK
{
  "success": true,
  "data": {
    // Updated user object
  }
}
```

#### 9. Complete Onboarding
```typescript
POST /users/me/onboarding
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "nclexType": "RN" | "PN",
  "examDate": "date",
  "studyHours": "number",
  "weakAreas": ["category_id"],
  "goals": ["string"]
}

Response: 200 OK
{
  "success": true,
  "data": {
    "hasCompletedOnboarding": true
  }
}
```

#### 10. Upload Avatar
```typescript
POST /users/me/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request Body:
{
  "avatar": File  // Image file
}

Response: 200 OK
{
  "success": true,
  "data": {
    "avatarUrl": "string"
  }
}
```

---

### **Question Management Endpoints**

#### 11. Get Questions
```typescript
GET /questions
Authorization: Bearer {token}
Query Parameters:
  - categoryId: number (optional)
  - difficulty: "easy" | "medium" | "hard" (optional)
  - limit: number (default: 20)
  - offset: number (default: 0)
  - search: string (optional)
  - tags: string[] (optional)

Response: 200 OK
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "uuid",
        "categoryId": "number",
        "categoryName": "string",
        "questionText": "string",
        "questionType": "multiple_choice",
        "options": [
          {
            "id": "string",
            "text": "string"
          }
        ],
        "difficulty": "medium",
        "tags": ["string"]
      }
    ],
    "pagination": {
      "total": "number",
      "limit": "number",
      "offset": "number",
      "hasMore": "boolean"
    }
  }
}
```

#### 12. Get Question by ID
```typescript
GET /questions/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "categoryId": "number",
    "questionText": "string",
    "questionType": "multiple_choice",
    "options": [...],
    "correctAnswer": "string",  // Only after submission
    "explanation": "string",    // Only after submission
    "rationale": "string",      // Only after submission
    "references": "string",
    "difficulty": "medium",
    "tags": ["string"]
  }
}
```

#### 13. Create Question (Admin)
```typescript
POST /admin/questions
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "categoryId": "number",
  "questionText": "string",
  "questionType": "multiple_choice" | "multiple_response" | "fill_blank" | "ordered_response" | "hot_spot",
  "options": [
    {
      "id": "string",
      "text": "string",
      "isCorrect": "boolean"
    }
  ],
  "explanation": "string",
  "rationale": "string",
  "references": "string",
  "difficulty": "easy" | "medium" | "hard",
  "tags": ["string"],
  "irtParameters": {
    "discrimination": "number",
    "difficulty": "number",
    "guessing": "number"
  }
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "questionText": "string",
    // ... question details
  }
}
```

#### 14. Update Question (Admin)
```typescript
PATCH /admin/questions/:id
Authorization: Bearer {token}
Content-Type: application/json

Request Body: (Same as Create Question)

Response: 200 OK
```

#### 15. Delete Question (Admin)
```typescript
DELETE /admin/questions/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Question deleted successfully"
}
```

#### 16. Bulk Upload Questions (Admin)
```typescript
POST /admin/questions/bulk
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request Body:
{
  "file": File  // CSV, JSON, or Excel file
}

Response: 200 OK
{
  "success": true,
  "data": {
    "imported": "number",
    "failed": "number",
    "errors": [
      {
        "row": "number",
        "error": "string"
      }
    ]
  }
}
```

---

### **Quiz Session Endpoints**

#### 17. Start Quiz Session
```typescript
POST /quiz/sessions
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "sessionType": "practice" | "cat_test" | "nclex_simulator" | "timed_test",
  "categoryIds": ["number"],
  "difficulty": "easy" | "medium" | "hard" | "mixed",
  "questionCount": "number",
  "timeLimitMinutes": "number"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "questionCount": "number",
    "timeLimit": "number",
    "firstQuestion": {
      // Question object without correct answer
    }
  }
}
```

#### 18. Submit Answer
```typescript
POST /quiz/sessions/:sessionId/answers
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "questionId": "uuid",
  "userAnswer": "string" | ["string"],  // Depends on question type
  "timeSpentSeconds": "number",
  "flaggedForReview": "boolean",
  "confidenceLevel": "not_sure" | "somewhat_sure" | "very_sure"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "isCorrect": "boolean",
    "correctAnswer": "string",
    "explanation": "string",
    "rationale": "string",
    "nextQuestion": {
      // Next question object or null if finished
    },
    "progress": {
      "currentQuestion": "number",
      "totalQuestions": "number",
      "correctAnswers": "number"
    }
  }
}
```

#### 19. Get Session Status
```typescript
GET /quiz/sessions/:sessionId
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "status": "in_progress" | "completed",
    "progress": {
      "currentQuestion": "number",
      "totalQuestions": "number",
      "correctAnswers": "number",
      "timeElapsed": "number"
    },
    "catStats": {
      "abilityEstimate": "number",
      "standardError": "number",
      "passingProbability": "number"
    }
  }
}
```

#### 20. Complete Session
```typescript
POST /quiz/sessions/:sessionId/complete
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "score": "number",
    "totalQuestions": "number",
    "correctAnswers": "number",
    "percentage": "number",
    "passingProbability": "number",
    "timeSpent": "number",
    "categoryPerformance": {
      "categoryId": {
        "correct": "number",
        "total": "number",
        "percentage": "number"
      }
    },
    "report": {
      // Detailed performance report
    }
  }
}
```

#### 21. Get User Quiz History
```typescript
GET /quiz/sessions
Authorization: Bearer {token}
Query Parameters:
  - sessionType: string (optional)
  - limit: number (default: 20)
  - offset: number (default: 0)

Response: 200 OK
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "uuid",
        "sessionType": "practice",
        "score": "number",
        "totalQuestions": "number",
        "percentage": "number",
        "date": "datetime"
      }
    ],
    "pagination": {...}
  }
}
```

---

### **Flashcard Endpoints**

#### 22. Get Flashcards
```typescript
GET /flashcards
Authorization: Bearer {token}
Query Parameters:
  - categoryId: number (optional)
  - difficulty: string (optional)
  - limit: number (default: 20)
  - offset: number (default: 0)

Response: 200 OK
{
  "success": true,
  "data": {
    "flashcards": [
      {
        "id": "uuid",
        "categoryId": "number",
        "categoryName": "string",
        "frontText": "string",
        "backText": "string",
        "imageUrl": "string",
        "difficulty": "medium",
        "tags": ["string"],
        "userProgress": {
          "masteryLevel": "learning" | "reviewing" | "mastered",
          "nextReviewDate": "date"
        }
      }
    ],
    "pagination": {...}
  }
}
```

#### 23. Get Due Flashcards
```typescript
GET /flashcards/due
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "flashcards": [...],
    "totalDue": "number"
  }
}
```

#### 24. Submit Flashcard Review
```typescript
POST /flashcards/:id/review
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "result": "wrong" | "hard" | "good" | "easy"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "masteryLevel": "reviewing",
    "nextReviewDate": "date",
    "interval": "number"
  }
}
```

---

### **Subscription & Payment Endpoints**

#### 25. Get Subscription Plans
```typescript
GET /subscriptions/plans

Response: 200 OK
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "free",
        "name": "Free",
        "price": 0,
        "period": "month",
        "features": ["string"],
        "limits": {
          "questionsPerMonth": 50,
          "flashcardsAccess": false,
          "catTests": 0
        }
      },
      {
        "id": "pro",
        "name": "Pro",
        "price": 29.99,
        "period": "month",
        "stripePriceId": "price_xxx",
        "features": ["string"],
        "limits": {
          "questionsPerMonth": 500,
          "flashcardsAccess": true,
          "catTests": 5
        }
      },
      {
        "id": "premium",
        "name": "Premium",
        "price": 49.99,
        "period": "month",
        "stripePriceId": "price_xxx",
        "features": ["string"],
        "limits": {
          "questionsPerMonth": -1,  // Unlimited
          "flashcardsAccess": true,
          "catTests": -1
        }
      }
    ]
  }
}
```

#### 26. Create Checkout Session
```typescript
POST /payments/checkout
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "planId": "pro" | "premium",
  "billingPeriod": "month" | "year"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "sessionId": "stripe_session_id",
    "url": "stripe_checkout_url"
  }
}
```

#### 27. Get Current Subscription
```typescript
GET /subscriptions/current
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "subscription": {
      "id": "uuid",
      "planType": "Pro",
      "status": "active",
      "currentPeriodStart": "date",
      "currentPeriodEnd": "date",
      "cancelAtPeriodEnd": "boolean",
      "stripeCustomerId": "string"
    }
  }
}
```

#### 28. Cancel Subscription
```typescript
POST /subscriptions/cancel
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "canceledAt": "datetime",
    "endsAt": "datetime"
  }
}
```

#### 29. Webhook (Stripe)
```typescript
POST /webhooks/stripe
Content-Type: application/json
Stripe-Signature: {signature}

Request Body: (Stripe webhook payload)

Response: 200 OK
```

---

### **Book Endpoints**

#### 30. Get Books
```typescript
GET /books
Authorization: Bearer {token}
Query Parameters:
  - category: string (optional)
  - search: string (optional)

Response: 200 OK
{
  "success": true,
  "data": {
    "books": [
      {
        "id": "uuid",
        "title": "string",
        "author": "string",
        "description": "string",
        "coverImageUrl": "string",
        "category": "string",
        "totalPages": "number",
        "requiredSubscription": "Free" | "Pro" | "Premium",
        "hasAccess": "boolean",
        "userProgress": {
          "currentPage": "number",
          "completionPercentage": "number"
        }
      }
    ]
  }
}
```

#### 31. Get Book Details
```typescript
GET /books/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "book": {
      "id": "uuid",
      "title": "string",
      "author": "string",
      "description": "string",
      "coverImageUrl": "string",
      "totalPages": "number",
      "chapters": [
        {
          "id": "uuid",
          "chapterNumber": "number",
          "title": "string",
          "startPage": "number",
          "endPage": "number"
        }
      ],
      "hasAccess": "boolean"
    }
  }
}
```

#### 32. Get Book Content
```typescript
GET /books/:id/chapters/:chapterId
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "chapter": {
      "id": "uuid",
      "title": "string",
      "content": "string",
      "chapterNumber": "number"
    }
  }
}
```

#### 33. Update Book Progress
```typescript
POST /books/:id/progress
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "currentPage": "number",
  "timeSpent": "number"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "currentPage": "number",
    "completionPercentage": "number"
  }
}
```

#### 34. Add Bookmark
```typescript
POST /books/:id/bookmarks
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "page": "number",
  "note": "string"
}

Response: 201 Created
```

---

### **Forum Endpoints**

#### 35. Get Forum Categories
```typescript
GET /forum/categories

Response: 200 OK
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "number",
        "name": "string",
        "description": "string",
        "slug": "string",
        "icon": "string",
        "postCount": "number"
      }
    ]
  }
}
```

#### 36. Get Forum Posts
```typescript
GET /forum/posts
Query Parameters:
  - categoryId: number (optional)
  - search: string (optional)
  - limit: number (default: 20)
  - offset: number (default: 0)
  - sort: "newest" | "popular" | "unanswered"

Response: 200 OK
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "title": "string",
        "content": "string",
        "author": {
          "id": "uuid",
          "fullName": "string",
          "avatarUrl": "string"
        },
        "category": {...},
        "replyCount": "number",
        "upvoteCount": "number",
        "viewCount": "number",
        "isPinned": "boolean",
        "isLocked": "boolean",
        "createdAt": "datetime"
      }
    ],
    "pagination": {...}
  }
}
```

#### 37. Create Forum Post
```typescript
POST /forum/posts
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "categoryId": "number",
  "title": "string",
  "content": "string",
  "tags": ["string"]
}

Response: 201 Created
{
  "success": true,
  "data": {
    "postId": "uuid",
    "title": "string",
    "createdAt": "datetime"
  }
}
```

#### 38. Get Post Details
```typescript
GET /forum/posts/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "post": {
      "id": "uuid",
      "title": "string",
      "content": "string",
      "author": {...},
      "category": {...},
      "replies": [
        {
          "id": "uuid",
          "content": "string",
          "author": {...},
          "upvoteCount": "number",
          "isSolution": "boolean",
          "createdAt": "datetime"
        }
      ],
      "viewCount": "number",
      "createdAt": "datetime"
    }
  }
}
```

#### 39. Reply to Post
```typescript
POST /forum/posts/:id/replies
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "content": "string",
  "parentReplyId": "uuid"  // Optional, for nested replies
}

Response: 201 Created
```

#### 40. Upvote Post/Reply
```typescript
POST /forum/posts/:id/upvote
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "upvoteCount": "number"
  }
}
```

---

### **Analytics Endpoints**

#### 41. Get User Analytics
```typescript
GET /analytics/me
Authorization: Bearer {token}
Query Parameters:
  - timeRange: "week" | "month" | "year" | "all"

Response: 200 OK
{
  "success": true,
  "data": {
    "overview": {
      "totalQuestions": "number",
      "correctAnswers": "number",
      "averageScore": "number",
      "studyTime": "number",
      "currentStreak": "number"
    },
    "categoryPerformance": {
      "categoryId": {
        "categoryName": "string",
        "correct": "number",
        "total": "number",
        "percentage": "number",
        "averageTime": "number"
      }
    },
    "progressOverTime": [
      {
        "date": "date",
        "questionsAnswered": "number",
        "correctPercentage": "number"
      }
    ],
    "weakAreas": [
      {
        "categoryId": "number",
        "categoryName": "string",
        "performance": "number"
      }
    ],
    "strongAreas": [...]
  }
}
```

#### 42. Get Admin Analytics
```typescript
GET /admin/analytics
Authorization: Bearer {token}
Query Parameters:
  - startDate: date
  - endDate: date

Response: 200 OK
{
  "success": true,
  "data": {
    "users": {
      "total": "number",
      "active": "number",
      "new": "number",
      "bySubscription": {
        "Free": "number",
        "Pro": "number",
        "Premium": "number"
      }
    },
    "revenue": {
      "total": "number",
      "monthly": "number",
      "yearToDate": "number",
      "byPlan": {...}
    },
    "engagement": {
      "totalQuestions": "number",
      "averageSessionTime": "number",
      "dailyActiveUsers": "number"
    },
    "questions": {
      "total": "number",
      "byCategory": {...},
      "byDifficulty": {...}
    }
  }
}
```

---

### **AI Chat Endpoints**

#### 43. Start Chat Session
```typescript
POST /ai/chat/sessions
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "contextType": "general" | "question_help" | "concept_review" | "study_plan",
  "context": {
    "questionId": "uuid",  // Optional
    "categoryId": "number"  // Optional
  }
}

Response: 201 Created
{
  "success": true,
  "data": {
    "sessionId": "uuid"
  }
}
```

#### 44. Send Chat Message
```typescript
POST /ai/chat/sessions/:sessionId/messages
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "message": "string"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "message": {
      "id": "uuid",
      "role": "assistant",
      "content": "string",
      "createdAt": "datetime"
    },
    "tokensUsed": "number"
  }
}
```

#### 45. Get Chat History
```typescript
GET /ai/chat/sessions/:sessionId
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "session": {
      "id": "uuid",
      "title": "string",
      "messages": [
        {
          "id": "uuid",
          "role": "user" | "assistant",
          "content": "string",
          "createdAt": "datetime"
        }
      ]
    }
  }
}
```

---

### **Admin User Management Endpoints**

#### 46. Get All Users (Admin)
```typescript
GET /admin/users
Authorization: Bearer {token}
Query Parameters:
  - role: string (optional)
  - subscription: string (optional)
  - search: string (optional)
  - limit: number (default: 20)
  - offset: number (default: 0)

Response: 200 OK
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "string",
        "fullName": "string",
        "role": "string",
        "subscription": "string",
        "isActive": "boolean",
        "createdAt": "datetime",
        "lastLogin": "datetime"
      }
    ],
    "pagination": {...}
  }
}
```

#### 47. Update User Role (Admin)
```typescript
PATCH /admin/users/:id/role
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "role": "student" | "instructor" | "editor" | "moderator" | "admin"
}

Response: 200 OK
```

#### 48. Deactivate User (Admin)
```typescript
POST /admin/users/:id/deactivate
Authorization: Bearer {token}

Response: 200 OK
```

---

### **Settings Endpoints**

#### 49. Get Settings (Admin)
```typescript
GET /admin/settings
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "settings": [
      {
        "key": "string",
        "value": "string",
        "type": "string",
        "category": "string",
        "description": "string"
      }
    ]
  }
}
```

#### 50. Update Setting (Admin)
```typescript
PATCH /admin/settings/:key
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "value": "string"
}

Response: 200 OK
```

---

## 🔐 Authentication & Authorization

### **JWT Token Structure**

```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'instructor' | 'editor' | 'moderator' | 'admin';
  subscription: 'Free' | 'Pro' | 'Premium';
  iat: number;  // Issued at
  exp: number;  // Expiration
}
```

### **Token Configuration**
- **Access Token**: 1 hour expiration
- **Refresh Token**: 7 days expiration
- **Algorithm**: HS256
- **Secret**: Stored in environment variables

### **Authorization Middleware**

```typescript
// Protect routes requiring authentication
app.use('/api/v1/quiz', authenticate);

// Protect admin-only routes
app.use('/api/v1/admin', authenticate, authorizeRole(['admin']));

// Protect premium content
app.use('/api/v1/books/premium', authenticate, requireSubscription(['Pro', 'Premium']));
```

### **Permission Hierarchy**

```
admin > moderator > editor > instructor > student
```

### **Role Permissions**

| Feature | Student | Instructor | Editor | Moderator | Admin |
|---------|---------|------------|--------|-----------|-------|
| Take Quizzes | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Analytics | Own | Own | Own | Own | All |
| Create Questions | ❌ | ❌ | ✅ | ✅ | ✅ |
| Edit Questions | ❌ | ❌ | ✅ | ✅ | ✅ |
| Delete Questions | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ | ✅ |
| Moderate Forum | ❌ | ❌ | ❌ | ✅ | ✅ |
| Access Settings | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Revenue | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 📁 File Structure

```
haven-institute-backend/
├── src/
│   ├── config/
│   │   ├── database.ts           # Database configuration
│   │   ├── jwt.ts                # JWT configuration
│   │   ├── stripe.ts             # Stripe configuration
│   │   ├── openai.ts             # OpenAI configuration
│   │   └── email.ts              # Email configuration
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Session.ts
│   │   ├── Subscription.ts
│   │   ├── PaymentTransaction.ts
│   │   ├── NCLEXCategory.ts
│   │   ├── Question.ts
│   │   ├── QuizSession.ts
│   │   ├── QuizAnswer.ts
│   │   ├── Flashcard.ts
│   │   ├── UserFlashcardProgress.ts
│   │   ├── Book.ts
│   │   ├── BookChapter.ts
│   │   ├── UserBookProgress.ts
│   │   ├── ForumCategory.ts
│   │   ├── ForumPost.ts
│   │   ├── ForumReply.ts
│   │   ├── StudyPlan.ts
│   │   ├── StudySession.ts
│   │   ├── AIChatSession.ts
│   │   ├── AIChatMessage.ts
│   │   ├── AnalyticsEvent.ts
│   │   ├── AuditLog.ts
│   │   ├── WebsiteContent.ts
│   │   ├── Setting.ts
│   │   └── index.ts              # Export all models
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── question.controller.ts
│   │   ├── quiz.controller.ts
│   │   ├── flashcard.controller.ts
│   │   ├── subscription.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── book.controller.ts
│   │   ├── forum.controller.ts
│   │   ├── analytics.controller.ts
│   │   ├── ai.controller.ts
│   │   ├── admin.controller.ts
│   │   └── webhook.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── question.service.ts
│   │   ├── quiz.service.ts
│   │   ├── cat.service.ts          # CAT algorithm
│   │   ├── flashcard.service.ts
│   │   ├── subscription.service.ts
│   │   ├── payment.service.ts
│   │   ├── stripe.service.ts
│   │   ├── book.service.ts
│   │   ├── forum.service.ts
│   │   ├── analytics.service.ts
│   │   ├── ai.service.ts
│   │   ├── email.service.ts
│   │   └── upload.service.ts
│   │
│   ├── middleware/
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   ├── validateRequest.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   ├── upload.ts
│   │   └── logger.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── question.routes.ts
│   │   ├── quiz.routes.ts
│   │   ├── flashcard.routes.ts
│   │   ├── subscription.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── book.routes.ts
│   │   ├── forum.routes.ts
│   │   ├── analytics.routes.ts
│   │   ├── ai.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── webhook.routes.ts
│   │   └── index.ts
│   │
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── user.validator.ts
│   │   ├── question.validator.ts
│   │   ├── quiz.validator.ts
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── response.ts
│   │   ├── encryption.ts
│   │   ├── pagination.ts
│   │   ├── date.ts
│   │   └── validation.ts
│   │
│   ├── types/
│   │   ├── express.d.ts          # Extended Express types
│   │   ├── user.types.ts
│   │   ├── quiz.types.ts
│   │   └── ...
│   │
│   ├── database/
│   │   ├── migrations/
│   │   │   └── *.sql
│   │   ├── seeds/
│   │   │   └── *.ts
│   │   └── connection.ts
│   │
│   ├── app.ts                    # Express app setup
│   └── server.ts                 # Server entry point
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── uploads/                      # Uploaded files
│   ├── avatars/
│   ├── questions/
│   └── books/
│
├── logs/                         # Application logs
│
├── .env.example
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.js
├── docker-compose.yml
└── README.md
```

---

## 🌍 Environment Setup

### **.env File Structure**

```env
# Server Configuration
NODE_ENV=development
PORT=3001
API_VERSION=v1
CORS_ORIGIN=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=haven_institute
DB_USER=haven_user
DB_PASSWORD=secure_password
DB_POOL_MIN=2
DB_POOL_MAX=10

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_REFRESH_EXPIRES_IN=7d

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_PRICE_ID=price_xxxxx

# OpenAI Configuration
OPENAI_API_KEY=sk-xxxxx
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=1000

# DeepSeek Configuration (optional)
DEEPSEEK_API_KEY=sk-xxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@haveninstitute.com
SMTP_PASSWORD=your_email_password
SMTP_FROM_NAME=Haven Institute
SMTP_FROM_EMAIL=noreply@haveninstitute.com

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Redis (optional - for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret

# Frontend URLs
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5173/admin
PASSWORD_RESET_URL=http://localhost:5173/reset-password

# Feature Flags
ENABLE_AI_CHAT=true
ENABLE_PAYMENTS=true
ENABLE_EMAIL=true
```

---

## 🚀 Implementation Steps

### **Phase 1: Project Setup (Week 1)**

#### Step 1.1: Initialize Project
```bash
mkdir haven-institute-backend
cd haven-institute-backend
npm init -y
```

#### Step 1.2: Install Dependencies
```bash
# Core dependencies
npm install express typescript ts-node @types/node @types/express
npm install dotenv cors helmet express-rate-limit
npm install bcryptjs jsonwebtoken express-validator
npm install sequelize sequelize-typescript mariadb
npm install winston express-async-errors

# Dev dependencies
npm install -D nodemon @types/bcryptjs @types/jsonwebtoken @types/cors
npm install -D @types/multer @types/nodemailer
npm install -D jest @types/jest ts-jest supertest @types/supertest
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

#### Step 1.3: Configure TypeScript
Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "types": ["node", "jest"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

#### Step 1.4: Setup Package Scripts
Update `package.json`:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint . --ext .ts",
    "migrate": "ts-node src/database/migrate.ts",
    "seed": "ts-node src/database/seed.ts"
  }
}
```

---

### **Phase 2: Database Setup (Week 1-2)**

#### Step 2.1: Create Database
```sql
CREATE DATABASE haven_institute CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'haven_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON haven_institute.* TO 'haven_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Step 2.2: Configure Sequelize
Create `src/config/database.ts`:
```typescript
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  dialect: 'mariadb',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  models: [__dirname + '/../models'],
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: Number(process.env.DB_POOL_MAX) || 10,
    min: Number(process.env.DB_POOL_MIN) || 2,
    acquire: 30000,
    idle: 10000
  }
});
```

#### Step 2.3: Create Models
Follow the schema defined earlier. Example for User model:

Create `src/models/User.ts`:
```typescript
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  CreatedAt,
  UpdatedAt,
  HasMany,
  BeforeCreate,
  BeforeUpdate
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';

@Table({
  tableName: 'users',
  timestamps: true
})
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  email!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'password_hash'
  })
  passwordHash!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'full_name'
  })
  fullName!: string;

  @Default('student')
  @Column({
    type: DataType.ENUM('student', 'instructor', 'editor', 'moderator', 'admin'),
    allowNull: false
  })
  role!: string;

  @Default('Free')
  @Column({
    type: DataType.ENUM('Free', 'Pro', 'Premium'),
    allowNull: false,
    field: 'subscription_tier'
  })
  subscriptionTier!: string;

  @Column(DataType.STRING(500))
  avatarUrl?: string;

  @Column({
    type: DataType.STRING(20),
    field: 'phone_number'
  })
  phoneNumber?: string;

  @Column(DataType.TEXT)
  bio?: string;

  @Column({
    type: DataType.JSON,
    field: 'goals'
  })
  goals?: string[];

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'has_completed_onboarding'
  })
  hasCompletedOnboarding!: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'email_verified'
  })
  emailVerified!: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active'
  })
  isActive!: boolean;

  @Column({
    type: DataType.DATE,
    field: 'last_login'
  })
  lastLogin?: Date;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at'
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at'
  })
  updatedAt!: Date;

  // Associations
  @HasMany(() => QuizSession)
  quizSessions!: QuizSession[];

  // Methods
  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  // Hooks
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User) {
    if (user.changed('passwordHash')) {
      const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_ROUNDS) || 12);
      user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
    }
  }

  // Hide sensitive data
  toJSON() {
    const values = { ...this.get() };
    delete values.passwordHash;
    return values;
  }
}
```

#### Step 2.4: Run Migrations
Execute all SQL schema files defined earlier.

#### Step 2.5: Seed Initial Data
Create seed files for:
- NCLEX categories
- Forum categories
- Default settings
- Admin user

---

### **Phase 3: Core API (Week 2-3)**

#### Step 3.1: Setup Express App
Create `src/app.ts`:
```typescript
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API routes
app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

export default app;
```

#### Step 3.2: Create Server Entry Point
Create `src/server.ts`:
```typescript
import app from './app';
import { sequelize } from './config/database';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync models (only in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('Database synchronized');
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing server...');
  await sequelize.close();
  process.exit(0);
});
```

#### Step 3.3: Implement Authentication
Create `src/services/auth.service.ts`:
```typescript
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Session } from '../models/Session';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    nclexType: 'RN' | 'PN';
  }) {
    // Check if user exists
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create user
    const user = await User.create({
      email: data.email,
      passwordHash: data.password,  // Will be hashed by hook
      fullName: data.fullName,
      goals: [data.nclexType === 'RN' ? 'Pass NCLEX-RN' : 'Pass NCLEX-PN']
    });

    // Generate tokens
    const { token, refreshToken } = await this.generateTokens(user);

    return {
      user: user.toJSON(),
      token,
      refreshToken
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await User.findOne({ where: { email, isActive: true } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate tokens
    const { token, refreshToken } = await this.generateTokens(user);

    return {
      user: user.toJSON(),
      token,
      refreshToken
    };
  }

  async generateTokens(user: User) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      subscription: user.subscriptionTier
    };

    // Generate access token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    // Store session
    await Session.create({
      userId: user.id,
      tokenHash: this.hashToken(token),
      refreshTokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    return { token, refreshToken };
  }

  private hashToken(token: string): string {
    // Implement token hashing for storage
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
```

#### Step 3.4: Implement Middleware
Create `src/middleware/authenticate.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: User;
  userId?: string;
  userRole?: string;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
}
```

---

### **Phase 4: Question & Quiz System (Week 3-4)**

Implement:
- Question CRUD operations
- Quiz session management
- CAT algorithm
- Answer validation
- Result calculation

---

### **Phase 5: Payment Integration (Week 4-5)**

Implement:
- Stripe setup
- Subscription plans
- Checkout sessions
- Webhooks
- Payment history

---

### **Phase 6: Additional Features (Week 5-6)**

Implement:
- Flashcard system
- Book reader
- Forum
- AI chat
- Analytics

---

### **Phase 7: Admin Panel API (Week 6-7)**

Implement:
- User management
- Question management
- Analytics dashboard
- Settings management
- Audit logs

---

### **Phase 8: Testing & Deployment (Week 7-8)**

- Write unit tests
- Write integration tests
- Setup CI/CD
- Docker containerization
- Deploy to production

---

## 🔒 Security Considerations

### **1. Input Validation**
- Validate all user inputs
- Use express-validator
- Sanitize SQL inputs (ORM handles this)
- Prevent XSS attacks

### **2. Authentication**
- Use bcrypt for password hashing (min 12 rounds)
- Implement JWT with short expiration
- Store refresh tokens securely
- Implement token rotation

### **3. Authorization**
- Role-based access control
- Check permissions on every request
- Principle of least privilege

### **4. Data Protection**
- Encrypt sensitive data at rest
- Use HTTPS in production
- Implement rate limiting
- Log security events

### **5. API Security**
- Use Helmet.js for security headers
- Implement CORS properly
- Rate limit API endpoints
- Validate file uploads

### **6. Database Security**
- Use parameterized queries (ORM)
- Implement database connection pooling
- Regular backups
- Encrypt database connections

### **7. Environment Variables**
- Never commit .env files
- Use different secrets for dev/prod
- Rotate secrets regularly

---

## ⚠️ Error Handling

### **Error Response Format**
```typescript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly error message",
    "details": {}  // Optional, only in development
  }
}
```

### **Error Codes**
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Insufficient permissions
- `VAL_001`: Validation error
- `DB_001`: Database error
- `PAY_001`: Payment error
- `SYS_001`: System error

---

## 🧪 Testing Strategy

### **Unit Tests**
- Test individual functions
- Mock dependencies
- 80%+ code coverage

### **Integration Tests**
- Test API endpoints
- Test database operations
- Test external services

### **E2E Tests**
- Test complete user flows
- Test critical paths
- Test edge cases

---

## 📦 Deployment

### **Docker Setup**
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
    
  db:
    image: mariadb:10.11
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: haven_institute
      MYSQL_USER: haven_user
      MYSQL_PASSWORD: secure_password
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  db_data:
```

---

## 📝 Next Steps After Implementation

1. **Connect Frontend to Backend**
   - Replace localStorage with API calls
   - Update AuthContext to use real API
   - Implement token management
   - Add error handling

2. **Testing**
   - Test all endpoints
   - Load testing
   - Security audit

3. **Documentation**
   - API documentation (Swagger/OpenAPI)
   - Deployment guide
   - User guide

4. **Monitoring**
   - Setup logging
   - Error tracking (Sentry)
   - Performance monitoring
   - Analytics

---

## 🎯 Summary

This specification provides everything needed to implement a production-ready backend for Haven Institute:

✅ Complete database schema with 24 tables
✅ 50+ RESTful API endpoints
✅ Authentication & authorization system
✅ Payment integration with Stripe
✅ AI integration with OpenAI
✅ Comprehensive file structure
✅ Security best practices
✅ Testing strategy
✅ Deployment guide

**Estimated Implementation Time**: 6-8 weeks for full backend

**Priority Order**:
1. Authentication & User Management
2. Question & Quiz System
3. Subscription & Payments
4. Additional Features (Books, Forum, AI)
5. Admin Panel
6. Analytics & Reporting

---

*This specification is ready for implementation by Claude Code or any development team.*
