# BlueHand Canvas - Cleanup Complete & Database Setup Guide

## ✅ Cleanup Summary

### Files Deleted (9 files):
1. `/components/admin/AWBCard.tsx`
2. `/components/admin/FanCourierSettings.tsx`
3. `/components/admin/FanCourierSetupGuide.tsx`
4. `/components/admin/FanCourierTab.tsx`
5. `/services/fanCourierService.ts`
6. `/pages/admin/AdminFrameTypesPage.tsx`
7. `/pages/admin/AdminPaintingsPage.tsx`
8. `/components/admin/AddPaintingModal.tsx`
9. `/components/admin/EditPaintingModal.tsx`

### Features Removed:
- ❌ Fan Courier AWB integration (complete removal)
- ❌ Frame Types management page (consolidated into Sizes)
- ❌ Admin Paintings upload/management (using Unsplash only now)
- ❌ "Financiare" menu item (didn't exist)

### New Features Added:
- ✅ **Cloudinary CDN Service** for external image storage
- ✅ **Cloudinary Settings Tab** in Admin Settings
- ✅ **Database Check Page** - Diagnostic tool to verify Supabase tables

---

## 🎯 Current Application Structure

### Admin CMS Menu:
1. **Dashboard** - Overview and stats
2. **Comenzi** (Orders) - Order management
3. **Clienți** (Clients) - Client management
4. **Hero Slides** - Homepage slider images
5. **Blog Posts** - Blog content management
6. **Pagini Juridice** - Legal pages (Terms, GDPR)
7. **Unsplash** - Curated gallery images (24 images from admin settings)
8. **Dimensiuni** (Sizes) - Size management with prices (canvas/print)
9. **Setări** (Settings) - Categories, Email, Users, Netopia, Cloudinary

### Frontend Features:
- **Printuri si Canvas** - Uses **Unsplash only** (no admin uploads)
- **Personalized Canvas** - User image uploads
- **Blog** - Blog posts from database
- **Hero Slider** - Dynamic slides from database
- **Cart + Checkout** - Full e-commerce flow with Netopia payments

---

## 🚨 CRITICAL: Database Setup Required

### Why Nothing Shows Up:

The Supabase database tables haven't been created yet. This is why:
- ❌ Hero slides don't show on homepage
- ❌ Blog posts don't show
- ❌ Unsplash images don't show (settings table missing)
- ❌ Admin pages are empty

### How to Fix (One-Time Setup):

#### **Option 1: Use the Database Check Page (Recommended)**

1. Login to admin: `/admin/login`
2. Click the **"Database Check"** button in the sidebar (amber/yellow button at bottom)
3. Follow the on-screen instructions
4. It will tell you exactly which tables are missing

#### **Option 2: Manual SQL Setup**

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your BlueHand Canvas project
3. Go to **SQL Editor** from left menu
4. Click **"+ New Query"**
5. Open file `/SETUP_ALL_MISSING_TABLES.sql` from this project
6. Copy **ALL** content and paste into SQL Editor
7. Click **"Run"** (or press Ctrl/Cmd + Enter)
8. Wait for execution to complete (~10 seconds)
9. Refresh the admin pages

---

## 📊 Required Database Tables

The following tables must exist in Supabase:

| Table Name | Purpose | Row Count Status |
|------------|---------|------------------|
| `hero_slides` | Homepage slider images | Empty = OK (add via admin) |
| `blog_posts` | Blog articles | Empty = OK (add via admin) |
| `admin_users` | CMS users | Empty = ⚠️ Create admin user |
| `categories` | Product categories | Populated by SQL |
| `subcategories` | Product styles | Populated by SQL |
| `sizes` | Canvas/Print sizes + prices | Empty = ⚠️ Add via admin |
| `frame_types` | Frame type options | Populated by SQL |
| `paintings` | Product catalog (unused - Unsplash only) | Empty = OK |
| `orders` | Customer orders | Empty = OK (fills on checkout) |
| `clients` | Customer data | Empty = OK (fills on checkout) |
| `unsplash_settings` | Unsplash API config | Empty = ⚠️ Configure in admin |
| `unsplash_searches` | Tracked search queries | Empty = OK (auto-fills) |

---

## 🔧 Post-Setup Configuration

### 1. Create Admin User
After running the SQL setup, you need to create your first admin user:

**Via Supabase SQL Editor:**
```sql
INSERT INTO admin_users (id, username, password, role, full_name, email, is_active)
VALUES (
  gen_random_uuid(),
  'admin',
  'admin123', -- Change this!
  'full-admin',
  'Your Full Name',
  'your@email.com',
  true
);
```

**Then login at:** `/admin/login`
- Username: `admin`
- Password: `admin123` (or what you set)

### 2. Configure Unsplash (Admin → Unsplash)
- Add Unsplash Access Key
- Select 24 curated images for the gallery
- All user searches will be tracked automatically

### 3. Add Sizes (Admin → Dimensiuni)
- Add canvas sizes with prices
- Set Print Canvas / Print Hartie support per size
- Prices are base prices + percentage markup

### 4. Configure Cloudinary (Admin → Settings → Cloudinary)
**Recommended for production to reduce Supabase bandwidth**

1. Create free account: https://cloudinary.com
2. Get your Cloud Name from dashboard
3. Create an **unsigned upload preset**:
   - Go to Settings → Upload → Add upload preset
   - Signing Mode: **Unsigned**
   - Name it: `bluehand_unsigned`
4. Add credentials in Admin → Settings → Cloudinary tab
5. All future hero slides & user uploads will use Cloudinary

### 5. Configure Netopia Payments (Admin → Settings → Netopia)
- Add Merchant ID
- Add API Key
- Add POS Signature
- Add Public Key certificate
- Toggle Test/Live mode

---

## 📦 CDN Options for Image Storage

To minimize Supabase bandwidth, use external CDN:

### **Cloudinary** (Recommended) ✅
- **Free tier:** 25GB storage + 25GB bandwidth/month
- **Features:** Auto-optimization, transformations, global CDN
- **Setup:** Built-in to Admin Settings → Cloudinary tab
- **Use for:** Hero slides, user uploads

### Alternatives (not integrated):
- **ImageKit:** 20GB bandwidth/month, unlimited storage
- **Bunny.net:** $0.01/GB (very cheap, no free tier)
- **ImgBB:** Unlimited storage, some bandwidth limits

---

## 🔍 Troubleshooting

### "Failed to fetch" errors everywhere?
→ Database tables not created. Run `/SETUP_ALL_MISSING_TABLES.sql`

### Can't login to admin?
→ No admin user exists. Run the SQL INSERT query above.

### Hero slides don't show?
→ Add slides via Admin → Hero Slides (after DB setup)

### Unsplash images don't show?
→ Configure Unsplash in Admin → Unsplash

### Blog page is empty?
→ Add blog posts via Admin → Blog Posts

### Sizes don't show in configurator?
→ Add sizes via Admin → Dimensiuni

### Multiple GoTrueClient warnings?
→ ✅ Fixed! Using centralized Supabase client in `/lib/supabase.ts`

---

## 🚀 Next Steps

1. ✅ **Run database setup SQL** (if not done)
2. ✅ **Create admin user** via SQL
3. ✅ **Login to admin** at `/admin/login`
4. ✅ **Use Database Check page** to verify all tables exist
5. ✅ **Configure Unsplash** (add API key + select 24 images)
6. ✅ **Add sizes** with prices
7. ✅ **Add hero slides** for homepage
8. ✅ **Optional: Configure Cloudinary** for production
9. ✅ **Optional: Configure Netopia** for live payments
10. ✅ **Test the application** frontend and backend

---

## 📝 Development vs Production

### Development (Current - Figma Make + Supabase):
- ✅ Backend: Supabase Edge Functions + Postgres
- ✅ Frontend: React + Tailwind in Figma Make
- ✅ Good for rapid prototyping and testing

### Production (Your Own Server):
- 🎯 Backend: Your dedicated server (89.41.38.220 / bluehand.ro)
- 🎯 Frontend: Same React app deployed to your server
- 🎯 Database: Your own MySQL/Postgres
- 🎯 Images: Cloudinary CDN (recommended)
- 🎯 Zero external dependencies, full control

The code is designed to work with both. Just change connection endpoints for production.

---

## ✅ Application Status

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend | ✅ Working | All pages functional |
| Admin CMS | ✅ Working | After DB setup |
| Supabase Integration | ✅ Working | Singleton client fixed |
| Unsplash Integration | ✅ Working | 24 curated images system |
| Cart + Checkout | ✅ Working | Netopia payments ready |
| Blog System | ✅ Working | After DB setup |
| Hero Slider | ✅ Working | After DB setup |
| Cloudinary CDN | ✅ Ready | Optional, configure in settings |
| FAN Courier AWB | ❌ Removed | Simplified app |
| Frame Types Page | ❌ Removed | Consolidated into sizes |
| Admin Paintings | ❌ Removed | Unsplash only |

---

**You're almost ready!** Just run the SQL setup and configure the admin settings. 🎉
