# 🔧 Fix Supabase Table Errors

## The Problem

You're seeing these errors because the Supabase tables don't exist yet:
- `admin_users` table not found
- `canvas_sizes` table not found
- `categories` table not found (probably)
- `subcategories` table not found (probably)

## ✅ Quick Fix - 3 Simple Steps

### Step 1: Go to Supabase Dashboard
1. Open your browser
2. Go to https://supabase.com
3. Sign in to your account
4. Select your project

### Step 2: Open SQL Editor
1. Click **SQL Editor** in the left sidebar
2. Click **New Query** button

### Step 3: Run the Migration Script
1. Open the file `/SUPABASE_MIGRATION_FIX.sql` from your project
2. Copy ALL the content
3. Paste it into the SQL Editor
4. Click the **RUN** button (or press Ctrl+Enter / Cmd+Enter)

### Step 4: Verify Success
You should see output showing:
```
admin_users_count: 3
canvas_sizes_count: 17
categories_count: 6
subcategories_count: 24
```

If you see this, the migration was successful! ✅

### Step 5: Refresh Your App
1. Go back to your application
2. Refresh the page (F5 or Cmd+R)
3. The errors should be gone! ✅

---

## 🎉 What This Script Does

The `/SUPABASE_MIGRATION_FIX.sql` script will:

1. ✅ Drop any existing incomplete tables (if they exist)
2. ✅ Create the `admin_users` table
3. ✅ Create the `canvas_sizes` table
4. ✅ Create the `categories` table
5. ✅ Create the `subcategories` table
6. ✅ Set up proper indexes for performance
7. ✅ Enable Row Level Security (RLS)
8. ✅ Create security policies
9. ✅ Add auto-update timestamps
10. ✅ Insert default data:
    - 3 admin users (admin, account, production)
    - 17 canvas sizes
    - 6 categories
    - 24 subcategories

---

## 🔍 What to Expect After Running the Script

### Before (Errors):
```
❌ Supabase error for admin_users, falling back to localStorage
❌ Supabase error for canvas_sizes, falling back to localStorage
```

### After (Success):
```
✅ Data loaded from Supabase
✅ Hero slides loaded from Supabase
✅ Admin users loaded from Supabase
✅ Canvas sizes loaded from Supabase
✅ Categories loaded from Supabase
✅ Subcategories loaded from Supabase
```

---

## 🧪 How to Test

### Test 1: Check Admin Users
1. Log into admin panel (`/admin/login`)
2. Go to **Utilizatori**
3. You should see 3 default users:
   - admin (full-admin)
   - account (account-manager)
   - production (production)

### Test 2: Check Canvas Sizes
1. In admin panel, check for canvas sizes
2. You should see 17 different sizes
3. Example: 30×40 cm, 50×70 cm, etc.

### Test 3: Check Categories
1. In admin panel, check categories
2. You should see 6 categories:
   - Living
   - Dormitor
   - Sufragerie
   - Bucătărie
   - Birou
   - Baie

### Test 4: Add New Data
1. Try adding a new category
2. Refresh the page
3. ✅ It should persist!

---

## ❓ Troubleshooting

### Error: "permission denied for table admin_users"
**Solution**: The RLS policies might not have been created properly. Re-run the script.

### Error: "relation already exists"
**Solution**: The script has a `DROP TABLE IF EXISTS` at the beginning. Re-run it and it will clean up and recreate.

### Error: "could not connect to server"
**Solution**: Check your Supabase connection settings in the app.

### Still seeing localStorage fallback?
**Solution**: 
1. Check browser console for any errors
2. Verify Supabase URL and Key are correct
3. Make sure you're using the correct project
4. Try logging out and back in

---

## 🔐 Default Login Credentials

After running the script, you can log in with:

**Full Admin:**
- Username: `admin`
- Password: `admin123`

**Account Manager:**
- Username: `account`
- Password: `account123`

**Production:**
- Username: `production`
- Password: `production123`

⚠️ **IMPORTANT**: Change these passwords in production!

---

## 📊 Database Tables Created

| Table | Description | Default Records |
|-------|-------------|-----------------|
| `admin_users` | CMS user accounts | 3 users |
| `canvas_sizes` | Available canvas sizes | 17 sizes |
| `categories` | Product categories | 6 categories |
| `subcategories` | Product subcategories | 24 subcategories |

---

## 🎯 Next Steps After Fix

Once the errors are fixed:

1. ✅ All CMS data will persist in Supabase
2. ✅ You can work from multiple devices
3. ✅ Data won't be lost when clearing browser cache
4. ✅ Multiple admins can work simultaneously

---

## 💡 Pro Tip

After running the script, go to the Supabase dashboard and explore:

1. **Table Editor** - See all your data
2. **Authentication** - Manage users (future feature)
3. **Storage** - Upload images (future feature)
4. **API Docs** - Auto-generated API documentation

---

## 🆘 Still Having Issues?

If the errors persist:

1. Check the browser console for detailed error messages
2. Verify your Supabase URL and API key are correct
3. Make sure your Supabase project is active
4. Try creating the tables manually in Supabase Table Editor

---

## ✅ Success Checklist

- [ ] Opened Supabase Dashboard
- [ ] Opened SQL Editor
- [ ] Copied and pasted `/SUPABASE_MIGRATION_FIX.sql`
- [ ] Clicked RUN
- [ ] Saw success message with counts
- [ ] Refreshed the app
- [ ] No more errors in console
- [ ] Data persists after refresh

If all checkboxes are checked, you're done! 🎉
