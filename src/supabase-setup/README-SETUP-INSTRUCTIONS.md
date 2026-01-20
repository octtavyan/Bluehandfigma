# Supabase Database Setup - Step by Step

## 🚨 IMPORTANT: Run These SQL Files ONE AT A TIME

The large SQL file was causing timeouts. These smaller files will run quickly.

## Setup Instructions

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your BlueHand Canvas project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"+ New Query"**

### Step 2: Run Each SQL File (One by One)

Copy and paste the content of each file below into the SQL Editor and click **"Run"** (or Ctrl/Cmd + Enter).

**Run in this order:**

#### 1. Hero Slides (Homepage slider)
📄 **File:** `01-hero-slides.sql`
```
Copy content → Paste in SQL Editor → Run
```
✅ **Should see:** "Success. No rows returned"

---

#### 2. Blog Posts
📄 **File:** `02-blog-posts.sql`
```
Copy content → Paste in SQL Editor → Run
```
✅ **Should see:** "Success. No rows returned"

---

#### 3. Categories & Subcategories (with sample data)
📄 **File:** `03-categories-subcategories.sql`
```
Copy content → Paste in SQL Editor → Run
```
✅ **Should see:** "Success. 8 rows" (or similar)

---

#### 4. Sizes & Frame Types
📄 **File:** `04-sizes-frames.sql`
```
Copy content → Paste in SQL Editor → Run
```
✅ **Should see:** "Success. 4 rows" (frame types)

---

#### 5. Admin Users
📄 **File:** `05-admin-users.sql`
```
Copy content → Paste in SQL Editor → Run
```
✅ **Should see:** "Success. No rows returned"

**IMPORTANT:** This creates the table but NO users yet!

---

#### 6. Unsplash Settings
📄 **File:** `06-unsplash.sql`
```
Copy content → Paste in SQL Editor → Run
```
✅ **Should see:** "Success. 1 row" (default settings row)

---

#### 7. Orders & Clients
📄 **File:** `07-orders-clients.sql`
```
Copy content → Paste in SQL Editor → Run
```
✅ **Should see:** "Success. No rows returned"

---

#### 8. Paintings (Optional - for future use)
📄 **File:** `08-paintings.sql`
```
Copy content → Paste in SQL Editor → Run
```
✅ **Should see:** "Success. No rows returned"

---

## Step 3: Create Your First Admin User

After running all the above files, create an admin user:

### Open a NEW query in SQL Editor and run:

```sql
INSERT INTO admin_users (username, password, role, full_name, email, is_active)
VALUES ('admin', 'admin123', 'full-admin', 'Administrator', 'admin@bluehand.ro', true);
```

✅ **Should see:** "Success. 1 row"

**⚠️ IMPORTANT:** Change the password after first login!

---

## Step 4: Verify Everything

### Option 1: Use the Database Check Page
1. Login to admin: `/admin/login` 
   - Username: `admin`
   - Password: `admin123`
2. Click **"Database Check"** button (amber button at bottom of sidebar)
3. Should show all tables as ✅ existing

### Option 2: Manual Check
Run this query in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see:
- ✅ admin_users
- ✅ blog_posts
- ✅ categories
- ✅ clients
- ✅ frame_types
- ✅ hero_slides
- ✅ orders
- ✅ paintings
- ✅ sizes
- ✅ subcategories
- ✅ unsplash_searches
- ✅ unsplash_settings

---

## Step 5: Configure the Application

### A. Login to Admin Panel
- URL: `/admin/login`
- Username: `admin`
- Password: `admin123`

### B. Add Canvas Sizes (REQUIRED)
1. Go to **Admin → Dimensiuni**
2. Click **"Adaugă Dimensiune Nouă"**
3. Add sizes (e.g., 30x40, 50x70, etc.) with prices

Example sizes:
- 30 x 40 cm - 150 RON
- 40 x 60 cm - 200 RON
- 50 x 70 cm - 250 RON
- 60 x 80 cm - 300 RON
- 70 x 100 cm - 400 RON

### C. Configure Unsplash (REQUIRED for Printuri si Canvas)
1. Go to **Admin → Unsplash**
2. Add your Unsplash Access Key
   - Get free key at: https://unsplash.com/developers
3. Search and select 24 curated images for your gallery

### D. Add Hero Slides (Homepage slider)
1. Go to **Admin → Hero Slides**
2. Add slider images (upload to Cloudinary first if configured)

### E. Optional: Configure Cloudinary
1. Go to **Admin → Settings → Cloudinary**
2. Add Cloud Name and Upload Preset
3. All future images will use Cloudinary (saves Supabase bandwidth)

---

## Troubleshooting

### ❌ "relation already exists" error
**Solution:** Table already exists! Skip to next file.

### ❌ "permission denied" error
**Solution:** Check you're using the correct Supabase project. RLS policies should allow creation.

### ❌ Timeout error
**Solution:** These small files shouldn't timeout. If they do:
1. Check your internet connection
2. Try running during off-peak hours
3. Contact Supabase support

### ❌ Can't login after creating admin user
**Solution:** 
1. Verify user was created: `SELECT * FROM admin_users;`
2. Check username/password match exactly
3. User must have `is_active = true`

### ❌ Hero slides/blog don't show on frontend
**Solution:** Add data via admin panel first! Tables are empty after creation.

---

## What Each Table Does

| Table | Purpose | Needs Data? |
|-------|---------|-------------|
| `hero_slides` | Homepage slider images | ✅ Add via admin |
| `blog_posts` | Blog articles | ✅ Add via admin |
| `categories` | Product categories | ✅ Auto-populated |
| `subcategories` | Style tags | ✅ Auto-populated |
| `sizes` | Canvas sizes + prices | ✅ Add via admin |
| `frame_types` | Frame options | ✅ Auto-populated |
| `admin_users` | CMS login users | ✅ Create manually |
| `unsplash_settings` | Unsplash API config | ✅ Configure in admin |
| `unsplash_searches` | Search tracking | ⏱️ Auto-fills on use |
| `orders` | Customer orders | ⏱️ Auto-fills on checkout |
| `clients` | Customer data | ⏱️ Auto-fills on checkout |
| `paintings` | Product catalog | ⏸️ Not used (Unsplash only) |

---

## 🎉 You're Done!

After completing these steps:
1. ✅ All database tables created
2. ✅ Admin user ready to login
3. ✅ Application fully functional

**Next:** Configure Unsplash, add sizes, and start using the app!
