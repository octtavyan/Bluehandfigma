# 🔧 IPN URL Replacement - All Methods

## What Needs to Change

In `/supabase/functions/server/index.tsx`, replace ALL instances of:

```
/netopia/ipn
```

With:

```
/netopia/ipn-public
```

There are **7 occurrences** at these approximate lines:
- Line 1852
- Line 2156  
- Line 2441
- Line 2630
- Line 2912
- Line 2981
- Line 3196

---

## Method 1: Code Editor Find & Replace (EASIEST) ⭐

### VS Code / Cursor / Most Editors:

1. Open `/supabase/functions/server/index.tsx`
2. Press `Ctrl+H` (Windows/Linux) or `Cmd+H` (Mac)
3. In "Find" box: `/netopia/ipn"`
4. In "Replace" box: `/netopia/ipn-public"`
5. Click "Replace All"
6. Save the file

**Note:** Include the double quote (`"`) in the search to avoid replacing the already-updated `/netopia/ipn-public` URLs.

---

## Method 2: Using Python Script

I created a Python script for you. Run it from your project root:

```bash
python3 fix-netopia-ipn-urls.py
```

The script will:
- Read the file
- Replace all `/netopia/ipn` with `/netopia/ipn-public`  
- Avoid replacing already-updated URLs
- Save the file
- Show you what was changed

---

## Method 3: Using Node.js Script

Run the Node.js script:

```bash
node fix-netopia-urls.js
```

Same as Python script but uses Node.js.

---

## Method 4: Manual Search & Replace (Command Line)

### On Mac/Linux:

```bash
cd supabase/functions/server
sed -i.bak 's|/netopia/ipn"|/netopia/ipn-public"|g' index.tsx
```

### On Windows (PowerShell):

```powershell
cd supabase\functions\server
(Get-Content index.tsx) -replace '/netopia/ipn"', '/netopia/ipn-public"' | Set-Content index.tsx
```

---

## Method 5: Online Find & Replace

If none of the above work:

1. Copy the entire contents of `/supabase/functions/server/index.tsx`
2. Go to: https://codebeautify.org/find-and-replace-text-online
3. Paste your code
4. Find: `/netopia/ipn"`
5. Replace: `/netopia/ipn-public"`
6. Click "Replace All"
7. Copy the result back
8. Paste it into `/supabase/functions/server/index.tsx`
9. Save

---

## Verification

After making the change, search for `/netopia/ipn"` in the file:

✅ **Should find 0 results**  
✅ **Should find 7 instances of** `/netopia/ipn-public"`

---

## What This Fixes

When you create a payment, your code tells Netopia:
> "Send notifications to this URL"

**Before:** `/netopia/ipn` → requires JWT → 401 error ❌  
**After:** `/netopia/ipn-public` → no JWT needed → works perfectly ✅

---

## After the Change

1. Save the file
2. Figma Make will auto-deploy
3. Test with a real payment
4. Everything works seamlessly!

---

**Choose whichever method is easiest for you!** All methods do the same thing - just use whatever tools you have available. 🚀
