-- Migration: Create Quiz tables
-- Description: Tables for practice quiz sessions and responses

-- Quiz Sessions table
CREATE TABLE IF NOT EXISTS `quiz_sessions` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  `category` VARCHAR(50) DEFAULT NULL,
  `difficulty` VARCHAR(10) NOT NULL DEFAULT 'mixed',
  `question_count` INT DEFAULT 10,
  `questions_answered` INT DEFAULT 0,
  `questions_correct` INT DEFAULT 0,
  `time_spent` INT DEFAULT 0 COMMENT 'Total time spent in seconds',
  `question_ids` JSON DEFAULT NULL,
  `current_question_index` INT DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completed_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_quiz_sessions_user_id` (`user_id`),
  INDEX `idx_quiz_sessions_status` (`status`),
  INDEX `idx_quiz_sessions_category` (`category`),
  INDEX `idx_quiz_sessions_created_at` (`created_at`),
  CONSTRAINT `fk_quiz_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz Responses table
CREATE TABLE IF NOT EXISTS `quiz_responses` (
  `id` CHAR(36) NOT NULL,
  `session_id` CHAR(36) NOT NULL,
  `question_id` CHAR(36) NOT NULL,
  `question_number` INT NOT NULL,
  `user_answer` JSON NOT NULL,
  `is_correct` TINYINT(1) NOT NULL,
  `time_spent` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_quiz_responses_session_id` (`session_id`),
  INDEX `idx_quiz_responses_question_id` (`question_id`),
  CONSTRAINT `fk_quiz_responses_session` FOREIGN KEY (`session_id`) REFERENCES `quiz_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_quiz_responses_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
