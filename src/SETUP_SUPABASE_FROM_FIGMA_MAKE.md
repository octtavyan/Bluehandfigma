# 🚀 Setup Supabase from Figma Make

## ✅ Step 1: Supabase is Now Connected!

Great news! Supabase is now connected to your Figma Make project. You can now set up your cloud database.

---

## 📋 Step 2: Create Your Supabase Project

### 2.1 Sign Up / Login

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign In"
3. Create an account (free tier is perfect for development)

### 2.2 Create a New Project

1. Click "New Project"
2. Fill in the details:
   - **Name:** `pepanza-ro` (or your choice)
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Choose **Europe (Central)** for best performance in Romania
   - **Pricing Plan:** Free (includes 500MB database, 1GB file storage, 2GB bandwidth)
3. Click "Create new project"
4. ⏰ Wait 2-3 minutes for setup to complete

---

## 🗄️ Step 3: Run the Database Schema

### 3.1 Copy the SQL Schema

1. In your Figma Make project, find the file **`supabase-schema.sql`** in the root directory
2. **Open it and copy ALL the contents** (Ctrl+A, Ctrl+C)

### 3.2 Run it in Supabase

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"** button
3. **Paste** the entire SQL schema
4. Click **"Run"** (or press Ctrl+Enter)
5. ✅ You should see "Success. No rows returned" - this is good!

### 3.3 Verify Tables Were Created

1. Click **"Table Editor"** in the left sidebar
2. You should see these tables:
   - ✅ `paintings`
   - ✅ `sizes`
   - ✅ `categories`
   - ✅ `subcategories`
   - ✅ `orders`
   - ✅ `clients`
   - ✅ `users`
   - ✅ `hero_slides` ⭐ (for homepage carousel)
   - ✅ `blog_posts` ⭐ (for blog)

If you see all 9 tables → **Perfect!** ✅

---

## 🔑 Step 4: Get Your API Credentials

### 4.1 Navigate to Settings

1. Click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"**

### 4.2 Copy Your Credentials

You'll need two things:

#### **Project URL:**
```
Example: https://abcdefghijklmnop.supabase.co
```
- Find it under **"Project URL"**
- Click the copy icon 📋

#### **Anon/Public Key:**
```
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Find it under **"Project API keys"** → **"anon public"**
- Click the copy icon 📋
- ⚠️ This key is LONG (300+ characters) - make sure you copy the whole thing!

---

## 🎯 Step 5: Connect Figma Make to Supabase

Now you'll enter these credentials in your app.

### Option A: Through the CMS (Recommended)

1. In Figma Make preview, navigate to:
   ```
   /admin/login
   ```

2. Login with:
   - **Username:** `admin`
   - **Password:** `admin123`

3. In the left sidebar, click **"Configurare Supabase"** (look for 💾 icon)

4. Fill in the form:
   - **Supabase Project URL:** Paste your URL
   - **Supabase Anon/Public Key:** Paste your anon key

5. Click **"Testează și Salvează Configurația"**

6. ✅ If successful, you'll see a green success message and the page will reload

7. ✨ Your app is now connected to Supabase cloud!

### Option B: Via Browser Console (Alternative)

If the CMS method doesn't work, you can set it directly:

1. Press **F12** to open browser console

2. Run this code (replace with your actual values):

```javascript
// Replace these with YOUR actual credentials
const url = 'https://YOUR-PROJECT.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_LONG_KEY';

// Save to localStorage
const config = { url, anonKey: key };
localStorage.setItem('supabase_config', JSON.stringify(config));

