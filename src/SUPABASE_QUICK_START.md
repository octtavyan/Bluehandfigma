# ⚡ Supabase Quick Start (5 Minutes)

## 🎯 What You Need

✅ Supabase is already connected to Figma Make!  
✅ SQL schema is ready (`supabase-schema.sql`)  
✅ Just need to set up YOUR cloud database

---

## 📝 5-Minute Setup

### 1️⃣ Create Supabase Project (2 min)

```
1. Go to supabase.com
2. Sign up (free)
3. Click "New Project"
4. Name: pepanza-ro
5. Region: Europe (Central)
6. Create → Wait 2 min ⏰
```

### 2️⃣ Run Database Schema (1 min)

```
1. Click "SQL Editor" in Supabase
2. Click "New query"
3. Open /supabase-schema.sql from Figma Make
4. Copy EVERYTHING (Ctrl+A, Ctrl+C)
5. Paste in Supabase
6. Click "Run" ▶️
7. ✅ Success!
```

### 3️⃣ Get Your Credentials (30 sec)

```
1. Click "Settings" → "API"
2. Copy "Project URL"
   Example: https://abc123.supabase.co
3. Copy "anon public" key
   Example: eyJhbGci... (very long!)
```

### 4️⃣ Connect Figma Make (1 min)

```
1. In Figma Make: /admin/login
   Username: admin
   Password: admin123

2. Click "Configurare Supabase" in sidebar (💾 icon)

3. Paste:
   - Project URL
   - Anon Key

4. Click "Testează și Salvează"

5. ✅ Page reloads → You're connected!
```

### 5️⃣ Verify (30 sec)

```
1. Go to Dashboard
2. See "Supabase Connection Status" → Green ✅
3. Add a test hero slide
4. Dashboard shows "1 slide" → 🎉 Working!
```

---

## 🔗 Direct Links

| Step | Link |
|------|------|
| Create Project | [supabase.com/dashboard](https://supabase.com/dashboard) |
| Figma Make Login | `/admin/login` |
| Supabase Config | `/admin/supabase` |
| Test Connection | `/admin/supabase-test` |

---

## ⚠️ Common Mistakes

❌ **Not running the SQL schema**  
→ Tables won't exist, connection will fail

❌ **Copying partial anon key**  
→ Key is 300+ characters, copy ALL of it!

❌ **Wrong region**  
→ Choose Europe for best speed in Romania

❌ **Forgetting to mark slides as "Active"**  
→ Slides won't show on homepage unless ✅ Active

---

## 🎊 What You Get

After setup:

- ☁️ **Cloud storage** (not just localStorage)
- 🌍 **Multi-device** (access from anywhere)
- 🔄 **Real-time sync** (changes everywhere instantly)
- 💾 **Auto backups** (Supabase handles it)
- 📈 **Scalable** (supports 1000s of products/orders)

---

## 🆘 Need Help?

**Full Guide:** See `/SETUP_SUPABASE_FROM_FIGMA_MAKE.md`

**Test Page:** Visit `/admin/supabase-test` to see all data

**Console:** Press F12 and look for "Supabase:" messages

**Status:** Dashboard shows connection status at top

---

## ✅ Quick Checklist

```
[ ] Supabase account created
[ ] New project created (Europe region)
[ ] SQL schema run successfully
[ ] 9 tables visible in Table Editor
[ ] Project URL copied
[ ] Anon key copied (full 300+ chars!)
[ ] Connected in Figma Make (/admin/supabase)
[ ] Dashboard shows green "Connected"
[ ] Test slide created successfully
[ ] Slide visible on homepage
```

**All done? → Ready to build! 🚀**

---

## 🎯 Pro Tips

1. **Bookmark these:**
   - Supabase Dashboard: `supabase.com/dashboard`
   - Figma Supabase Config: `/admin/supabase`

2. **Use the same credentials everywhere:**
   - Figma Make preview
   - Chrome localhost
   - Production deployment
   - → All share the same cloud database!

3. **Check Table Editor often:**
   - See your data in real-time
   - Verify things are saving correctly
   - Debug issues quickly

4. **Enable auto-refresh on Dashboard:**
   - Click "Check Status" to refresh connection
   - See real-time counts update

---

**Total Time:** ~5 minutes  
**Difficulty:** Easy 🟢  
**Cost:** Free (Supabase free tier)

Let's go! 🚀
