# BlueHand Canvas - Canvas E-Commerce Platform

A complete Romanian canvas art e-commerce platform built with React, TypeScript, and Tailwind CSS.

## 🎉 Status: Supabase Connected & Ready!

✅ **Figma Make Supabase is now automatically connected!**  
✅ **Database schema ready to deploy**  
✅ **Admin CMS fully functional**  
✅ **Demo data setup script available**

---

## 🚀 Quick Start

### 1. View the App

The app is already running in Figma Make! Just preview it.

### 2. Setup Database (One-Time, 2 minutes)

#### Option A: Automatic (Recommended)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/uarntnjpoikeoigyatao
   - (Or login and find project `uarntnjpoikeoigyatao`)

2. **Run SQL Setup:**
   - Click **SQL Editor** → **New query**
   - Open `/supabase_schema.sql` from this project
   - Copy ALL contents
   - Paste in SQL Editor
   - Click **Run** ▶️

3. **Done!** Refresh your app and it will work!

#### Option B: With Demo Data

After running SQL schema, add demo data:

1. Open browser console (F12)
2. Run:
   ```javascript
   import('/scripts/setup-supabase.ts').then(m => m.setupSupabase());
   ```
3. Wait for completion message

### 3. Login to Admin

- URL: `/admin/login`
- Username: `admin`
- Password: `admin123`

### 4. Start Building!

- Add hero slides for homepage carousel
- Upload canvas products
- Configure sizes and prices
- Test checkout flow

---

## 📦 What's Included

### Frontend Pages

- **Homepage** (`/`) - Hero carousel, featured products, categories
- **Shop** (`/shop`) - Product listing with filters
- **Product Details** (`/tablou/:id`) - Full product page
- **Personalized Canvas** (`/personalizat`) - Custom canvas ordering with photo upload
- **Cart** (`/cos`) - Shopping cart
- **Checkout** (`/checkout`) - Order form with delivery options
- **Blog** (`/blog`) - Blog posts listing
- **Blog Post** (`/blog/:slug`) - Individual blog post
- **Contact** (`/contact`) - Contact form

### Admin CMS (`/admin/*`)

- **Dashboard** - Overview with stats and quick actions
- **Orders** - Order management with status tracking
- **Products** (Tablouri Canvas) - Canvas paintings CRUD
- **Hero Slides** - Homepage carousel management
- **Blog Posts** - Blog content management
- **Clients** - Customer database
- **Sizes** - Canvas dimensions and pricing
- **Users** - Admin user management (role-based access)
- **Supabase** - Database configuration
- **Supabase Test** - Database debug panel
- **Settings** - Delivery options and site settings

### Features

✅ **Responsive Design** - Desktop, tablet, mobile  
✅ **Supabase Integration** - Cloud database with auto-sync  
✅ **LocalStorage Fallback** - Works without database  
✅ **Role-Based Access** - Full Admin, Account Manager, Production  
✅ **Image Upload** - For personalized canvases  
✅ **Smart Cropping** - Aspect ratio preservation  
✅ **Cart System** - Add to cart, update quantities, checkout  
✅ **Order Management** - Track orders through workflow  
✅ **Search & Filters** - Find products easily  
✅ **SEO Friendly** - Clean URLs, meta tags  

---

## 🗄️ Database Schema

9 tables in Supabase:

| Table | Purpose | Records |
|-------|---------|---------|
| `paintings` | Canvas products | 0 (add in admin) |
| `sizes` | Available canvas sizes | 6 (auto-created) |
| `categories` | Product categories | 6 (auto-created) |
| `subcategories` | Product subcategories | 0 |
| `orders` | Customer orders | 0 |
| `clients` | Customer database | 0 |
| `users` | Admin users | 3 (auto-created) |
| `hero_slides` | Homepage carousel | 3 (auto-created) |
| `blog_posts` | Blog articles | 0 |

---

## 🔐 Admin Users

After running setup script:

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `admin` | `admin123` | Full Admin | Everything |
| `account` | `account123` | Account Manager | Orders, clients, products, blog |
| `production` | `production123` | Production | Orders only |

