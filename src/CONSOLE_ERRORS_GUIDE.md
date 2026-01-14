# 🐛 Console Errors & Debugging Guide

This guide explains the console messages you might see and which ones are important vs. which ones can be ignored.

## ✅ Expected (Safe to Ignore)

### 1. Hero Slides 400 Error
```
GET https://...supabase.co/rest/v1/hero_slides?select=*&order=display_order.asc
400 (Bad Request)
```

**Why this happens:**
- The `hero_slides` table doesn't exist in your Supabase database yet
- The SupabaseDebugPanel checks for this table on page load
- This is expected during initial setup

**How to fix (optional):**
1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL schema from `/supabase_schema.sql`
3. This creates all the tables including `hero_slides`

**Can I ignore it?**
- ✅ Yes! This error won't affect order creation or email notifications
- It only affects the Hero Slides management feature
- You can set up the tables later when needed

---

## 🔔 Order & Email Notification Logs

When an order is placed, you should see these console messages in sequence:

### 1. Order Creation Started
```
Creating order...
```

### 2. Email Notification Attempt
```
📧 Attempting to send email notification...
```

### 3. Email Response
```
📧 Email notification response status: 200
📧 Email notification response: { success: true, emailId: "..." }
✅ Email notification sent successfully
```

**OR if failed:**
```
📧 Email notification response status: 500
📧 Email notification response: { success: false, error: "...", details: {...} }
⚠️ Email notification failed: [error details]
```

### 4. Order Completion
```
✅ Data loaded from Supabase
✅ Order created successfully
```

---

## ❌ Problems to Watch For

### Email Notification Not Showing

If you **don't see** the 📧 email logs when placing an order:

**Possible causes:**
1. The order creation flow is not calling the email endpoint
2. JavaScript error preventing the email code from running
3. Network issue blocking the request

**How to debug:**
1. Place a test order
2. Check console for ANY errors (red text)
3. Look specifically for the `📧 Attempting to send email notification...` message
4. If you don't see it, there's an issue in the order creation flow

### Email Sending Failed

If you see `⚠️ Email notification failed`:

**Common errors and solutions:**

**Error: "Email service not configured"**
- ❌ RESEND_API_KEY environment variable not set
- ✅ Solution: Add RESEND_API_KEY to Supabase Edge Function secrets
- ✅ Then redeploy the Edge Function

**Error: "Failed to send email"**
- ❌ Resend API rejected the request
- ✅ Check the `details` object for more info
- ✅ Verify RESEND_API_KEY is valid (starts with `re_`)
- ✅ Check Resend account quota (100 emails/day on free tier)

**Error: Network or timeout**
- ❌ Edge Function not responding or crashed
- ✅ Check Supabase Edge Function logs
- ✅ Verify Edge Function is deployed and running

---

## 🔍 How to Check Console Logs

### Open Developer Tools

**Chrome/Edge:**
- Press `F12` OR
- Right-click → Inspect → Console tab

**Firefox:**
- Press `F12` OR
- Right-click → Inspect Element → Console tab

**Safari:**
- Enable Developer menu: Safari → Preferences → Advanced → Show Develop menu
- Develop → Show JavaScript Console

### Filter Console Messages

To see only email-related logs:
1. Open Console tab
2. In the filter box, type: `📧`
3. This shows only email notification messages

To see all order-related logs:
1. Filter: `Order` OR `Data loaded` OR `📧`

---

## 📝 Test Order Checklist

When placing a test order, verify these steps:

### Before Placing Order
- [ ] Open browser console (F12)
- [ ] Clear console (trash icon or Ctrl+L)
- [ ] Make sure you can see all logs (no filters applied)

### Place Order
- [ ] Fill out order form completely
- [ ] Click submit/place order button
- [ ] Watch console for messages

### Check Console Output
- [ ] See "Creating order..." or similar
- [ ] See `📧 Attempting to send email notification...`
- [ ] See `📧 Email notification response status: 200`
- [ ] See `✅ Email notification sent successfully`
- [ ] See "✅ Order created successfully"

### If Email Failed
- [ ] Note the exact error message
- [ ] Check if `success: false` in response
- [ ] Look at `error` and `details` fields
- [ ] Follow troubleshooting steps in NOTIFICATIONS_SETUP_GUIDE.md

### Check Email Inbox
- [ ] Wait 1-2 minutes for email to arrive
- [ ] Check octavian.dumitrescu@gmail.com inbox
- [ ] Check spam/junk folder if not in inbox
- [ ] If email sent successfully in console but not received, check Resend dashboard

---

## 🚨 Critical Errors (Red Flags)

These errors indicate real problems that need fixing:

### JavaScript Errors
```
Uncaught TypeError: ...
Uncaught ReferenceError: ...
```
- ❌ Code error that needs fixing
- ✅ Report the full error message

### Network Errors (500, 404, 403)
```
POST .../send-order-notification 500 (Internal Server Error)
```
- ❌ Server-side error
- ✅ Check Supabase Edge Function logs
- ✅ Verify Edge Function is deployed

### CORS Errors
```
Access to fetch at '...' has been blocked by CORS policy
```
- ❌ Server not allowing requests
- ✅ Check Edge Function CORS configuration

---

## 💡 Pro Tips

1. **Keep Console Open**: Always have console open when testing order flow
2. **Clear Before Each Test**: Clear console before each test order for clarity
3. **Copy Errors**: Copy full error messages when asking for help
4. **Check Network Tab**: Network tab shows all HTTP requests/responses
5. **Supabase Logs**: Check Supabase Edge Function logs for server-side errors

---

## 📊 Normal Console Output Example

```
🔍 Supabase Debug: Testing connection...
ℹ️ Supabase Debug: hero_slides table not found (needs setup)
Creating order...
📧 Attempting to send email notification...
📧 Email notification response status: 200
📧 Email notification response: { success: true, emailId: "abc123..." }
✅ Email notification sent successfully
✅ Data loaded from Supabase
✅ Order created successfully
```

This is perfect! ✅ The hero_slides warning is expected, and the email was sent successfully.

---

## 🆘 Need Help?

If you're still having issues:

1. **Take a screenshot** of the full console output after placing an order
2. **Check Supabase logs**: Dashboard → Edge Functions → Logs tab
3. **Check Resend dashboard**: https://resend.com/emails
4. **Verify secrets**: Supabase Dashboard → Settings → Edge Functions → Secrets
5. **Refer to**: `/NOTIFICATIONS_SETUP_GUIDE.md` for detailed setup instructions
