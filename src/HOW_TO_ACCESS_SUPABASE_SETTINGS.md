# 🔧 How to Access Supabase Configuration

## The Issue

After connecting Supabase, the page reloads and you might lose track of where the configuration page is.

**Good news: The menu item is ALWAYS there!** It never disappears.

---

## 📍 Where to Find Supabase Settings

### Method 1: Use the Sidebar Menu (Easiest)

1. Login to CMS: `http://localhost:5173/admin/login`
   - Username: `admin`
   - Password: `admin123`

2. Look at the **left sidebar** (dark gray/black)

3. Scroll down to find: **"Configurare Supabase"** with a Database icon 💾

4. Click on it

**The menu item is ALWAYS visible for full-admin users!**

---

### Method 2: Direct URL (Fastest)

Just navigate directly to:

```
http://localhost:5173/admin/supabase
```

**Bookmark this URL for quick access!**

---

### Method 3: From Dashboard

1. Go to Dashboard: `http://localhost:5173/admin/dashboard`

2. Look at the **Supabase Connection Status** panel at the top

3. Click on any action button (like "Check Status" or "Configure Supabase Now")

---

## 🎯 Menu Location

The "Configurare Supabase" menu item is located in the sidebar between:

- **Above:** Utilizatori (Users)
- **Current:** Configurare Supabase ⭐
- **Below:** Test Supabase

Look for the **Database icon** 💾

---

## ✅ What the Page Shows

### If Supabase is NOT Connected:

You'll see:

1. **Yellow status box:**
   - ⚠️ "Supabase Neconectat"
   - "Momentan aplicația folosește localStorage"

2. **Blue instruction box:**
   - Step-by-step setup guide

3. **White form:**
   - Input for Supabase URL
   - Input for Anon Key
   - Blue button: "Testează și Salvează Configurația"

### If Supabase IS Connected:

You'll see:

1. **Green status box:**
   - ✅ "Supabase Conectat"
   - "Datele sunt salvate în cloud"
   - Red button: "Deconectează"

2. **White form:**
   - Inputs are disabled (grayed out)
   - Shows your configuration is saved

3. **Info boxes:**
   - SQL script instructions
   - Benefits of using Supabase

---

## 🐛 Troubleshooting

### "I can't see the menu item!"

**Check your user role:**

1. Press F12 (open console)
2. Type:
   ```javascript
   console.log(JSON.parse(localStorage.getItem('current_admin_user')));
   ```
3. Look at the output - what's the `role`?

**You need to be `full-admin` to see Supabase settings!**

If you're logged in as `account` or `production`, you won't see it.

**Solution:** Login as `admin` / `admin123`

---

### "The page is blank after connecting!"

This happens because the page reloads to fetch new data from Supabase.

**After reload, you'll be on the same page** (`/admin/supabase`)

If the page appears blank:

1. Hard refresh: **Ctrl+Shift+R**
2. Or navigate away and come back
3. Or use direct URL: `http://localhost:5173/admin/supabase`

---

### "I connected in Figma but don't see it in Chrome!"

**This is the key issue!**

Figma preview and Chrome localhost are **SEPARATE environments** with **SEPARATE localStorage**.

**You need to connect Supabase SEPARATELY in each environment:**

| Environment | URL | Needs Separate Connection |
|-------------|-----|--------------------------|
| Figma Preview | (iframe URL) | ✅ Yes |
| Chrome Localhost | http://localhost:5173 | ✅ Yes |
| Production | your-domain.com | ✅ Yes |

**Each one has its own localStorage!**

**Solution:**

1. Open Chrome: `http://localhost:5173/admin/supabase`
2. Enter credentials (same ones you used in Figma)
3. Click "Testează și Salvează Configurația"
4. Wait for page to reload
5. You'll see green "Supabase Conectat" status

---

### "After connecting, I can't reconnect or change settings!"

**This is by design!**

Once connected, the form is **locked** to prevent accidental changes.

**To change settings:**

1. Click the **red "Deconectează" button**
2. Confirm the popup
3. Form will unlock
4. Enter new credentials
5. Click "Testează și Salvează Configurația"

---

## 📋 Quick Reference

**Login:**
- URL: `http://localhost:5173/admin/login`
- User: `admin`
- Pass: `admin123`

**Supabase Settings:**
- URL: `http://localhost:5173/admin/supabase`
- Menu: Look for "Configurare Supabase" with 💾 icon

**Dashboard (with status panel):**
- URL: `http://localhost:5173/admin/dashboard`
- Panel shows connection status at top

**Test Supabase:**
- URL: `http://localhost:5173/admin/supabase-test`
- Shows all data from Supabase tables

---

## 🎉 Summary

1. ✅ **Menu item NEVER disappears** - it's always in the sidebar
2. ✅ **You must be full-admin** to see it
3. ✅ **Direct URL always works:** `/admin/supabase`
4. ✅ **Each environment needs separate connection** (Figma ≠ Chrome)
5. ✅ **After connecting, page reloads** to fetch new data
6. ✅ **Form locks after connection** for safety

**The menu item is there! Just scroll in the sidebar and look for the Database icon 💾**
