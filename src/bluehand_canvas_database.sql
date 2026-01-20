-- BlueHand Canvas Database Export
-- Database: wiseguy_bluehand
-- Generated: 2026-01-19
-- 
-- This database is designed to work with the BlueHand Canvas e-commerce platform
-- Frontend hosted on GitHub Pages, Backend on dedicated server

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Database: `wiseguy_bluehand`
-- --------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `wiseguy_bluehand` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `wiseguy_bluehand`;

-- --------------------------------------------------------

--
-- Table structure for table `kv_store`
-- This is the main key-value store used by the application
--

CREATE TABLE `kv_store` (
  `key` VARCHAR(255) NOT NULL,
  `value` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `paintings`
-- Stores all canvas artworks
--

CREATE TABLE `paintings` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `subcategory` VARCHAR(100) DEFAULT NULL,
  `description` TEXT,
  `image` VARCHAR(500) NOT NULL,
  `image_urls` JSON DEFAULT NULL COMMENT 'Optimized images: original, medium, thumbnail',
  `available_sizes` JSON NOT NULL COMMENT 'Array of size IDs',
  `price` DECIMAL(10,2) NOT NULL,
  `discount` INT(11) NOT NULL DEFAULT 0,
  `is_bestseller` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `orientation` ENUM('portrait','landscape','square') DEFAULT NULL,
  `dominant_color` VARCHAR(20) DEFAULT NULL,
  `print_types` JSON DEFAULT NULL COMMENT 'Array of print types',
  `frame_types_by_print_type` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_is_bestseller` (`is_bestseller`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
-- Stores customer orders
--

CREATE TABLE `orders` (
  `id` VARCHAR(50) NOT NULL,
  `order_number` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `county` VARCHAR(100) NOT NULL,
  `postal_code` VARCHAR(20) DEFAULT NULL,
  `delivery_method` ENUM('economic','standard','express') NOT NULL DEFAULT 'standard',
  `delivery_price` DECIMAL(10,2) NOT NULL,
  `payment_method` ENUM('card','cash') NOT NULL,
  `payment_status` ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `netopia_order_id` VARCHAR(100) DEFAULT NULL,
  `items` JSON NOT NULL COMMENT 'Order items array',
  `subtotal` DECIMAL(10,2) NOT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  `awb_number` VARCHAR(50) DEFAULT NULL,
  `tracking_status` VARCHAR(50) DEFAULT NULL,
  `notes` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  INDEX `idx_customer_email` (`customer_email`),
  INDEX `idx_payment_status` (`payment_status`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_netopia_order_id` (`netopia_order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clients`
-- Stores customer information
--

CREATE TABLE `clients` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `county` VARCHAR(100) DEFAULT NULL,
  `total_orders` INT(11) NOT NULL DEFAULT 0,
  `total_spent` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `last_order_date` TIMESTAMP NULL DEFAULT NULL,
  `notes` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  INDEX `idx_email` (`email`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
-- Admin users for CMS
--

CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','editor','viewer') NOT NULL DEFAULT 'viewer',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
-- Blog articles
--

CREATE TABLE `blog_posts` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `excerpt` TEXT,
  `content` LONGTEXT NOT NULL,
  `featured_image` VARCHAR(500) DEFAULT NULL,
  `author` VARCHAR(100) NOT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `tags` JSON DEFAULT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 0,
  `published_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  INDEX `idx_is_published` (`is_published`),
  INDEX `idx_published_at` (`published_at`),
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hero_slides`
-- Homepage hero slider images
--

CREATE TABLE `hero_slides` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `image_url` VARCHAR(500) NOT NULL,
  `link_url` VARCHAR(500) DEFAULT NULL,
  `button_text` VARCHAR(100) DEFAULT NULL,
  `order_index` INT(11) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_order_index` (`order_index`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
-- Product categories
--

CREATE TABLE `categories` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `parent_id` VARCHAR(50) DEFAULT NULL,
  `order_index` INT(11) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sizes`
-- Product sizes configuration
--

CREATE TABLE `sizes` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `dimensions` VARCHAR(50) NOT NULL COMMENT 'e.g., 30x40',
  `base_price` DECIMAL(10,2) NOT NULL,
  `supports_print_canvas` TINYINT(1) NOT NULL DEFAULT 1,
  `supports_print_hartie` TINYINT(1) NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `frame_types`
-- Frame types with pricing
--

CREATE TABLE `frame_types` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `print_type` ENUM('Print Canvas','Print Hartie') NOT NULL,
  `price_percentage` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Percentage added to base price',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_print_type` (`print_type`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
-- Application settings
--

CREATE TABLE `settings` (
  `key` VARCHAR(100) NOT NULL,
  `value` LONGTEXT NOT NULL,
  `description` TEXT,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Insert default admin user
-- Username: admin
-- Password: admin123 (CHANGE THIS IMMEDIATELY!)
-- Password hash generated with bcrypt
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `is_active`) VALUES
('user-admin-default', 'admin', 'admin@bluehand.ro', '$2a$10$XK8z9vZZ7qG.GqKNPxXxKOmVYJxJxY4qR5rZ9vZZ7qG.GqKNPxXxK', 'admin', 1);

-- --------------------------------------------------------

--
-- Insert default settings
--

INSERT INTO `settings` (`key`, `value`, `description`) VALUES
('database_config', '{"provider":"custom-server","storageMode":"server-filesystem"}', 'Database and storage configuration'),
('storage_config', '{"provider":"custom-server","storageMode":"server-filesystem"}', 'File storage configuration'),
('email_settings', '{"fromEmail":"hello@bluehand.ro","fromName":"BlueHand Canvas","isConfigured":false}', 'Email configuration'),
('netopia_settings', '{"merchantId":"","apiKey":"","isLive":false,"posSignature":"","publicKey":""}', 'Netopia Payments configuration'),
('fancourier_settings', '{"clientId":"","username":"","password":"","isActive":false}', 'FAN Courier AWB configuration');

-- --------------------------------------------------------

--
-- Insert sample sizes
--

INSERT INTO `sizes` (`id`, `name`, `dimensions`, `base_price`, `supports_print_canvas`, `supports_print_hartie`, `is_active`) VALUES
('size-30x20', '30x20 cm', '30x20', 89.99, 1, 1, 1),
('size-40x30', '40x30 cm', '40x30', 129.99, 1, 1, 1),
('size-50x40', '50x40 cm', '50x40', 179.99, 1, 1, 1),
('size-60x40', '60x40 cm', '60x40', 219.99, 1, 1, 1),
('size-70x50', '70x50 cm', '70x50', 269.99, 1, 1, 1),
('size-80x60', '80x60 cm', '80x60', 329.99, 1, 1, 1),
('size-90x60', '90x60 cm', '90x60', 369.99, 1, 1, 1),
('size-100x70', '100x70 cm', '100x70', 429.99, 1, 1, 1),
('size-120x80', '120x80 cm', '120x80', 529.99, 1, 1, 1),
('size-150x100', '150x100 cm', '150x100', 699.99, 1, 1, 1);

-- --------------------------------------------------------

--
-- Insert sample frame types
--

INSERT INTO `frame_types` (`id`, `name`, `print_type`, `price_percentage`, `is_active`) VALUES
('frame-canvas-none', 'Fără Ramă', 'Print Canvas', 0.00, 1),
('frame-canvas-black', 'Ramă Neagră', 'Print Canvas', 15.00, 1),
('frame-canvas-white', 'Ramă Albă', 'Print Canvas', 15.00, 1),
('frame-canvas-natural', 'Ramă Lemn Natural', 'Print Canvas', 20.00, 1),
('frame-hartie-none', 'Fără Ramă', 'Print Hartie', 0.00, 1),
('frame-hartie-black', 'Ramă Neagră', 'Print Hartie', 12.00, 1),
('frame-hartie-white', 'Ramă Albă', 'Print Hartie', 12.00, 1),
('frame-hartie-gold', 'Ramă Aurie', 'Print Hartie', 18.00, 1);

-- --------------------------------------------------------

--
-- Insert sample categories
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `parent_id`, `order_index`, `is_active`) VALUES
('cat-abstract', 'Abstract', 'abstract', 'Tablouri abstracte moderne', NULL, 1, 1),
('cat-nature', 'Natură', 'nature', 'Peisaje și tablouri cu natură', NULL, 2, 1),
('cat-animals', 'Animale', 'animals', 'Tablouri cu animale', NULL, 3, 1),
('cat-cities', 'Orașe', 'cities', 'Peisaje urbane și orașe', NULL, 4, 1),
('cat-vintage', 'Vintage', 'vintage', 'Tablouri în stil vintage', NULL, 5, 1),
('cat-modern', 'Modern', 'modern', 'Arte moderne', NULL, 6, 1);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
