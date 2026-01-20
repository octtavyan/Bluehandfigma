-- BlueHand Canvas - Ultra Simple Database Fix
-- Copy-paste ONLY the sections you need

-- ============================================================================
-- STEP 1: Check what you have (copy-paste this first)
-- ============================================================================

SHOW TABLES;

-- ============================================================================
-- STEP 2: Check table structure (copy-paste this)
-- ============================================================================

DESCRIBE categories;
DESCRIBE frame_types;  
DESCRIBE sizes;

-- ============================================================================
-- STEP 3A: If categories table is EMPTY, insert data
-- ============================================================================

INSERT IGNORE INTO `categories` (`name`, `slug`) VALUES
('Peisaje', 'peisaje'),
('Abstract', 'abstract'),
('Portrete', 'portrete'),
('Animale', 'animale'),
('Flori', 'flori'),
('Arhitectură', 'arhitectura');

-- ============================================================================
-- STEP 3B: If frame_types table is EMPTY, insert data
-- ============================================================================

INSERT IGNORE INTO `frame_types` (`name`, `slug`, `price_percentage`) VALUES
('Fără Ramă', 'fara-rama', 0.00),
('Ramă Neagră', 'rama-neagra', 25.00),
('Ramă Albă', 'rama-alba', 25.00),
('Ramă Naturală', 'rama-naturala', 30.00),
('Ramă Premium', 'rama-premium', 50.00);

-- ============================================================================
-- STEP 3C: If sizes table is EMPTY, insert data
-- ============================================================================

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
-- STEP 4: Verify the data was inserted
-- ============================================================================

SELECT * FROM categories;
SELECT * FROM frame_types;
SELECT * FROM sizes;
