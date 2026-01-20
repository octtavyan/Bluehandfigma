-- BlueHand Canvas - Complete Database Schema
-- Import this file via phpMyAdmin or MySQL command line

-- Use the database
USE wiseguy_bluehand;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Categories table
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

-- Styles table
CREATE TABLE IF NOT EXISTS `styles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `sort_order` INT DEFAULT 0,
  `active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Print types table
CREATE TABLE IF NOT EXISTS `print_types` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `price_percentage` DECIMAL(5,2) DEFAULT 100.00,
  `sort_order` INT DEFAULT 0,
  `active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Frame types table
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

-- Sizes table
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

-- Paintings/Products table (already exists from test-db, but let's ensure structure)
CREATE TABLE IF NOT EXISTS `paintings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `artist` VARCHAR(255),
  `year` VARCHAR(50),
  `original_price` DECIMAL(10,2),
  `discount_percentage` INT DEFAULT 0,
  `category_id` INT,
  `style_id` INT,
  `main_image` VARCHAR(500),
  `thumbnail` VARCHAR(500),
  `images` TEXT,
  `tags` TEXT,
  `featured` BOOLEAN DEFAULT FALSE,
  `new_arrival` BOOLEAN DEFAULT FALSE,
  `best_seller` BOOLEAN DEFAULT FALSE,
  `stock_status` ENUM('in_stock', 'low_stock', 'out_of_stock') DEFAULT 'in_stock',
  `active` BOOLEAN DEFAULT TRUE,
  `views` INT DEFAULT 0,
  `sales_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`style_id`) REFERENCES `styles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Painting sizes (many-to-many relationship)
