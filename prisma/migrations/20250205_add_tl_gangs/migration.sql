-- Migration: add_tl_gangs
-- Description: Add tl_gangs and tl_gang_grades tables for database-driven gang system

-- Create tl_gangs table
CREATE TABLE IF NOT EXISTS `tl_gangs` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `label` VARCHAR(100) NOT NULL,
    `off_duty_pay` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_name` (`name`),
    INDEX `idx_label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create tl_gang_grades table
CREATE TABLE IF NOT EXISTS `tl_gang_grades` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `gang_name` VARCHAR(50) NOT NULL,
    `grade` TINYINT(3) UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `payment` INT NOT NULL DEFAULT 0,
    `isboss` TINYINT(1) NOT NULL DEFAULT 0,
    `bankauth` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`gang_name`) REFERENCES `tl_gangs`(`name`) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY `unique_grade` (`gang_name`, `grade`),
    INDEX `idx_gang_name` (`gang_name`),
    INDEX `idx_grade` (`grade`),
    INDEX `idx_gang_grade_lookup` (`gang_name`, `grade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
