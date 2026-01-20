# 🔧 Supabase Setup Instructions

## ⚠️ The Error You're Seeing

```
Error fetching paintings: statement timeout
```

**This means:** The `paintings` table doesn't exist in Supabase yet!

---

## ✅ FIX: Run the Setup Script

### **Step 1: Open Supabase Dashboard**

👉 https://supabase.com/dashboard/project/uarntnjpoikeoigyatao

---

### **Step 2: Go to SQL Editor**

1. Click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**

---

### **Step 3: Copy and Paste**

1. Open the file `/supabase_setup.sql` in this project
2. **Copy ALL the SQL code** (2000+ lines)
3. **Paste** into the Supabase SQL Editor

---

### **Step 4: Run the Script**

1. Click **"Run"** button (or press `Cmd+Enter` / `Ctrl+Enter`)
2. Wait 5-10 seconds
3. You should see: ✅ **"Success. No rows returned"**

---

### **Step 5: Verify Tables Were Created**

1. Click **"Table Editor"** in the left sidebar
2. You should now see these tables:
   - ✅ `paintings`
   - ✅ `categories`
   - ✅ `subcategories`
   - ✅ `canvas_sizes`
   - ✅ `frame_types`
   - ✅ `orders`
   - ✅ `clients`
   - ✅ `admin_users`
   - ✅ `hero_slides`
   - ✅ `blog_posts`

---

### **Step 6: Check Sample Data**

1. Click on **`paintings`** table
2. You should see **1 sample painting** (Peisaj Montan)
3. Click on **`admin_users`** table
4. You should see **1 admin user**:
   - Username: `admin`
   - Password: `admin123`

---

### **Step 7: Refresh Your App**

1. Go back to **Figma Make**
2. **Refresh** the preview
3. The error should be **GONE**!
4. You should see the sample painting

---

## 🎉 What the Script Does

### ✅ Creates All Tables:
- **Paintings** - Product catalog
- **Categories** - Product categories
- **Subcategories** - Product subcategories
- **Canvas Sizes** - Available sizes with pricing
- **Frame Types** - Frame options
- **Orders** - Customer orders
- **Clients** - Customer database
- **Admin Users** - CMS login users
- **Hero Slides** - Homepage carousel
- **Blog Posts** - Blog articles

### ✅ Disables Row Level Security (RLS):
- Allows public access during development
- In production, you'll want to enable RLS

### ✅ Adds Sample Data:
- 1 sample painting
- 5 categories (Peisaje, Abstract, Animale, Natura, Urban)
- 5 frame types (Fara Rama, Rama Neagra, etc.)
- 4 canvas sizes (30x40, 40x60, 50x70, 60x90)
- 1 admin user (username: `admin`, password: `admin123`)

---

## 🚨 Troubleshooting

### If you see "permission denied" error:
1. Make sure you're logged into Supabase
2. Make sure you're in the correct project (uarntnjpoikeoigyatao)
3. Try running the script again

### If you see "relation already exists":
✅ **This is OK!** It means the tables were already created.
Just continue to the next step.

### If the app still shows errors:
1. Check browser console for error messages
2. Go to Supabase → Table Editor
3. Make sure `paintings` table has at least 1 row
4. Make sure RLS is disabled (check table settings)

---

## 🔐 Important Notes

### ⚠️ RLS is Disabled:
The setup script **disables Row Level Security** to make development easier.

**In production**, you should:
1. Enable RLS
2. Create policies for public read access
3. Create policies for admin write access

### 🔑 Default Admin Password:
The default admin password is `admin123`.

**Change this** when you deploy to production!

---

## 📊 Next Steps

After running the setup:

1. ✅ **Login to Admin Panel**
   - Go to `/admin/login`
   - Username: `admin`
   - Password: `admin123`

2. ✅ **Add More Paintings**
   - Go to Admin → Paintings
   - Click "Add Painting"
   - Use Unsplash URLs for images

3. ✅ **Customize Categories**
   - Go to Admin → Categories
   - Add your own categories

4. ✅ **Configure Sizes & Frames**
   - Go to Admin → Settings → Sizes
   - Go to Admin → Settings → Frames
   - Adjust pricing

---

## 🎯 Quick Reference

### Supabase Dashboard:
👉 https://supabase.com/dashboard/project/uarntnjpoikeoigyatao

### Default Admin Login:
- **Username**: `admin`
- **Password**: `admin123`

### SQL Setup File:
- **Location**: `/supabase_setup.sql`
- **Size**: ~300 lines
- **Run in**: SQL Editor

---

## ✨ You're All Set!

Once you run the setup script, your app will work perfectly in Figma Make! 🚀

**Questions?** Check the error in browser console and verify tables exist in Supabase Dashboard.