CREATE TABLE IF NOT EXISTS `painting_sizes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `painting_id` INT NOT NULL,
  `size_id` INT NOT NULL,
  `custom_price` DECIMAL(10,2),
  `active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `painting_size_unique` (`painting_id`, `size_id`),
  FOREIGN KEY (`painting_id`) REFERENCES `paintings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`size_id`) REFERENCES `sizes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50),
  `shipping_address` TEXT NOT NULL,
  `shipping_city` VARCHAR(100) NOT NULL,
  `shipping_county` VARCHAR(100),
  `shipping_postal_code` VARCHAR(20),
  `shipping_country` VARCHAR(100) DEFAULT 'Romania',
  `billing_same_as_shipping` BOOLEAN DEFAULT TRUE,
  `billing_address` TEXT,
  `billing_city` VARCHAR(100),
  `billing_county` VARCHAR(100),
  `billing_postal_code` VARCHAR(20),
  `subtotal` DECIMAL(10,2) NOT NULL,
  `shipping_cost` DECIMAL(10,2) DEFAULT 0,
  `discount_amount` DECIMAL(10,2) DEFAULT 0,
  `total` DECIMAL(10,2) NOT NULL,
  `payment_method` ENUM('card', 'cash_on_delivery', 'bank_transfer') NOT NULL,
  `payment_status` ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  `order_status` ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  `notes` TEXT,
  `admin_notes` TEXT,
  `tracking_number` VARCHAR(100),
  `paid_at` TIMESTAMP NULL,
  `shipped_at` TIMESTAMP NULL,
  `delivered_at` TIMESTAMP NULL,
  `cancelled_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order items table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `painting_id` INT,
  `painting_title` VARCHAR(255) NOT NULL,
  `painting_image` VARCHAR(500),
  `size_name` VARCHAR(50) NOT NULL,
  `print_type` VARCHAR(100),
  `frame_type` VARCHAR(100),
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `total_price` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`painting_id`) REFERENCES `paintings`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table (for admin panel)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `role` ENUM('super_admin', 'admin', 'editor', 'viewer') DEFAULT 'viewer',
  `active` BOOLEAN DEFAULT TRUE,
  `last_login` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings table (key-value store for site settings)
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` TEXT,
  `type` ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blog posts table
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `excerpt` TEXT,
  `content` LONGTEXT NOT NULL,
  `featured_image` VARCHAR(500),
  `author_id` INT,
  `category` VARCHAR(100),
  `tags` TEXT,
  `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  `published_at` TIMESTAMP NULL,
  `views` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sliders table (for homepage carousel)
CREATE TABLE IF NOT EXISTS `sliders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255),
  `subtitle` VARCHAR(255),
  `image` VARCHAR(500) NOT NULL,
  `link_url` VARCHAR(500),
  `button_text` VARCHAR(100),
  `sort_order` INT DEFAULT 0,
  `active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert default categories
INSERT IGNORE INTO `categories` (`name`, `slug`, `description`, `sort_order`, `active`) VALUES
('Peisaje', 'peisaje', 'Tablouri cu peisaje naturale și urbane', 1, TRUE),
('Abstract', 'abstract', 'Artă abstractă modernă', 2, TRUE),
('Portrete', 'portrete', 'Portrete și figuri umane', 3, TRUE),
('Animale', 'animale', 'Tablouri cu animale', 4, TRUE),
('Flori', 'flori', 'Tablouri cu flori și plante', 5, TRUE),
('Arhitectură', 'arhitectura', 'Clădiri și structuri', 6, TRUE);

-- Insert default styles
INSERT IGNORE INTO `styles` (`name`, `slug`, `description`, `sort_order`, `active`) VALUES
('Realism', 'realism', 'Stil realist', 1, TRUE),
('Abstract', 'abstract', 'Stil abstract', 2, TRUE),
('Modern', 'modern', 'Stil modern', 3, TRUE),
('Minimalist', 'minimalist', 'Stil minimalist', 4, TRUE),
('Vintage', 'vintage', 'Stil vintage', 5, TRUE),
('Contemporan', 'contemporan', 'Stil contemporan', 6, TRUE);

-- Insert print types
INSERT IGNORE INTO `print_types` (`name`, `slug`, `description`, `price_percentage`, `sort_order`, `active`) VALUES
('Canvas Premium', 'canvas-premium', 'Pânză canvas premium de înaltă calitate', 100.00, 1, TRUE),
('Print Foto', 'print-foto', 'Print foto profesional', 70.00, 2, TRUE),
('Print Hârtie', 'print-hartie', 'Print pe hârtie de artă', 60.00, 3, TRUE);

-- Insert frame types
INSERT IGNORE INTO `frame_types` (`name`, `slug`, `description`, `price_percentage`, `sort_order`, `active`) VALUES
('Fără Ramă', 'fara-rama', 'Fără ramă', 0.00, 1, TRUE),
('Ramă Neagră', 'rama-neagra', 'Ramă din lemn negru', 25.00, 2, TRUE),
('Ramă Albă', 'rama-alba', 'Ramă din lemn alb', 25.00, 3, TRUE),
('Ramă Naturală', 'rama-naturala', 'Ramă din lemn natural', 30.00, 4, TRUE),
('Ramă Premium', 'rama-premium', 'Ramă premium cu finisaj de lux', 50.00, 5, TRUE);

-- Insert standard sizes
INSERT IGNORE INTO `sizes` (`name`, `width`, `height`, `base_price`, `sort_order`, `active`) VALUES
('20x30 cm', 20, 30, 89.00, 1, TRUE),
('30x40 cm', 30, 40, 129.00, 2, TRUE),
('40x60 cm', 40, 60, 179.00, 3, TRUE),
('50x70 cm', 50, 70, 249.00, 4, TRUE),
('60x90 cm', 60, 90, 349.00, 5, TRUE),
('70x100 cm', 70, 100, 449.00, 6, TRUE),
('90x120 cm', 90, 120, 599.00, 7, TRUE),
('100x150 cm', 100, 150, 799.00, 8, TRUE);

-- Insert default admin user (email: admin@bluehand.ro, password: admin123)
-- Password hash for 'admin123' using PHP password_hash()
INSERT IGNORE INTO `users` (`email`, `password_hash`, `name`, `role`, `active`) VALUES
('admin@bluehand.ro', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'super_admin', TRUE);

-- Insert default settings
INSERT IGNORE INTO `settings` (`key`, `value`, `type`, `description`) VALUES
('site_name', 'BlueHand Canvas', 'string', 'Numele site-ului'),
('site_email', 'contact@bluehand.ro', 'string', 'Email de contact'),
('site_phone', '+40 712 345 678', 'string', 'Telefon de contact'),
('shipping_cost', '25', 'number', 'Cost transport standard (RON)'),
('free_shipping_threshold', '500', 'number', 'Comandă minimă pentru transport gratuit (RON)'),
('currency', 'RON', 'string', 'Moneda'),
('vat_rate', '19', 'number', 'Cota TVA (%)');

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Paintings indexes
CREATE INDEX idx_paintings_category ON paintings(category_id);
CREATE INDEX idx_paintings_style ON paintings(style_id);
CREATE INDEX idx_paintings_featured ON paintings(featured);
CREATE INDEX idx_paintings_active ON paintings(active);
CREATE INDEX idx_paintings_slug ON paintings(slug);

-- Orders indexes
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- Order items indexes
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_painting ON order_items(painting_id);

-- Blog posts indexes
CREATE INDEX idx_blog_slug ON blog_posts(slug);
CREATE INDEX idx_blog_status ON blog_posts(status);
CREATE INDEX idx_blog_author ON blog_posts(author_id);

-- ============================================================================
-- DONE!
-- ============================================================================