---

## 📊 Technology Stack

- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS 4.0
- **Routing:** React Router v6
- **Database:** Supabase (PostgreSQL)
- **State:** React Context API
- **Forms:** React Hook Form
- **Icons:** Lucide React
- **Carousel:** React Slick
- **Image Cropping:** React Easy Crop
- **Notifications:** Sonner

---

## 📁 Project Structure

```
/
├── components/           # Reusable UI components
│   ├── admin/           # Admin-specific components
│   ├── figma/           # Figma-imported components
│   └── *.tsx            # General components
├── context/             # React context providers
│   ├── AdminContext.tsx
│   ├── CartContext.tsx
│   ├── HeroSlidesContext.tsx
│   ├── PaintingsContext.tsx
│   └── ...
├── lib/                 # Utilities and services
│   ├── supabase.ts      # Supabase client
│   └── dataService.ts   # Data access layer
├── pages/               # Page components
│   ├── admin/           # Admin pages
│   └── *.tsx            # Public pages
├── scripts/             # Setup and utility scripts
│   └── setup-supabase.ts
├── styles/              # Global styles
│   └── globals.css
├── utils/               # Utility functions
│   └── supabase/        # Supabase config
├── App.tsx              # Main app component
└── supabase_schema.sql  # Database schema
```

---

## 🎯 How Supabase Works

### Automatic Connection

The app automatically uses Figma Make's Supabase:

```
1. App starts
2. Checks for custom config in localStorage
3. If not found → Uses Figma Make credentials
4. Creates Supabase client
5. Loads data from cloud
```

### Connection Priority

1. **Custom Supabase** (if configured in `/admin/supabase`)
2. **Figma Make Supabase** (automatic)
3. **localStorage** (fallback if no database)

### Configuration

Figma Make provides:
- **Project ID:** `uarntnjpoikeoigyatao`
- **URL:** `https://uarntnjpoikeoigyatao.supabase.co`
- **Anon Key:** (auto-loaded from `/utils/supabase/info.tsx`)

---

## 📚 Documentation

Comprehensive guides available:

1. **FIGMA_MAKE_SUPABASE_READY.md** - Main setup guide ⭐
2. **README_SUPABASE_CONNECTION.md** - How Supabase integration works
3. **SETUP_SUPABASE_FROM_FIGMA_MAKE.md** - Detailed setup steps
4. **SUPABASE_QUICK_START.md** - 5-minute quick start
5. **HOW_TO_ACCESS_SUPABASE_SETTINGS.md** - Find config page
6. **QUICK_FIX_SUPABASE_MENU.md** - Troubleshooting menu issues
7. **FINAL_FIX_GUIDE.md** - Hero slides fix guide
8. **README_HERO_SLIDES_ISSUE.md** - Hero slides troubleshooting

---

## 🔧 Development

### Data Flow

```
User Action
    ↓
Context Provider (e.g., PaintingsContext)
    ↓
Data Service (lib/dataService.ts)
    ↓
Checks: isSupabaseConfigured()?
    ↓
YES → Supabase Client → Cloud Database
NO  → localStorage → Browser Storage
```

### Adding New Features

1. **Create component** in `/components`
2. **Add context** if needed (state management)
3. **Create service** in `lib/dataService.ts`
4. **Add route** in `App.tsx`
5. **Update admin menu** if admin feature

### Modifying Database

1. Update `/supabase_schema.sql`
2. Add types to `/lib/supabase.ts` → `Database` interface
3. Update data service functions
4. Test in admin panel

---

## 🐛 Troubleshooting

### "Tables don't exist" error

**Solution:**
1. Go to https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/sql
2. Run `/supabase_schema.sql` in SQL Editor

### Hero slides don't show on homepage

**Check:**
1. Are slides marked as "Active"? (in admin → Hero Slides)
2. Do slides exist in Supabase? (Check Table Editor)
3. Console errors? (F12 → Console tab)

