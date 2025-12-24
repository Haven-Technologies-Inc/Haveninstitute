-- Migration: Create CAT (Computer Adaptive Testing) tables
-- Description: Tables for CAT sessions and responses

-- CAT Sessions table
CREATE TABLE IF NOT EXISTS `cat_sessions` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  `current_ability` FLOAT DEFAULT 0.0,
  `standard_error` FLOAT DEFAULT 1.0,
  `confidence_lower` FLOAT DEFAULT NULL,
  `confidence_upper` FLOAT DEFAULT NULL,
  `passing_probability` FLOAT DEFAULT 0.5,
  `questions_answered` INT DEFAULT 0,
  `questions_correct` INT DEFAULT 0,
  `time_spent` INT DEFAULT 0 COMMENT 'Total time spent in seconds',
  `time_limit` INT DEFAULT 18000 COMMENT 'Time limit in seconds (5 hours)',
  `answered_question_ids` JSON DEFAULT NULL,
  `result` VARCHAR(20) DEFAULT 'undetermined',
  `category_performance` JSON DEFAULT NULL,
  `difficulty_distribution` JSON DEFAULT NULL,
  `stop_reason` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completed_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_cat_sessions_user_id` (`user_id`),
  INDEX `idx_cat_sessions_status` (`status`),
  INDEX `idx_cat_sessions_created_at` (`created_at`),
  CONSTRAINT `fk_cat_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CAT Responses table
CREATE TABLE IF NOT EXISTS `cat_responses` (
  `id` CHAR(36) NOT NULL,
  `session_id` CHAR(36) NOT NULL,
  `question_id` CHAR(36) NOT NULL,
  `question_number` INT NOT NULL,
  `user_answer` JSON NOT NULL COMMENT 'Array of selected option IDs',
  `is_correct` TINYINT(1) NOT NULL,
  `time_spent` INT NOT NULL DEFAULT 0,
  `ability_after` FLOAT DEFAULT NULL,
  `se_after` FLOAT DEFAULT NULL,
  `irt_params` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_cat_responses_session_id` (`session_id`),
  INDEX `idx_cat_responses_question_id` (`question_id`),
  CONSTRAINT `fk_cat_responses_session` FOREIGN KEY (`session_id`) REFERENCES `cat_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cat_responses_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