// Reload the app
window.location.reload();
```

3. Press Enter

4. Page will reload and connect to Supabase

---

## 🧪 Step 6: Verify Everything Works

### 6.1 Check Connection Status

1. Go to **Dashboard** (`/admin/dashboard`)

2. Look at the top panel: **"Supabase Connection Status"**

3. It should show:
   - ✅ **Status:** Connected (green)
   - ✅ **Hero Slides:** 0 slides found in database

### 6.2 Test Data Operations

1. Go to **"Hero Slides"** in the sidebar

2. Click **"Adaugă Slide Nou"**

3. Fill in the form:
   - **Titlu:** Test Slide
   - **Subtitlu:** This is a test
   - **Text Buton:** Learn More
   - **Link Buton:** /shop
   - **Imagine URL:** Any image URL

4. Click **"Salvează"**

5. ✅ Go back to **Dashboard** → Hero Slides count should now be **1**

6. 🎉 **If you see the count update → Supabase is working!**

### 6.3 Verify in Supabase Dashboard

1. Go back to [supabase.com](https://supabase.com)

2. Open your project

3. Click **"Table Editor"** → **"hero_slides"**

4. ✅ You should see your test slide in the table!

---

## 🎊 Success! What Now?

### Your app now has:

✅ **Cloud Database:** All data stored securely in Supabase  
✅ **Multi-Device:** Access from anywhere  
✅ **Real-time:** Changes sync instantly  
✅ **Scalable:** Supports thousands of products and orders  
✅ **Backed Up:** Supabase handles automatic backups  

### Next Steps:

1. **Add Default Data:**
   - Add some hero slides for the homepage carousel
   - Add canvas paintings to the shop
   - Add blog posts

2. **Customize Settings:**
   - Go to "Dimensiuni" to set up canvas sizes and prices
   - Go to "Setări" to configure delivery options

3. **Test the Full Flow:**
   - Visit the homepage → See hero slides
   - Visit `/shop` → See products
   - Order a personalized canvas
   - Check orders in admin panel

---

## 🐛 Troubleshooting

### Issue: "Failed to connect to Supabase"

**Possible causes:**

1. **SQL schema not run:**
   - Go to Supabase → SQL Editor
   - Run the entire `supabase-schema.sql` file
   - Check Table Editor to verify all tables exist

2. **Wrong credentials:**
   - Double-check your Project URL
   - Make sure you copied the ENTIRE anon key (it's very long!)
   - No extra spaces at the beginning/end

3. **Row Level Security blocking access:**
   - The schema includes policies with `USING (true)` which allows all access
   - If you changed these, you might need to adjust them

### Issue: "Tables don't exist"

**Solution:**

1. Go to Supabase → SQL Editor
2. Delete all existing tables if any:
   ```sql
   DROP TABLE IF EXISTS blog_posts CASCADE;
   DROP TABLE IF EXISTS hero_slides CASCADE;
   DROP TABLE IF EXISTS users CASCADE;
   DROP TABLE IF EXISTS clients CASCADE;
   DROP TABLE IF EXISTS orders CASCADE;
   DROP TABLE IF EXISTS subcategories CASCADE;
   DROP TABLE IF EXISTS categories CASCADE;
   DROP TABLE IF EXISTS sizes CASCADE;
   DROP TABLE IF EXISTS paintings CASCADE;
   ```
3. Run the complete `supabase-schema.sql` again

### Issue: "Hero slides still don't show on homepage"

**Check these:**

1. **Are slides marked as active?**
   - Go to Admin → Hero Slides
   - Make sure "Activ" checkbox is checked ✅

2. **Is Supabase actually connected?**
   - Dashboard should show green "Connected" status
   - Try disconnecting and reconnecting

3. **Browser cache:**
   - Hard refresh: Ctrl+Shift+R
   - Or clear browser cache

4. **Console errors:**
   - Press F12
   - Check Console tab for red errors
   - Look for "Supabase:" log messages

### Issue: "Different data in Figma vs Chrome"

**This is normal!**

Figma Make preview and Chrome localhost are **separate environments**.

They each have their own localStorage, which means:
- Separate Supabase connections
- Separate admin logins
- Separate carts

**Solution:** Connect to Supabase in BOTH environments using the same credentials.

Then they'll share the same cloud database! ☁️

---

## 📚 Additional Resources

### Supabase Docs:
- [Getting Started](https://supabase.com/docs/guides/getting-started)
- [Database](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Your Project Files:
- **Schema:** `/supabase-schema.sql`
- **Supabase Client:** `/lib/supabase.ts`
- **Config Page:** `/pages/admin/AdminSupabasePage.tsx`
- **Test Page:** `/pages/admin/AdminSupabaseTestPage.tsx`

### Debug Tools in Your App:
1. **Dashboard Status Panel:** Shows connection status
2. **Test Supabase Page:** Shows all data from all tables
3. **Console Logging:** Look for "Supabase:" messages

---

## 🎯 Quick Reference

| What | Where | Value |
|------|-------|-------|
| **Supabase Dashboard** | [supabase.com](https://supabase.com) | Your project |
| **Admin Login** | `/admin/login` | admin / admin123 |
| **Supabase Config** | `/admin/supabase` | Enter credentials |
| **Test Page** | `/admin/supabase-test` | View all data |
| **SQL Schema** | `/supabase-schema.sql` | Run in SQL Editor |

---

## ✅ Checklist

Copy this checklist to track your progress:

- [ ] Created Supabase account
- [ ] Created new project (Europe region)
- [ ] Copied Project URL
- [ ] Copied Anon Key
- [ ] Ran SQL schema in SQL Editor
- [ ] Verified all 9 tables exist
- [ ] Connected Figma Make to Supabase
- [ ] Saw green "Connected" status in dashboard
- [ ] Added a test hero slide
- [ ] Verified slide appears in Supabase table
- [ ] Saw slide on homepage carousel
- [ ] Tested creating a painting
- [ ] Tested placing an order

When all checkboxes are ✅ → **You're ready to build!** 🚀

---

**Need help?** Check the troubleshooting section above or inspect browser console for detailed error messages.
