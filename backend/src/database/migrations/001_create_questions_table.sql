-- Migration: Create questions table
-- Description: NCLEX questions with IRT parameters for CAT engine

CREATE TABLE IF NOT EXISTS `questions` (
  `id` CHAR(36) NOT NULL,
  `text` TEXT NOT NULL,
  `options` JSON NOT NULL COMMENT 'Array of {id, text} option objects',
  `correct_answers` JSON NOT NULL COMMENT 'Array of correct option IDs',
  `explanation` TEXT NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `question_type` VARCHAR(30) NOT NULL DEFAULT 'multiple_choice',
  `bloom_level` VARCHAR(20) NOT NULL DEFAULT 'apply',
  `irt_discrimination` FLOAT NOT NULL DEFAULT 1.0 COMMENT 'IRT a-parameter (0.5 to 2.5)',
  `irt_difficulty` FLOAT NOT NULL DEFAULT 0.0 COMMENT 'IRT b-parameter (-3 to +3)',
  `irt_guessing` FLOAT NOT NULL DEFAULT 0.2 COMMENT 'IRT c-parameter (0 to 0.35)',
  `difficulty` VARCHAR(10) NOT NULL DEFAULT 'medium',
  `tags` JSON DEFAULT NULL COMMENT 'Related topics or keywords',
  `rationale_correct` VARCHAR(500) DEFAULT NULL COMMENT 'Why correct answer is correct',
  `rationale_incorrect` VARCHAR(500) DEFAULT NULL COMMENT 'Why incorrect answers are wrong',
  `source` VARCHAR(500) DEFAULT NULL COMMENT 'Reference source for the question',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `times_answered` INT NOT NULL DEFAULT 0,
  `times_correct` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_questions_category` (`category`),
  INDEX `idx_questions_difficulty` (`difficulty`),
  INDEX `idx_questions_is_active` (`is_active`),
  INDEX `idx_questions_irt_difficulty` (`irt_difficulty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
