# ⚡ QUICK START - Database Setup (2 Minutes)

## ✅ You've Upgraded Supabase - Ready to Go!

Your Supabase egress limit issue is now fixed. Let's set up the database in 2 simple steps.

---

## 🚀 Step 1: Create All Tables (1 minute)

### Open Supabase SQL Editor:
1. Go to: https://supabase.com/dashboard
2. Select your BlueHand Canvas project
3. Click **"SQL Editor"** (left sidebar)
4. Click **"+ New Query"**

### Copy & Run This File:
📄 Open: **`/supabase-setup/00-RUN-ALL-AT-ONCE.sql`**

1. Copy the ENTIRE file content
2. Paste into Supabase SQL Editor
3. Click **"Run"** (or Ctrl/Cmd + Enter)
4. Wait ~5 seconds for completion

✅ **Expected Result:** "Success. 12 rows" (or similar)

---

## 🔑 Step 2: Create Admin User (30 seconds)

### In the SAME SQL Editor:

1. Click **"+ New Query"** again
2. Open: **`/supabase-setup/99-CREATE-ADMIN-USER.sql`**
3. Copy and paste the content
4. Click **"Run"**

✅ **Expected Result:** "Success. 1 row"

---

## 🎉 Step 3: Login & Verify (30 seconds)

### Login to Admin:
- **URL:** `/admin/login`
- **Username:** `admin`
- **Password:** `admin123`

### Check Database Status:
1. After login, click **"Database Check"** button (amber/yellow button at bottom of sidebar)
2. Should show **12/12 tables** with green checkmarks ✅

---

## ⚙️ Step 4: Configure Application (5 minutes)

### A. Add Canvas Sizes (REQUIRED)
1. Go to **Admin → Dimensiuni**
2. Click **"Adaugă Dimensiune Nouă"**
3. Add your sizes with prices

**Example sizes:**
- 30 x 40 cm → 150 RON
- 40 x 60 cm → 200 RON
- 50 x 70 cm → 250 RON
- 60 x 80 cm → 300 RON
- 70 x 100 cm → 400 RON

### B. Configure Unsplash (REQUIRED)
1. Go to **Admin → Unsplash**
2. Get free API key: https://unsplash.com/developers
3. Add Access Key
4. Search and select **24 curated images** for your gallery

### C. Add Hero Slides (Optional)
1. Go to **Admin → Hero Slides**
2. Add homepage slider images

### D. Configure Cloudinary (Optional - Recommended for Production)
1. Go to **Admin → Settings → Cloudinary**
2. Sign up free: https://cloudinary.com
3. Add Cloud Name and Upload Preset
4. Saves 90%+ Supabase bandwidth!

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Database Check shows 12/12 tables ✅
- [ ] Can login to admin panel ✅
- [ ] Sizes added in Dimensiuni ✅
- [ ] Unsplash configured with 24 images ✅
- [ ] Homepage loads without errors ✅
- [ ] "Printuri si Canvas" page shows Unsplash images ✅
- [ ] Personalized Canvas configurator works ✅

---

## 🎯 What You Get

### Frontend (Public):
- ✅ **Homepage** with hero slider
- ✅ **Printuri si Canvas** with 24 Unsplash curated images
- ✅ **Personalized Canvas** configurator (user uploads)
- ✅ **Blog** system
- ✅ **Cart + Checkout** with Netopia payments
- ✅ **Responsive** design (desktop + mobile)

### Admin CMS (Password Protected):
- ✅ **Dashboard** - Overview & stats
- ✅ **Orders** - Order management with status tracking
- ✅ **Clients** - Customer database
- ✅ **Hero Slides** - Homepage slider management
- ✅ **Blog Posts** - Content management system
- ✅ **Unsplash** - Gallery curation (24 images)
- ✅ **Sizes** - Canvas size & price management
- ✅ **Settings** - Categories, Email, Netopia, Cloudinary, Users
- ✅ **Database Check** - Live diagnostic tool

---

## 📊 Database Tables Created

| # | Table | Purpose | Rows After Setup |
|---|-------|---------|------------------|
| 1 | hero_slides | Homepage slider | 0 (add via admin) |
| 2 | blog_posts | Blog articles | 0 (add via admin) |
| 3 | categories | Product categories | 8 (pre-populated) |
| 4 | subcategories | Style tags | 8 (pre-populated) |
| 5 | sizes | Canvas sizes + prices | 0 (add via admin) |
| 6 | frame_types | Frame options | 4 (pre-populated) |
| 7 | admin_users | CMS login users | 1 (admin user) |
| 8 | unsplash_settings | Unsplash config | 1 (empty settings) |
| 9 | unsplash_searches | Search tracking | 0 (auto-fills) |
| 10 | orders | Customer orders | 0 (auto-fills) |
| 11 | clients | Customer data | 0 (auto-fills) |
| 12 | paintings | Product catalog | 0 (not used) |

---

## 🚨 Troubleshooting

### ❌ Still getting timeout?
- Clear your browser cache
- Try incognito/private window
- Restart Supabase project (Settings → General → Pause → Resume)

### ❌ "relation already exists"
- Tables were already created! Skip to Step 2 (create admin user)

### ❌ Can't login?
- Verify username is exactly: `admin` (lowercase)
- Verify password is exactly: `admin123`
- Check admin user exists: `SELECT * FROM admin_users;`

### ❌ Images don't show?
- Configure Unsplash in Admin → Unsplash
- Select 24 curated images
- Check Unsplash API key is correct

---

## 🎉 Done!

Total time: **~10 minutes**

Once you see green checkmarks in Database Check, you're ready to use the full application!

**Next:** Configure Unsplash and start adding content via the admin panel.
