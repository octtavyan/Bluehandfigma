# 🚀 BlueHand Canvas - Deployment Guide

## 📋 Overview

This app supports **TWO MODES**:

1. **Development Mode** (Current): Uses Supabase → Easy debugging in Figma Make
2. **Production Mode** (Future): Uses bluehand.ro MySQL → Your own server

---

## 🛠️ Current Setup: DEVELOPMENT MODE (Supabase)

**Status**: ✅ ACTIVE

### What's Connected:
- Frontend: Figma Make React app
- Backend: Supabase (Project ID: `uarntnjpoikeoigyatao`)
- Database: Supabase Postgres
- File: `/lib/supabaseDataService.ts`

### Benefits:
- ✅ No server configuration needed
- ✅ Instant updates in Figma Make
- ✅ Easy debugging with Supabase Dashboard
- ✅ Real-time data sync
- ✅ Built-in authentication

### How It Works:
- `AdminContext.tsx` imports from `supabaseDataService.ts`
- All data stored in Supabase tables
- Supabase handles CORS, auth, and API automatically

---

## 🏭 Future Setup: PRODUCTION MODE (MySQL)

**Status**: ⏳ PLANNED (When ready to deploy to bluehand.ro)

### What Will Change:
- Frontend: Same React app deployed to `https://bluehand.ro`
- Backend: Custom PHP files at `https://bluehand.ro/api/`
- Database: Your MySQL database at `bluehand.ro`
- File: `/lib/phpDataService.ts` (already created)

### Migration Steps (LATER):

#### Step 1: Export Data from Supabase
```sql
-- Export from Supabase dashboard:
- paintings table → CSV
- orders table → CSV
- clients table → CSV
- admin_users table → CSV
- canvas_sizes table → CSV
- frame_types table → CSV
- categories table → CSV
- subcategories table → CSV
```

#### Step 2: Import to MySQL
```sql
-- Import CSVs into your MySQL database
-- Use phpMyAdmin or command line
```

#### Step 3: Switch Code to PHP Backend
```typescript
// In /context/AdminContext.tsx, change:
import { ... } from '../lib/supabaseDataService';
// To:
import { ... } from '../lib/phpDataService';
```

#### Step 4: Upload PHP Files to Server
Upload these files to `/public_html/api/`:
- `db.php` (database config)
- `index.php` (API router)
- `paintings.php`
- `orders.php`
- `auth.php`
- `sizes.php`
- `frame-types.php`
- `.htaccess` (CORS config)

#### Step 5: Update Database Credentials
In `db.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'bluehand_canvas');
define('DB_USER', 'bluehand_user');
define('DB_PASS', 'YOUR_PASSWORD'); // ⚠️ Update this!
```

---

## 📊 Data Structure

Both modes use the same data structure:

### Tables/Collections:
- `paintings` - Canvas art products
- `orders` - Customer orders
- `clients` - Customer information
- `admin_users` - Admin panel users
- `canvas_sizes` - Available canvas sizes with pricing
- `frame_types` - Frame options
- `categories` - Product categories
- `subcategories` - Product subcategories
- `hero_slides` - Homepage carousel slides
- `blog_posts` - Blog articles

---

## 🔄 Switching Between Modes

### Currently in Development Mode:
```typescript
// /context/AdminContext.tsx (Line 14)
import { ... } from '../lib/supabaseDataService'; // ✅ ACTIVE
```

### To Switch to Production Mode:
```typescript
// /context/AdminContext.tsx (Line 14)
import { ... } from '../lib/phpDataService'; // Switch to this
```

**That's it!** One line change switches the entire backend.

---

## 🎯 When To Switch?

**Stay in Development Mode (Supabase) while:**
- Building features in Figma Make
- Testing functionality
- Making design changes
- Iterating quickly

**Switch to Production Mode (MySQL) when:**
- Ready to launch publicly
- Need full control over server
- Want to avoid Supabase costs
- Have finalized the app

---

## 📝 Current Status

- **Development**: ✅ Supabase connected and working
- **Production Files**: ✅ PHP backend code ready (in `/lib/phpDataService.ts`)
- **Migration Script**: ⏳ Not yet needed
- **Live Deployment**: ⏳ Not yet deployed

---

## 🆘 Support

If you need help switching modes or deploying:
1. Check this guide first
2. Review `/lib/supabaseDataService.ts` (current)
3. Review `/lib/phpDataService.ts` (future)
4. Test in development before switching to production

---

**Last Updated**: January 2026  
**Mode**: Development (Supabase)  
**Next Step**: Continue building in Figma Make with Supabase