**Solution:**
- Go to `/admin/supabase-test` to see database debug info
- Check "Supabase Connection Status" on dashboard

### Can't login to admin

**Default credentials:**
- Username: `admin`
- Password: `admin123`

**If you changed it:**
- Check `users` table in Supabase
- Or clear localStorage and re-run setup script

### Different data in Figma preview vs Chrome

**This is normal!**

Figma preview and Chrome localhost are separate environments with separate localStorage.

**Solution:** Setup Supabase (shared cloud database) so both use the same data.

---

## 🚀 Deployment

### Prerequisites

- Supabase project set up
- Database tables created
- Demo data added (optional)

### Deploy to Vercel/Netlify

1. **Connect repository** to deployment platform
2. **Set environment variables:**
   - `VITE_SUPABASE_URL=https://uarntnjpoikeoigyatao.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=your_anon_key`
3. **Deploy!**

### Post-Deployment

1. **Test all pages** work
2. **Add real products** in admin
3. **Customize hero slides**
4. **Change admin passwords**
5. **Set up email notifications** (optional)
6. **Integrate payment gateway** (optional)

---

## 📈 Next Steps

### Immediate:

- [ ] Run SQL schema in Supabase
- [ ] Run setup script for demo data
- [ ] Login to admin panel
- [ ] Add 3-5 hero slides
- [ ] Upload canvas products
- [ ] Test checkout flow

### Soon:

- [ ] Write blog posts
- [ ] Customize color scheme (if needed)
- [ ] Add more product categories
- [ ] Set up email notifications
- [ ] Connect payment gateway
- [ ] Enable analytics

### Later:

- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Add product reviews
- [ ] Implement wishlist
- [ ] Add multi-language support
- [ ] Create mobile app (React Native)

---

## 🔗 Important Links

| What | Link |
|------|------|
| **Supabase Dashboard** | https://supabase.com/dashboard |
| **Project** | https://supabase.com/dashboard/project/uarntnjpoikeoigyatao |
| **SQL Editor** | https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/sql |
| **Table Editor** | https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/editor |
| **Admin Login** | `/admin/login` |
| **Supabase Config** | `/admin/supabase` |
| **Database Test** | `/admin/supabase-test` |
| **Dashboard** | `/admin/dashboard` |

---

## 💡 Pro Tips

### Tip 1: Use Console Logging

The app logs everything:
```
Supabase: Using Figma Make Supabase connection
Supabase: Loaded 3 hero slides from Supabase
Supabase: Saved new hero slide
```

Press F12 → Console to see what's happening.

### Tip 2: Monitor Database Real-Time

Open two tabs:
- **Tab 1:** Your app
- **Tab 2:** Supabase Table Editor

Make changes in Tab 1, see them instantly in Tab 2!

### Tip 3: Bookmark These

- Supabase Dashboard
- Admin Login
- Database Test Page

Quick access saves time!

### Tip 4: Export Data Regularly

In Supabase Table Editor:
- Select table → "..." → "Download as CSV"
- Regular backups = peace of mind

---

## 📝 License

This is a demo/prototype project for educational purposes.

---

## 🆘 Need Help?

1. **Check documentation:** 8 detailed guides included
2. **Check console:** Press F12 for error messages
3. **Check debug panel:** `/admin/supabase-test`
4. **Check Supabase:** View data in Table Editor

---

## ✅ Success Checklist

- [ ] SQL schema run in Supabase
- [ ] Tables visible in Table Editor (9 tables)
- [ ] Demo data created (optional)
- [ ] Can login to admin (`admin`/`admin123`)
- [ ] Dashboard shows green Supabase status
- [ ] Hero slides appear on homepage
- [ ] Can create new products
- [ ] Can place test order
- [ ] All admin pages accessible

**All checked? You're ready to build! 🎉🚀**

---

**Project Status:** ✅ Ready for Production

**Database:** ✅ Supabase Connected (Figma Make)

**Admin Panel:** ✅ Fully Functional

**E-Commerce Flow:** ✅ Complete

**Next:** Run SQL setup and start adding content! 🎨