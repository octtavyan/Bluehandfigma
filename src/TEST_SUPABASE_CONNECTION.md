# 🧪 TEST SUPABASE CONNECTION

## Quick Test in Browser Console

After you've cleared localStorage and run the SQL script, test if Supabase is working:

### **Step 1: Check Supabase Configuration**

Open browser console (F12) and run:

```javascript
// Check if Supabase is configured
const url = localStorage.getItem('supabase_url');
const key = localStorage.getItem('supabase_anon_key');

console.log('Supabase URL:', url);
console.log('Supabase Key exists:', !!key);
console.log('Is Configured:', !!(url && key));
```

**Expected output:**
```
Supabase URL: https://your-project.supabase.co
Supabase Key exists: true
Is Configured: true
```

If you see `null` or `false`, you need to connect Supabase first!

---

### **Step 2: Connect to Supabase** (if not configured)

1. Go to `/admin/supabase`
2. Enter your:
   - **Supabase URL:** `https://your-project.supabase.co`
   - **Supabase Anon Key:** `your-anon-key`
3. Click "Save & Connect"
4. Should see success message

---

### **Step 3: Test Hero Slides Fetch**

In console, run:

```javascript
// Manually test the fetch
const supabaseUrl = localStorage.getItem('supabase_url');
const supabaseKey = localStorage.getItem('supabase_anon_key');

fetch(`${supabaseUrl}/rest/v1/hero_slides?select=*&order=order.asc`, {
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('✅ Hero Slides from Supabase:', data);
  console.log('📊 Count:', data.length);
})
.catch(err => {
  console.error('❌ Fetch failed:', err);
});
```

**Expected output:**
```
✅ Hero Slides from Supabase: [{id: "...", title: "Creaza tablou", ...}]
📊 Count: 1
```

**If you get an error:**
- Check if the table exists in Supabase
- Check if RLS policies are set up correctly
- Check if you ran the SQL script

---

### **Step 4: Force Reload Data**

If Supabase is working but data isn't showing, force reload:

```javascript
// Force reload from Supabase
window.location.reload();
```

---

## 🐛 Common Issues

### Issue 1: "Supabase not configured"

**Solution:** Go to `/admin/supabase` and enter your credentials

### Issue 2: "table 'hero_slides' does not exist"

**Solution:** Run `/SUPABASE_COMPLETE_SETUP.sql` in Supabase SQL Editor

### Issue 3: "permission denied for table hero_slides"

**Solution:** The SQL script sets up RLS policies. If this fails, run:

```sql
-- Allow public read access
CREATE POLICY "Allow public read access to hero_slides"
  ON public.hero_slides FOR SELECT USING (true);
```

### Issue 4: Data shows in CMS but not on homepage

**Possible causes:**
1. **LocalStorage cache** - Clear it again
2. **Multiple tabs** - Close all tabs, open one
3. **React state** - Force reload the page

**Solution:**
```javascript
// Clear everything and reload
localStorage.removeItem('admin_hero_slides');
localStorage.removeItem('admin_blog_posts');
window.location.href = '/';
```

---

## ✅ Final Verification

Run ALL these checks:

```javascript
console.log('=== SUPABASE CONNECTION TEST ===');

// 1. Check configuration
const url = localStorage.getItem('supabase_url');
const key = localStorage.getItem('supabase_anon_key');
console.log('1. Supabase configured:', !!(url && key));

// 2. Check localStorage is clear
const heroSlides = localStorage.getItem('admin_hero_slides');
console.log('2. LocalStorage hero_slides:', heroSlides);

// 3. Test fetch
if (url && key) {
  fetch(`${url}/rest/v1/hero_slides?select=*&order=order.asc`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log('3. Supabase fetch SUCCESS');
    console.log('   Slides count:', data.length);
    console.log('   Slides:', data);
  })
  .catch(err => {
    console.log('3. Supabase fetch FAILED');
    console.error('   Error:', err);
  });
} else {
  console.log('3. Cannot test fetch - Supabase not configured');
}
```

---

## 🎯 What Should Happen

After everything is set up correctly:

1. **Console shows:**
   ```
   📝 heroSlidesService.getAll called
   📝 Supabase configured: true
   📝 Attempting Supabase fetch...
   ✅ Supabase fetch successful, slides count: 1
   🎯 HomePage - heroSlides count: 1
   🎯 HomePage - heroSlides data: [{...}]
   ```

2. **Homepage shows:**
   - Hero slide with your image
   - Title and subtitle visible
   - Button links correctly

3. **No errors in console**

---

## 🚀 If All Else Fails

**Nuclear option - Complete reset:**

```javascript
// 1. Clear ALL localStorage
localStorage.clear();

// 2. Reload page
window.location.href = '/';

// 3. Reconnect Supabase at /admin/supabase

// 4. Run SQL script again

// 5. Add hero slide again

// 6. Check homepage
```

This ensures a completely fresh start!
