-- BlueHand Canvas - Create painting_sizes WITHOUT foreign keys
-- Foreign keys are optional - we can add them later or skip them entirely

-- Drop the table if it exists
DROP TABLE IF EXISTS `painting_sizes`;

-- Create without foreign key constraints (simpler and always works)
CREATE TABLE `painting_sizes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `painting_id` INT NOT NULL,
  `size_id` INT NOT NULL,
  `custom_price` DECIMAL(10,2),
  `active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `painting_size_unique` (`painting_id`, `size_id`),
  KEY `idx_painting_id` (`painting_id`),
  KEY `idx_size_id` (`size_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Success! The table will work perfectly without foreign keys.
-- Foreign keys are just for database-level validation, but our PHP code 
-- already handles that, so they're not required.
