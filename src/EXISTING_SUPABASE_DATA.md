# ✅ Using Existing Supabase Data

## 🎯 You Already Have Data!

Great! You mentioned tables and data already exist in Supabase from a previous build.

---

## 🔍 **STEP 1: Diagnose the Issue**

### Go to this URL in your app:
👉 **`/supabase-test`**

This page will:
- ✅ Test connection to Supabase
- ✅ Show all tables and their data
- ✅ Display exact error messages
- ✅ Give you specific fixes

---

## 🔒 **Most Common Issue: Row Level Security (RLS)**

If tables exist but you get timeout errors, RLS is probably blocking access.

### Quick Fix in Supabase Dashboard:

1. **Go to Supabase Dashboard**  
   👉 https://supabase.com/dashboard/project/uarntnjpoikeoigyatao

2. **Click "Table Editor"** in left sidebar

3. **For EACH table** (paintings, orders, categories, etc.):
   - Click the table name
   - Click the **"..." menu** (top right)
   - Click **"Edit table"**
   - Scroll down to **"Row Level Security (RLS)"**
   - Toggle it **OFF** (for development)
   - Click **"Save"**

---

## 🎯 **Alternative: Enable Public Read Access**

If you want to keep RLS on:

1. **Go to Authentication → Policies**
2. **For each table, click "New Policy"**
3. **Select template: "Enable read access for all users"**
4. **Click "Review"** → **"Save Policy"**

---

## 📊 **Verify Your Data**

### Option 1: Use Test Page
Go to **`/supabase-test`** in your app to see all data.

### Option 2: Use Supabase Dashboard
1. Click **"Table Editor"**
2. Click each table to see data
3. Make sure tables have content

---

## 🔧 **Check App Connection**

The app is already configured to connect to Supabase:

- ✅ **Project ID**: `uarntnjpoikeoigyatao`
- ✅ **Service File**: `/lib/supabaseDataService.ts`
- ✅ **Active Import**: `/context/AdminContext.tsx`

---

## 🐛 **Debugging Steps**

### 1. Open Browser Console
Press **F12** and check for error messages.

### 2. Look for These Messages:
```
🔄 Fetching paintings from Supabase...
❌ Error fetching paintings: [error details]
💡 TIP: Did you run /supabase_setup.sql...
```

### 3. Check Network Tab
- Look for requests to `uarntnjpoikeoigyatao.supabase.co`
- Check if they return 200 OK or error codes

---

## 📋 **Table Schema Check**

Your Supabase tables should have these columns:

### **paintings** table:
- `id` (uuid)
- `title` (text)
- `category` (text)
- `image` (text)
- `available_sizes` (text array)
- `price` (numeric)
- `discount` (numeric)
- `is_active` (boolean)
- `print_types` (text array)
- `frame_types_by_print_type` (jsonb)
- etc.

### **canvas_sizes** table:
- `id` (uuid)
- `width` (integer)
- `height` (integer)
- `price` (numeric)
- `is_active` (boolean)
- `frame_prices` (jsonb)
- etc.

If columns are different, the data service might need adjustment.

---

## 🔄 **If Column Names Don't Match**

Let me know what your actual column names are, and I'll update the data service to match!

For example, if you have:
- `painting_title` instead of `title`
- `size_width` instead of `width`

I can quickly adapt the mapping.

---

## ✅ **Quick Checklist**

- [ ] Tables exist in Supabase? (Check Table Editor)
- [ ] Tables have data? (Check row count)
- [ ] RLS is disabled OR public read policies exist?
- [ ] App shows data in `/supabase-test` page?
- [ ] Browser console shows successful fetch logs?

---

## 🆘 **Still Not Working?**

### Share with me:

1. **Go to `/supabase-test`** in your app
2. **Take screenshot** of what you see
3. **Copy error from browser console**
4. **Tell me** what your table column names are

I'll adjust the data service to match your exact schema!

---

## 🎯 **Next Step**

**👉 Go to `/supabase-test` NOW and see what happens!**

This will give us exact error details to fix.
