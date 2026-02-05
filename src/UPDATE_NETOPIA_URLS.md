# 🔧 Update Netopia IPN URLs to Public Endpoint

## What Needs to Change

In `/supabase/functions/server/index.tsx`, there are **7 places** where we send the IPN URL to Netopia. All need to be updated from:

```
/netopia/ipn
```

To:

```
/netopia/ipn-public
```

---

## Manual Update Instructions

Open `/supabase/functions/server/index.tsx` and find/replace:

**Find:**
```
/netopia/ipn
```

**Replace with:**
```
/netopia/ipn-public
```

This will update all 7 occurrences in:
- Line ~1852 (config.notifyUrl)
- Line ~2156 (config.notifyUrl)
- Line ~2441 (url.confirm)
- Line ~2630 (config.notifyUrl)
- Line ~2912 (url.confirm)
- Line ~2981 (url.confirm)
- Line ~3196 (config.notifyUrl)

**IMPORTANT:** Make sure you're replacing:
- `/netopia/ipn` → `/netopia/ipn-public`
- NOT `/netopia/ipn-public` → `/netopia/ipn-public-public` (don't replace twice!)

---

## Automated Update (Use Your Code Editor)

### VS Code / Cursor
1. Press `Ctrl+H` (Windows/Linux) or `Cmd+H` (Mac)
2. Find: `/netopia/ipn"`
3. Replace: `/netopia/ipn-public"`
4. Click "Replace All"

### Find & Replace Pattern

**Find (regex):**
```
/netopia/ipn(?!-public)
```

**Replace:**
```
/netopia/ipn-public
```

This ensures you only replace `/netopia/ipn` and not `/netopia/ipn-public` (avoiding double replacement).

---

## Verification

After updating, search for `/netopia/ipn"` in the file. You should find:

✅ **7 instances** of `/netopia/ipn-public"`  
❌ **0 instances** of `/netopia/ipn"` (without -public)

---

## Why This Is Needed

When you initialize a Netopia payment, your server tells Netopia:

> "Please send payment notifications to this URL: /netopia/ipn"

Right now, that URL requires JWT authentication, so Netopia gets 401 errors.

By changing it to `/netopia/ipn-public`, Netopia will call the PUBLIC endpoint that doesn't require authentication.

---

## After Update

Once you make this change and redeploy/save:

1. ✅ All NEW payments will use the public endpoint
2. ✅ Netopia will be able to send IPN notifications
3. ✅ Orders will confirm automatically
4. ✅ No more 401 errors

---

**Status:** Manual update required in code editor  
**Time:** 2 minutes  
**Difficulty:** Easy (just find & replace)
