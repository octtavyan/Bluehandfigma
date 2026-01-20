-- BlueHand Canvas - Fix Foreign Key Error
-- Run this in phpMyAdmin to fix the painting_sizes table issue

-- Step 1: Drop the problematic table if it exists
DROP TABLE IF EXISTS `painting_sizes`;

-- Step 2: Make sure paintings table uses InnoDB engine
ALTER TABLE `paintings` ENGINE=InnoDB;

-- Step 3: Make sure sizes table uses InnoDB engine  
ALTER TABLE `sizes` ENGINE=InnoDB;

-- Step 4: Now create the painting_sizes table
CREATE TABLE `painting_sizes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `painting_id` INT NOT NULL,
  `size_id` INT NOT NULL,
  `custom_price` DECIMAL(10,2),
  `active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `painting_size_unique` (`painting_id`, `size_id`),
  KEY `fk_painting_id` (`painting_id`),
  KEY `fk_size_id` (`size_id`),
  FOREIGN KEY (`painting_id`) REFERENCES `paintings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`size_id`) REFERENCES `sizes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Done! painting_sizes table should now be created successfully
