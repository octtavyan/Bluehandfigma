# 🎨 Unsplash Integration Setup Guide

## ✅ What This Does

1. **Pre-populate "Printuri si Canvas" with Unsplash images** based on admin settings
2. **Track all user searches** and save them to the database
3. **Display search history in admin** with saved results
4. **Manage Unsplash settings** (curated queries, image count, etc.)

---

## 📋 Installation Steps

### **Step 1: Create Database Tables**

In phpMyAdmin, run this SQL:

```sql
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
```

**Expected result:**
- ✅ 2 tables created
- ✅ 1 row inserted (default settings)

---

### **Step 2: Upload PHP Backend File**

Upload the file to your server:

**File:** `/server-deploy/api/unsplash.php`  
**Upload to:** `/public_html/api/unsplash.php`

---

### **Step 3: Verify .htaccess**

Make sure your `/public_html/api/.htaccess` includes URL rewriting:

```apache
RewriteEngine On

# Rewrite /api/unsplash/* to /api/unsplash.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^unsplash/(.*)$ unsplash.php [L,QSA]

# Other rewrites...
```

---

### **Step 4: Test the API**

Open these URLs in your browser:

1. **Test Settings Endpoint:**
   ```
   https://bluehand.ro/api/unsplash/settings
   ```
   **Expected:** `{"success":true,"settings":{...}}`

2. **Test Stats Endpoint:**
   ```
   https://bluehand.ro/api/unsplash/search-stats
   ```
   **Expected:** `{"success":true,"topSearches":[],"totalSearches":0}`

3. **Test Search History:**
   ```
   https://bluehand.ro/api/unsplash/search-history
   ```
   **Expected:** `{"success":true,"searches":[],"pagination":{...}}`

---

## 🎯 How It Works

### **Frontend (User Experience):**

1. **User visits `/tablouri-canvas`**
   - System automatically loads 24 random Unsplash images from configured curated queries
   - Images are displayed in the gallery alongside database paintings

2. **User searches for images** (e.g., "nature", "abstract")
   - Search results displayed instantly
   - Search query + first 10 results saved to database
   - No interruption to user experience

3. **User clicks on an Unsplash image**
   - Redirects to product detail page with customization options
   - Can configure size, frame type, and order

---

### **Admin Panel:**

1. **Statistics Tab** (`/admin/unsplash`)
   - View top 20 most searched queries
   - Total search count
   - Real-time refresh

2. **Settings Tab**
   - Configure curated queries (keywords for random images)
   - Set number of images to display (default: 24)
   - Toggle auto-refresh on page load

3. **Search History Tab**
   - View all saved searches with timestamps
   - See first 10 results for each search
   - Delete old searches
   - Pagination (10 per page)

---

## 📊 Database Schema

### **`unsplash_searches` Table:**
```
id              INT (Primary Key)
query           VARCHAR(255) - Search query
results         TEXT (JSON) - Array of image results
total_results   INT - Total results from Unsplash API
searched_at     DATETIME - When search was performed
```

### **`system_settings` Table:**
```
id              INT (Primary Key)
settings_key    VARCHAR(100) UNIQUE - Setting identifier
settings_value  TEXT (JSON) - Setting value
updated_at      DATETIME - Last update timestamp
```

---

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/unsplash/settings` | GET | Get Unsplash settings |
| `/api/unsplash/settings` | POST | Save Unsplash settings |
| `/api/unsplash/search-stats` | GET | Get top searches & total count |
| `/api/unsplash/search-history` | GET | Get paginated search history |
| `/api/unsplash/search-history/:id` | DELETE | Delete a search record |
| `/api/unsplash/save-search` | POST | Save a new search (called automatically by frontend) |

---

## 🎨 Default Settings

```json
{
  "curatedQueries": ["nature", "abstract", "architecture", "minimal", "landscape"],
  "randomImageCount": 24,
  "refreshOnPageLoad": true
}
```

**What this means:**
- When users visit the page, 24 random images are loaded
- Images are fetched from 5 different categories
- Each page load shows different images (if `refreshOnPageLoad` is true)

---

## 🐛 Troubleshooting

### **Error: "Table doesn't exist"**
**Solution:** Run the SQL from Step 1 in phpMyAdmin

### **Error: "Failed to save search"**
**Solution:** Check:
1. `unsplash.php` is uploaded to `/public_html/api/`
2. `.htaccess` has correct rewrites
3. Database tables exist

### **No images showing in gallery**
**Solution:** Check:
1. Unsplash API key is configured in `/services/unsplashService.ts`
2. Frontend console for errors (F12)
3. Settings are saved in admin panel

### **Search tracking not working**
**Solution:** Check:
1. `/api/unsplash/save-search` endpoint is accessible
2. Browser console for errors
3. Database table `unsplash_searches` exists

---

## ✅ Verification Checklist

After installation, verify:

- [ ] SQL tables created successfully
- [ ] PHP file uploaded to `/public_html/api/unsplash.php`
- [ ] `.htaccess` configured with URL rewrites
- [ ] API endpoints return valid JSON
- [ ] Admin settings page loads
- [ ] Unsplash images appear in gallery
- [ ] Search tracking works (check admin history tab)
- [ ] Settings can be saved and loaded

---

## 🎉 Success!

Once everything is working:

1. Visit: `https://bluehand.ro/tablouri-canvas`
2. See 24 pre-loaded Unsplash images ✅
3. Search for images (e.g., "ocean") ✅
4. Go to admin: `https://bluehand.ro/admin/unsplash`
5. See your search in "Istoric Căutări" ✅

---

## 📝 Notes

- Search tracking is **silent** - it never interrupts the user
- First 10 results are saved to avoid database bloat
- Settings are stored as JSON for flexibility
- Pagination shows 10 searches per page
- Search stats update in real-time

---

**Need help?** Check the browser console (F12) and PHP error logs in cPanel.
