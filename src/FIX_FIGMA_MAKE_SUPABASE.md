# 🔧 FIX: Sizes & Frame Types Not Showing in Figma Make

## 🎯 **Problem:**
- ✅ Data EXISTS in Supabase
- ✅ Live site works perfectly
- ❌ Figma Make shows NO data

## 🔍 **Root Cause:**
**Row Level Security (RLS)** is blocking queries in Figma Make environment.

---

## ⚡ **QUICK FIX (2 minutes):**

### **STEP 1: Go to Test Page**
Open your Figma Make app and go to:
```
/supabase-test
```

This will show:
- ✅ Which tables are accessible
- ❌ Which tables are blocked by RLS
- 🔧 Exact fix instructions

---

### **STEP 2: Disable RLS**

#### **Option A: Use SQL (Fastest - 30 seconds)**

1. Open Supabase SQL Editor:  
   👉 https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/sql/new

2. Copy & paste from file: **`/DISABLE_RLS.sql`**

3. Click **"Run"**

4. Done! ✅

#### **Option B: Use UI (Slower - 5 minutes)**

1. Open Supabase Table Editor:  
   👉 https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/editor

2. For **each table** (canvas_sizes, frame_types, paintings, etc.):
   - Click table name
   - Click **"..."** menu (top right)
   - Click **"Edit table"**
   - Scroll to **"Row Level Security"**
   - Toggle **OFF**
   - Click **"Save"**

---

### **STEP 3: Refresh & Test**

1. Go back to `/supabase-test`
2. Click **"🔄 Re-run Tests"**
3. You should now see:
   - ✅ canvas_sizes with all your data
   - ✅ frame_types with all frame names
   - ✅ All other tables

4. Refresh your main app
5. Data should now load! 🎉

---

## 📊 **What You'll See After Fix:**

### Before (with RLS enabled):
```
❌ canvas_sizes error: statement timeout
❌ frame_types error: permission denied
```

### After (with RLS disabled):
```
✅ canvas_sizes (33 rows)
✅ frame_types (5 rows)
✅ paintings (100+ rows)
✅ categories (10 rows)
```

---

## 🎯 **Why This Happens:**

RLS is designed to restrict database access based on user authentication.

**In Figma Make:**
- Uses anonymous Supabase key
- RLS blocks anonymous queries by default
- Data can't load even though it exists

**On Live Site:**
- You probably have RLS disabled OR
- You have public read policies configured

**Solution:**
Disable RLS for development in Figma Make.

---

## 🔄 **Migration Path (Later):**

When deploying to production:

1. **Option 1:** Keep RLS disabled (simplest for small apps)
2. **Option 2:** Enable RLS + create public read policies
3. **Option 3:** Enable RLS + use authenticated queries

For now, just disable RLS to get Figma Make working! ✅

---

## ✅ **Success Checklist:**

After running the fix:

- [ ] `/supabase-test` shows all tables with data
- [ ] No error messages about RLS or permissions
- [ ] Admin panel → Sizes shows your 33 sizes
- [ ] Admin panel → Frame Types shows your frames
- [ ] Product pages show size selection dropdown
- [ ] No console errors about "cannot read property..."

---

## 🆘 **If Still Not Working:**

### Check Browser Console:
1. Press **F12**
2. Go to **Console** tab
3. Look for errors mentioning:
   - "RLS"
   - "permission denied"
   - "statement timeout"
   - "cannot read property"

### Re-run Test Page:
1. Go to `/supabase-test`
2. Check which tables show errors
3. Screenshot and share if needed

### Verify RLS is Actually Disabled:
Run this in Supabase SQL Editor:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = false`

---

## 📁 **Reference Files:**

| File | Purpose |
|------|---------|
| `/DISABLE_RLS.sql` | **⭐ RUN THIS!** Disables RLS on all tables |
| `/supabase-test` | Test page to diagnose issues |
| `/verify_sizes_frames_schema.sql` | Verify table structure |
| `/SIZES_FRAMES_VERIFICATION_GUIDE.md` | Detailed documentation |

---

## 🎯 **DO THIS NOW:**

**👉 Copy `/DISABLE_RLS.sql` → Paste in Supabase SQL Editor → Run**

Then refresh `/supabase-test` to see your data! 🚀

---

## 💡 **Pro Tip:**

The test page (`/supabase-test`) has a **"📋 Copy SQL"** button that automatically copies the RLS disable script to your clipboard. Just paste and run in Supabase! ⚡
