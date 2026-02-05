# ✅ Automatic Fix - Update All Netopia URLs

## You're Right - It Should Work Seamlessly!

You don't need to configure anything in Netopia's panel. The code automatically sends the IPN URL when creating a payment.

We just need to update the code so it sends the NEW public endpoint URL.

---

## 🚀 Super Simple Fix (30 Seconds)

### If You're Using a Code Editor (VS Code, Cursor, etc.):

1. **Open:** `/supabase/functions/server/index.tsx`

2. **Find & Replace:**
   - Press `Ctrl+H` (Windows/Linux) or `Cmd+H` (Mac)
   - **Find:** `/netopia/ipn"`
   - **Replace:** `/netopia/ipn-public"`
   - Click "Replace All"

3. **Save the file**

4. **Done!** Figma Make will auto-deploy

---

## 🎯 What This Does

When someone makes a payment, your code tells Netopia:

**Before:**
```
"Send payment notifications to: .../netopia/ipn"
```
→ This requires JWT → 401 error ❌

**After:**
```
"Send payment notifications to: .../netopia/ipn-public"
```
→ This is public → Works perfectly ✅

---

## ✅ After This Change

1. **Deploy/Publish** your website
2. **Make a test order** with card payment
3. **That's it!**

Everything will work automatically:
- ✅ Payment completes
- ✅ Netopia sends IPN to public endpoint (no 401!)
- ✅ Order created automatically
- ✅ Email sent
- ✅ Invoice generated

---

## 📋 Verification

After deploying, place one test order and check:

1. **Supabase → Table Editor → `netopia_ipn_queue`**
   - Should see entry with `processed = true`

2. **Supabase → Table Editor → `orders`**
   - Should see your order with `payment_status = 'paid'`

3. **Your email**
   - Should receive order confirmation

4. **Supabase → Edge Functions → Logs**
   - Should see:
     ```
     [PUBLIC IPN] Received Netopia IPN notification
     [PROCESS QUEUE] Processing queue item
     [PROCESS QUEUE] Order created successfully
     ```

---

## 🎉 That's It!

Just one find & replace, then test. No Netopia configuration needed, no manual setup - everything works seamlessly!

---

**Ready?** Open the file, find `/netopia/ipn"` → replace with `/netopia/ipn-public"` → Save → Deploy → Test! 🚀
