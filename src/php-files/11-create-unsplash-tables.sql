-- Create Unsplash search history table
CREATE TABLE IF NOT EXISTS unsplash_searches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    query VARCHAR(255) NOT NULL,
    results TEXT NOT NULL COMMENT 'JSON array of Unsplash image results',
    total_results INT NOT NULL DEFAULT 0,
    searched_at DATETIME NOT NULL,
    INDEX idx_query (query),
    INDEX idx_searched_at (searched_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create system settings table (if not exists)
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    settings_key VARCHAR(100) NOT NULL UNIQUE,
    settings_value TEXT NOT NULL COMMENT 'JSON value',
    updated_at DATETIME NOT NULL,
    INDEX idx_settings_key (settings_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default Unsplash settings
INSERT INTO system_settings (settings_key, settings_value, updated_at)
VALUES (
    'unsplash_config',
    '{"curatedQueries":["nature","abstract","architecture","minimal","landscape"],"randomImageCount":24,"refreshOnPageLoad":true}',
    NOW()
)
ON DUPLICATE KEY UPDATE updated_at = NOW();
