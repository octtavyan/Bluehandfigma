-- BlueHand Canvas - Simple Database Fix
-- Run this in phpMyAdmin step by step

USE wiseguy_bluehand;

-- ============================================================================
-- STEP 1: Drop old tables if they have wrong structure
-- ============================================================================
-- SKIP THIS if you have important data!
-- DROP TABLE IF EXISTS `categories`;
-- DROP TABLE IF EXISTS `frame_types`;
-- DROP TABLE IF EXISTS `sizes`;

-- ============================================================================
-- STEP 2: Create tables with correct structure
-- ============================================================================

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

-- ============================================================================
-- STEP 3: Insert data ONLY if tables are empty
-- ============================================================================

-- Check if categories is empty, then insert
INSERT INTO `categories` (`name`, `slug`, `description`, `sort_order`, `active`)
SELECT * FROM (
  SELECT 'Peisaje' as name, 'peisaje' as slug, 'Tablouri cu peisaje naturale și urbane' as description, 1 as sort_order, TRUE as active
  UNION ALL SELECT 'Abstract', 'abstract', 'Artă abstractă modernă', 2, TRUE
  UNION ALL SELECT 'Portrete', 'portrete', 'Portrete și figuri umane', 3, TRUE
  UNION ALL SELECT 'Animale', 'animale', 'Tablouri cu animale', 4, TRUE
  UNION ALL SELECT 'Flori', 'flori', 'Tablouri cu flori și plante', 5, TRUE
  UNION ALL SELECT 'Arhitectură', 'arhitectura', 'Clădiri și structuri', 6, TRUE
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `categories` LIMIT 1);

-- Insert frame types
INSERT INTO `frame_types` (`name`, `slug`, `description`, `price_percentage`, `sort_order`, `active`)
SELECT * FROM (
  SELECT 'Fără Ramă' as name, 'fara-rama' as slug, 'Fără ramă' as description, 0.00 as price_percentage, 1 as sort_order, TRUE as active
  UNION ALL SELECT 'Ramă Neagră', 'rama-neagra', 'Ramă din lemn negru', 25.00, 2, TRUE
  UNION ALL SELECT 'Ramă Albă', 'rama-alba', 'Ramă din lemn alb', 25.00, 3, TRUE
  UNION ALL SELECT 'Ramă Naturală', 'rama-naturala', 'Ramă din lemn natural', 30.00, 4, TRUE
  UNION ALL SELECT 'Ramă Premium', 'rama-premium', 'Ramă premium cu finisaj de lux', 50.00, 5, TRUE
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `frame_types` LIMIT 1);

-- Insert sizes
INSERT INTO `sizes` (`name`, `width`, `height`, `base_price`, `sort_order`, `active`)
SELECT * FROM (
  SELECT '20x30 cm' as name, 20 as width, 30 as height, 89.00 as base_price, 1 as sort_order, TRUE as active
  UNION ALL SELECT '30x40 cm', 30, 40, 129.00, 2, TRUE
  UNION ALL SELECT '40x60 cm', 40, 60, 179.00, 3, TRUE
  UNION ALL SELECT '50x70 cm', 50, 70, 249.00, 4, TRUE
  UNION ALL SELECT '60x90 cm', 60, 90, 349.00, 5, TRUE
  UNION ALL SELECT '70x100 cm', 70, 100, 449.00, 6, TRUE
  UNION ALL SELECT '90x120 cm', 90, 120, 599.00, 7, TRUE
  UNION ALL SELECT '100x150 cm', 100, 150, 799.00, 8, TRUE
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `sizes` LIMIT 1);

-- ============================================================================
-- STEP 4: Verify data
-- ============================================================================

SELECT 'Categories:' as Table_Name, COUNT(*) as Count FROM categories
UNION ALL
SELECT 'Frame Types:', COUNT(*) FROM frame_types
UNION ALL
SELECT 'Sizes:', COUNT(*) FROM sizes;
