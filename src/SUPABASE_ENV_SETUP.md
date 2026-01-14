# Supabase Environment Variables Setup Guide

## Required Environment Variables

Your BlueHand Canvas application requires the following environment variables to be configured in Supabase Edge Functions:

### 1. RESEND_API_KEY (Email Notifications)

**Value:** `re_5NCJQCN6_Q4bPvRW93eAvZo9pD82ezn3j`

**Purpose:** Enables email notifications for:
- Order confirmations to admin (octavian.dumitrescu@gmail.com)
- Password change verification emails
- System notifications

**How to Set:**
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/uarntnjpoikeoigyatao
2. Navigate to **Edge Functions** in the left sidebar
3. Click on the **Settings** or **Secrets** tab
4. Add new secret:
   - Name: `RESEND_API_KEY`
   - Value: `re_5NCJQCN6_Q4bPvRW93eAvZo9pD82ezn3j`
5. Save the changes

**Verification:**
Once set, you can verify the configuration by calling:
```bash
GET https://uarntnjpoikeoigyatao.supabase.co/functions/v1/make-server-bbc0c500/test-resend
```

### 2. SUPABASE_URL (Auto-configured)

**Value:** `https://uarntnjpoikeoigyatao.supabase.co`

**Purpose:** Database connection URL
**Status:** ✅ Already configured by Figma Make

### 3. SUPABASE_ANON_KEY (Auto-configured)

**Value:** (See `/utils/supabase/info.tsx`)

**Purpose:** Public API key for frontend database access
**Status:** ✅ Already configured by Figma Make

### 4. SUPABASE_SERVICE_ROLE_KEY (Auto-configured)

**Purpose:** Service role key for server-side operations with elevated privileges
**Status:** ✅ Already configured by Supabase

### 5. SUPABASE_DB_URL (Auto-configured)

**Purpose:** Direct PostgreSQL database connection
**Status:** ✅ Already configured by Supabase

---

## Testing the Email Integration

### Method 1: Test Resend Configuration
```bash
curl https://uarntnjpoikeoigyatao.supabase.co/functions/v1/make-server-bbc0c500/test-resend
```

**Expected Response:**
```json
{
  "configured": true,
  "message": "Resend API key is properly configured",
  "keyPreview": "re_5NCJQCN..."
}
```

### Method 2: Send a Test Email
```bash
curl -X POST https://uarntnjpoikeoigyatao.supabase.co/functions/v1/make-server-bbc0c500/send-test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "octavian.dumitrescu@gmail.com",
    "subject": "Test Email",
    "message": "Testing the email integration!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "emailId": "xxx-xxx-xxx"
}
```

### Method 3: Place a Test Order
1. Go to your application
2. Add items to cart
3. Complete checkout
4. Check that you receive an email notification at octavian.dumitrescu@gmail.com

---

## API Endpoints Available

Your server exposes the following endpoints:

### Health Check
- **URL:** `GET /make-server-bbc0c500/health`
- **Purpose:** Verify server is running
- **Response:** `{ "status": "ok" }`

### Test Resend Configuration
- **URL:** `GET /make-server-bbc0c500/test-resend`
- **Purpose:** Check if RESEND_API_KEY is properly configured
- **Response:** Configuration status and key preview

### Send Test Email
- **URL:** `POST /make-server-bbc0c500/send-test-email`
- **Body:**
  ```json
  {
    "to": "email@example.com",
    "subject": "Test Subject",
    "message": "Test message content"
  }
  ```
- **Purpose:** Send a test email to verify integration

### Send Order Notification
- **URL:** `POST /make-server-bbc0c500/send-order-notification`
- **Body:**
  ```json
  {
    "orderNumber": "BH-001",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "total": 299.99,
    "items": [...]
  }
  ```
- **Purpose:** Send order confirmation email to admin
- **Triggered:** Automatically when customer completes checkout

### Send Password Verification
- **URL:** `POST /make-server-bbc0c500/send-password-verification`
- **Body:**
  ```json
  {
    "userEmail": "user@example.com",
    "userName": "User Name",
    "changedBy": "Admin Name"
  }
  ```
- **Purpose:** Send security notification when password is changed
- **Triggered:** Automatically when admin changes a user's password

---

## Troubleshooting

### Error: "RESEND_API_KEY environment variable not set"
**Solution:** Add the RESEND_API_KEY to Supabase Edge Functions secrets (see above)

### Error: "RESEND_API_KEY format is invalid"
**Solution:** Ensure the key starts with `re_` (valid Resend format)

### Error: "Failed to send email"
**Possible Causes:**
1. API key is invalid or expired
2. Resend account quota exceeded
3. Network connectivity issues

**Solution:**
1. Verify API key at https://resend.com/api-keys
2. Check Resend dashboard for account status
3. Review server logs in Supabase Dashboard → Edge Functions → Logs

### Emails Not Arriving
**Check:**
1. Spam/Junk folder
2. Resend dashboard for delivery status
3. Edge Function logs for errors
4. Email address in code (currently: octavian.dumitrescu@gmail.com)

---

## Email Configuration Details

### Default Sender
- **Email:** `onboarding@resend.dev` (Resend's default sender)
- **Name:** `BlueHand Canvas` or `BlueHand Security`

**Note:** To use a custom domain email (e.g., `contact@bluehandcanvas.ro`), you need to:
1. Verify your domain in Resend dashboard
2. Update the `from` field in `/supabase/functions/server/index.tsx`

### Default Recipient (Admin)
- **Email:** `octavian.dumitrescu@gmail.com`

**To change:**
1. Open `/supabase/functions/server/index.tsx`
2. Search for `octavian.dumitrescu@gmail.com`
3. Replace with your desired email address
4. Edge function will auto-deploy on next push

---

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit API keys to Git** - Always use environment variables
2. **RESEND_API_KEY should only be in Supabase** - Not in frontend code
3. **Use different keys for dev/production** - Create separate Resend API keys
4. **Rotate keys periodically** - Generate new keys every 6-12 months
5. **Monitor API usage** - Check Resend dashboard for unusual activity

---

## Quick Setup Checklist

- [✅] Supabase project created: `uarntnjpoikeoigyatao`
- [✅] Database tables created (paintings, orders, clients, users, etc.)
- [✅] Edge Functions deployed
- [✅] SUPABASE_URL configured
- [✅] SUPABASE_ANON_KEY configured
- [✅] SUPABASE_SERVICE_ROLE_KEY configured
- [ ] **RESEND_API_KEY configured** ← YOU NEED TO DO THIS
- [ ] Test email sent successfully
- [ ] Order notification tested

---

## Support & Resources

- **Supabase Dashboard:** https://supabase.com/dashboard/project/uarntnjpoikeoigyatao
- **Resend Dashboard:** https://resend.com/overview
- **Resend API Docs:** https://resend.com/docs
- **Edge Functions Logs:** Supabase Dashboard → Edge Functions → Logs
- **Database Logs:** Supabase Dashboard → Logs → Postgres Logs

---

## Next Steps After Setup

1. **Update RESEND_API_KEY** in Supabase Edge Functions
2. **Run test email** to verify integration
3. **Place test order** to verify end-to-end flow
4. **Check email delivery** in Resend dashboard
5. **Monitor logs** for any errors
6. **(Optional) Configure custom domain** in Resend for branded emails

---

*Last Updated: December 24, 2024*
*Application: BlueHand Canvas - Romanian Canvas Art E-commerce Platform*
