# ⚡ QUICK FIX: Sizes & Frame Types

## 🎯 **DO THIS NOW:**

### **STEP 1: Open Supabase SQL Editor**
👉 https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/sql/new

---

### **STEP 2: Copy & Paste This SQL**

Open file: **`/verify_sizes_frames_schema.sql`**

Copy ALL the SQL and paste into Supabase SQL Editor.

---

### **STEP 3: Click "Run"**

Wait 5-10 seconds for results.

---

### **STEP 4: Check Results**

Look for these messages:

✅ **GOOD:**
- `✅ canvas_sizes table EXISTS`
- `✅ frame_types table EXISTS`
- `✓ frame_prices column already exists`

❌ **NEEDS FIX:**
- `❌ table DOES NOT EXIST` → Run `/supabase_setup.sql` instead
- `✅ Added ... column` → Column was missing, now added

---

### **STEP 5: Test Your App**

Go to: **`/supabase-test`**

You should see:
- ✅ canvas_sizes table with data
- ✅ frame_types table with data
- ✅ No errors

---

## 🔧 **Quick Manual Check**

In Supabase Dashboard → Table Editor:

### **Check canvas_sizes:**
```
✓ Has columns: width, height, price, discount, is_active
✓ Has columns: supports_print_canvas, supports_print_hartie
✓ Has column: frame_prices (type: jsonb)
✓ Has at least 1 row
✓ frame_prices contains JSON like: {"Fara Rama": {"price": 0, ...}}
```

### **Check frame_types:**
```
✓ Has columns: id, name, is_active, order
✓ Has rows: Fara Rama, Rama Neagra, Rama Alba, etc.
✓ At least 1 row has is_active = true
```

---

## 🚨 **If Tables Don't Exist**

Run the full setup instead:

1. Open `/supabase_setup.sql`
2. Copy ALL SQL
3. Paste into Supabase SQL Editor
4. Click "Run"
5. Wait 10-15 seconds
6. Refresh your app

---

## 📊 **Why This Matters**

Your frontend **REQUIRES** this exact structure:

**canvas_sizes** → Pricing, size options, frame compatibility  
**frame_types** → Frame selection in ordering flow  
**frame_prices** → Per-size frame pricing (critical!)

Without correct structure = App crashes! ❌

---

## ✅ **Success Indicators**

When everything works:

1. **`/supabase-test`** shows all data
2. **Admin panel** → Sizes shows rows
3. **Admin panel** → Frame Types shows rows
4. **Product page** shows size options
5. **No console errors** about "cannot read property..."

---

## 🎯 **Fast Track**

```bash
# 1. Run verification:
/verify_sizes_frames_schema.sql

# 2. Test app:
/supabase-test

# 3. If broken, run full setup:
/supabase_setup.sql

# 4. Test again:
/supabase-test
```

---

## 📞 **Still Broken?**

Share with me:
1. Screenshot of `/supabase-test` page
2. Browser console errors
3. SQL verification results

I'll fix the data service mapping! 🚀

---

**👉 START WITH: Run `/verify_sizes_frames_schema.sql` NOW!**
