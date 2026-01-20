-- BlueHand Canvas - Quick Database Check & Fix
-- Run this in phpMyAdmin to ensure all required tables exist

USE wiseguy_bluehand;

-- Check if tables exist and create if missing
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `image_url` VARCHAR(500),
  `sort_order` INT DEFAULT 0,
  `active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `frame_types` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `price_percentage` DECIMAL(5,2) DEFAULT 0.00,
  `sort_order` INT DEFAULT 0,
  `active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sizes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `width` INT NOT NULL,
  `height` INT NOT NULL,
  `base_price` DECIMAL(10,2) NOT NULL,
  `sort_order` INT DEFAULT 0,
  `active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `size_dimensions` (`width`, `height`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `unsplash_searches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `query` VARCHAR(255) NOT NULL,
  `results` TEXT,
  `total_results` INT DEFAULT 0,
  `searched_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_query` (`query`),
  INDEX `idx_searched_at` (`searched_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `settings_key` VARCHAR(100) NOT NULL UNIQUE,
  `settings_value` TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default data (IGNORE duplicates)
INSERT IGNORE INTO `categories` (`name`, `slug`, `description`, `sort_order`, `active`) VALUES
('Peisaje', 'peisaje', 'Tablouri cu peisaje naturale și urbane', 1, TRUE),
('Abstract', 'abstract', 'Artă abstractă modernă', 2, TRUE),
('Portrete', 'portrete', 'Portrete și figuri umane', 3, TRUE),
('Animale', 'animale', 'Tablouri cu animale', 4, TRUE),
('Flori', 'flori', 'Tablouri cu flori și plante', 5, TRUE),
('Arhitectură', 'arhitectura', 'Clădiri și structuri', 6, TRUE);

INSERT IGNORE INTO `frame_types` (`name`, `slug`, `description`, `price_percentage`, `sort_order`, `active`) VALUES
('Fără Ramă', 'fara-rama', 'Fără ramă', 0.00, 1, TRUE),
('Ramă Neagră', 'rama-neagra', 'Ramă din lemn negru', 25.00, 2, TRUE),
('Ramă Albă', 'rama-alba', 'Ramă din lemn alb', 25.00, 3, TRUE),
('Ramă Naturală', 'rama-naturala', 'Ramă din lemn natural', 30.00, 4, TRUE),
('Ramă Premium', 'rama-premium', 'Ramă premium cu finisaj de lux', 50.00, 5, TRUE);

INSERT IGNORE INTO `sizes` (`name`, `width`, `height`, `base_price`, `sort_order`, `active`) VALUES
('20x30 cm', 20, 30, 89.00, 1, TRUE),
('30x40 cm', 30, 40, 129.00, 2, TRUE),
('40x60 cm', 40, 60, 179.00, 3, TRUE),
('50x70 cm', 50, 70, 249.00, 4, TRUE),
('60x90 cm', 60, 90, 349.00, 5, TRUE),
('70x100 cm', 70, 100, 449.00, 6, TRUE),
('90x120 cm', 90, 120, 599.00, 7, TRUE),
('100x150 cm', 100, 150, 799.00, 8, TRUE);

-- Verify data
SELECT 'Categories:' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Frame Types:', COUNT(*) FROM frame_types
UNION ALL
SELECT 'Sizes:', COUNT(*) FROM sizes
UNION ALL
SELECT 'Unsplash Searches:', COUNT(*) FROM unsplash_searches
UNION ALL
SELECT 'System Settings:', COUNT(*) FROM system_settings;
