-- BlueHand Canvas - SAFEST Database Fix
-- Run this ONE SECTION AT A TIME in phpMyAdmin

-- ============================================================================
-- SECTION 1: Check existing table structure
-- ============================================================================
-- Run this first to see what you have:

SHOW TABLES;
DESCRIBE categories;
DESCRIBE frame_types;
DESCRIBE sizes;

-- ============================================================================
-- SECTION 2: Add missing columns if needed
-- ============================================================================
-- If your tables exist but are missing columns, add them:

-- For categories table:
ALTER TABLE `categories` ADD COLUMN IF NOT EXISTS `sort_order` INT DEFAULT 0;
ALTER TABLE `categories` ADD COLUMN IF NOT EXISTS `active` BOOLEAN DEFAULT TRUE;
ALTER TABLE `categories` ADD COLUMN IF NOT EXISTS `image_url` VARCHAR(500);
ALTER TABLE `categories` ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `categories` ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- For frame_types table:
ALTER TABLE `frame_types` ADD COLUMN IF NOT EXISTS `sort_order` INT DEFAULT 0;
ALTER TABLE `frame_types` ADD COLUMN IF NOT EXISTS `active` BOOLEAN DEFAULT TRUE;
ALTER TABLE `frame_types` ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `frame_types` ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- For sizes table:
ALTER TABLE `sizes` ADD COLUMN IF NOT EXISTS `sort_order` INT DEFAULT 0;
ALTER TABLE `sizes` ADD COLUMN IF NOT EXISTS `active` BOOLEAN DEFAULT TRUE;
ALTER TABLE `sizes` ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `sizes` ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ============================================================================
-- SECTION 3: Insert sample data (only if tables are empty)
-- ============================================================================

-- Categories (will skip if already exists due to IGNORE)
INSERT IGNORE INTO `categories` (`name`, `slug`, `description`) VALUES
('Peisaje', 'peisaje', 'Tablouri cu peisaje naturale și urbane'),
('Abstract', 'abstract', 'Artă abstractă modernă'),
('Portrete', 'portrete', 'Portrete și figuri umane'),
('Animale', 'animale', 'Tablouri cu animale'),
('Flori', 'flori', 'Tablouri cu flori și plante'),
('Arhitectură', 'arhitectura', 'Clădiri și structuri');

-- Frame types (will skip if already exists)
INSERT IGNORE INTO `frame_types` (`name`, `slug`, `description`, `price_percentage`) VALUES
('Fără Ramă', 'fara-rama', 'Fără ramă', 0.00),
('Ramă Neagră', 'rama-neagra', 'Ramă din lemn negru', 25.00),
('Ramă Albă', 'rama-alba', 'Ramă din lemn alb', 25.00),
('Ramă Naturală', 'rama-naturala', 'Ramă din lemn natural', 30.00),
('Ramă Premium', 'rama-premium', 'Ramă premium cu finisaj de lux', 50.00);

-- Sizes (will skip if already exists)
INSERT IGNORE INTO `sizes` (`name`, `width`, `height`, `base_price`) VALUES
('20x30 cm', 20, 30, 89.00),
('30x40 cm', 30, 40, 129.00),
('40x60 cm', 40, 60, 179.00),
('50x70 cm', 50, 70, 249.00),
('60x90 cm', 60, 90, 349.00),
('70x100 cm', 70, 100, 449.00),
('90x120 cm', 90, 120, 599.00),
('100x150 cm', 100, 150, 799.00);

-- ============================================================================
-- SECTION 4: Verify
-- ============================================================================

SELECT COUNT(*) as total_categories FROM categories;
SELECT COUNT(*) as total_frame_types FROM frame_types;
SELECT COUNT(*) as total_sizes FROM sizes;
