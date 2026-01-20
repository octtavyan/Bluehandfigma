# ⚡ QUICK FIX - Setup Supabase Database

## 🚨 The Problem

```
Error fetching paintings: statement timeout
```

## ✅ The Solution (3 Steps)

---

### **STEP 1: Open Supabase SQL Editor**

1. Go to: **https://supabase.com/dashboard/project/uarntnjpoikeoigyatao**
2. Login to Supabase
3. Click **"SQL Editor"** in left sidebar
4. Click **"+ New query"** button

---

### **STEP 2: Copy & Paste SQL**

1. Open file: **`/supabase_setup.sql`** in this project
2. **Select ALL** the SQL code (Cmd+A / Ctrl+A)
3. **Copy** it (Cmd+C / Ctrl+C)
4. **Paste** into Supabase SQL Editor

---

### **STEP 3: Run the Script**

1. Click **"Run"** button (bottom right corner)
2. Wait 5-10 seconds
3. You should see: ✅ **"Success. No rows returned"**

---

## 🎉 Done! Now Refresh Your App

Your app should now work perfectly!

---

## ✅ What You Just Created:

- **10 database tables** (paintings, orders, etc.)
- **Sample data** (1 painting, categories, sizes, frames)
- **Admin user** (username: `admin`, password: `admin123`)

---

## 📊 Verify It Worked:

1. Click **"Table Editor"** in Supabase sidebar
2. You should see all these tables:
   - ✅ paintings
   - ✅ categories  
   - ✅ canvas_sizes
   - ✅ frame_types
   - ✅ orders
   - ✅ clients
   - ✅ admin_users
   - ✅ hero_slides
   - ✅ blog_posts
   - ✅ subcategories

3. Click **"paintings"** table
4. You should see **1 row** (Peisaj Montan)

---

## 🎯 Next: Test Your App

1. **Refresh** Figma Make preview
2. Error should be gone!
3. You should see the sample painting

---

## 🔐 Login to Admin Panel

- **URL**: Go to `/admin/login` in your app
- **Username**: `admin`
- **Password**: `admin123`

---

## ❓ Still Having Issues?

Check browser console for detailed error messages with helpful tips!

The app now shows:
- ✅ What's loading
- ✅ How many items fetched
- ✅ Helpful tips if tables missing

---

**That's it! Just run the SQL script and you're done!** 🚀
