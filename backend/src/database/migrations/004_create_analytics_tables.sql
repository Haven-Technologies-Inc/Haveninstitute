-- Migration: Create Analytics tables
-- Description: Tables for study goals and activity tracking

-- Study Goals table
CREATE TABLE IF NOT EXISTS `study_goals` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `type` VARCHAR(20) NOT NULL COMMENT 'questions, time, accuracy, streak, custom',
  `period` VARCHAR(10) NOT NULL DEFAULT 'daily' COMMENT 'daily, weekly, monthly',
  `target` INT NOT NULL,
  `current` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_reset` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_study_goals_user_id` (`user_id`),
  INDEX `idx_study_goals_is_active` (`is_active`),
  CONSTRAINT `fk_study_goals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Study Activities table
CREATE TABLE IF NOT EXISTS `study_activities` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `activity_type` VARCHAR(30) NOT NULL COMMENT 'quiz_completed, cat_completed, flashcard_reviewed, etc.',
  `description` VARCHAR(255) NOT NULL,
  `metadata` JSON DEFAULT NULL COMMENT 'Additional activity metadata',
  `points_earned` INT DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_study_activities_user_id` (`user_id`),
  INDEX `idx_study_activities_type` (`activity_type`),
  INDEX `idx_study_activities_created_at` (`created_at`),
  CONSTRAINT `fk_study_activities_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
