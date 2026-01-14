# 🔔 Email & Browser Notifications Setup Guide

This guide explains how to set up email notifications and browser notifications for new orders in the BlueHand Canvas application.

## 📧 Email Notifications

Email notifications are sent to `octavian.dumitrescu@gmail.com` whenever a new order is placed.

### Prerequisites

1. **Resend Account**: You need a Resend account to send emails
   - Sign up at: https://resend.com
   - Free tier includes 100 emails/day and 3,000 emails/month

2. **Resend API Key**: Get your API key from Resend dashboard
   - Go to: https://resend.com/api-keys
   - Create a new API key
   - Copy the API key (it starts with `re_`)

### Setup Steps

1. **Add RESEND_API_KEY Environment Variable**:
   - The system has already prompted you to add the `RESEND_API_KEY` secret
   - Paste your Resend API key when prompted
   - If you missed the prompt, you can add it manually in Supabase:
     - Go to Supabase Dashboard → Settings → Edge Functions → Secrets
     - Add new secret: `RESEND_API_KEY` with your Resend API key

2. **Verify Domain (Optional for Production)**:
   - For production use, verify your domain in Resend
   - Go to: https://resend.com/domains
   - Add your domain and follow verification steps
   - Update the email sender in `/supabase/functions/server/index.tsx`:
     ```typescript
     from: "BlueHand Canvas <noreply@yourdomain.com>",
     ```

3. **Test Email Notifications**:
   - Place a test order from the frontend
   - Check the Supabase Edge Function logs for email send status
   - Check the recipient email inbox (octavian.dumitrescu@gmail.com)

### Email Content

Email notifications include:
- Order number
- Customer name and email
- List of ordered items (paintings or personalized canvases)
- Total price
- Link reminder to access the admin panel

### Customization

To change the recipient email address, edit `/supabase/functions/server/index.tsx`:

```typescript
to: ["your-email@domain.com"],
```

To customize the email template, edit the `emailHtml` variable in the same file.

### Troubleshooting

**Email not received?**
- **Check browser console logs** when placing an order - look for 📧 email notification logs
- Check Supabase Edge Function logs for errors (Supabase Dashboard → Edge Functions → Logs)
- Verify RESEND_API_KEY is set correctly in Supabase Edge Function secrets
- Check spam folder in octavian.dumitrescu@gmail.com
- Verify Resend account is active and has remaining quota (100 emails/day free tier)
- If logs show errors, verify the Edge Function is deployed and running

**How to check browser console logs:**
1. Place a test order from the website
2. Open browser developer tools (F12 or right-click → Inspect)
3. Go to the Console tab
4. Look for messages starting with 📧:
   - `📧 Attempting to send email notification...`
   - `📧 Email notification response status: 200`
   - `📧 Email notification response: {...}`
   - `✅ Email notification sent successfully` (if successful)
   - `⚠️ Email notification failed:` (if failed with error details)

**"Email service not configured" error?**
- Make sure RESEND_API_KEY environment variable is set in Supabase
- Redeploy the Edge Function after adding the secret
- Verify the secret value starts with `re_`

---

## 🔔 Browser Notifications

Browser notifications provide real-time alerts to logged-in admin users when new orders are placed.

### Features

- **Real-time notifications**: Instant alerts when orders are placed
- **Permission-based**: Users must grant permission to receive notifications
- **Auto-dismissal**: Notifications auto-close after 10 seconds
- **Sound & Vibration**: Includes alert sound and vibration (on supported devices)
- **Clickable**: Notifications can be clicked to open the admin panel

### Setup for Admin Users

1. **Log in to Admin Panel**:
   - Navigate to `/admin/login`
   - Log in with admin credentials

2. **Enable Notifications**:
   - On the Admin Dashboard, you'll see a blue notification settings card
   - Click "Activează Notificările" button
   - Your browser will show a permission prompt
   - Click "Allow" to enable notifications

3. **Verify Setup**:
   - After granting permission, you'll see a test notification
   - The settings card will turn green and show "Notificări Browser Activate"
   - You're now ready to receive order notifications!

### Browser Compatibility

Browser notifications work on:
- ✅ Chrome (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Safari (Desktop, requires macOS 10.14+)
- ✅ Edge (Desktop)
- ❌ Safari iOS (not supported by Apple)
- ❌ Private/Incognito mode (notifications disabled)

### Permission States

**Not Requested (Default)**:
- Blue card with "Activează Notificările" button
- Click the button to request permission

**Granted**:
- Green card showing "Notificări Browser Activate"
- You will receive notifications for new orders

**Denied**:
- Red card showing "Notificări Blocate"
- You need to manually enable notifications in browser settings

### How to Reset Browser Permissions

If you accidentally denied permissions, you can reset them:

**Chrome**:
1. Click the lock icon in the address bar
2. Find "Notifications" setting
3. Change to "Allow"
4. Refresh the page

**Firefox**:
1. Click the shield/lock icon in the address bar
2. Click the "X" next to blocked notifications
3. Refresh and allow when prompted

**Safari**:
1. Safari → Preferences → Websites → Notifications
2. Find your site and change to "Allow"
3. Refresh the page

### Notification Behavior

When a new order is placed:
1. Email is sent to octavian.dumitrescu@gmail.com (always)
2. If admin is logged in AND has granted permission:
   - Browser notification appears with order details
   - Notification shows for 10 seconds
   - Includes order number, customer name, and total price

### Testing Browser Notifications

To test browser notifications without placing a real order:
1. Open browser console
2. Run this code:
```javascript
import { notificationService } from './services/notificationService';
notificationService.showOrderNotification('ORD-TEST123', 'Test Customer', 150.00);
```

---

## 🔐 Password Change Verification Emails

For security purposes, the system automatically sends verification emails when admin user passwords are changed.

### Features

- **Automatic email notifications**: Sent whenever a password is changed
- **Sent to user's email**: The affected user receives the verification email
- **Detailed information**: Includes who made the change and when
- **Security alerts**: Warns users to contact admin if change was unauthorized

### How It Works

1. **Admin edits a user**: From the Admin Users page
2. **Password is changed**: Admin enters a new password for the user
3. **User is updated**: Click "Actualizează Utilizator"
4. **Email is sent**: Verification email automatically sent to user's @bluehand.ro email
5. **User receives notification**: Email contains details of the password change

### Email Content

Password verification emails include:
- Warning about password change
- User's name and email
- Who made the change (admin name)
- Date and time of change
- Instructions to contact admin if unauthorized

### Email Domain Validation

**Important**: All admin user emails must use the **@bluehand.ro** domain.

When adding or editing users:
- ✅ `admin@bluehand.ro` - Valid
- ✅ `maria.ionescu@bluehand.ro` - Valid
- ❌ `admin@gmail.com` - Invalid (will be rejected - only @bluehand.ro allowed)

### User Management

Admins can now:
- **Edit themselves**: All users can edit their own profile and password
- **Edit other users**: Full admins can edit any user (with delete restrictions)
- **Change emails**: Update user emails (must be @bluehand.ro)
- **Change passwords**: Update passwords with automatic verification emails

### Testing Password Verification

1. Navigate to `/admin/users` (Admin Users page)
2. Click the edit button on any user card
3. Change the password field
4. Click "Actualizează Utilizator"
5. Check the user's @bluehand.ro email for the verification message

### Security Considerations

- **Passwords are changed immediately**: No confirmation required from the user
- **Email serves as audit trail**: Provides record of password changes
- **Users alerted of unauthorized changes**: Can contact admin immediately
- **Only @bluehand.ro emails**: Ensures emails reach company email addresses

---

## 🔧 Technical Details

### Password Verification Endpoint

- **URL**: `https://{projectId}.supabase.co/functions/v1/make-server-bbc0c500/send-password-verification`
- **Method**: POST
- **Authentication**: Bearer token (Supabase Anon Key)
- **Payload**:
  ```json
  {
    "userEmail": "user@bluehand.ro",
    "userName": "User Full Name",
    "changedBy": "Administrator Name"
  }
  ```

### Email Notification Endpoint

- **URL**: `https://{projectId}.supabase.co/functions/v1/make-server-bbc0c500/send-order-notification`
- **Method**: POST
- **Authentication**: Bearer token (Supabase Anon Key)
- **Payload**:
  ```json
  {
    "orderNumber": "ORD-1234567890",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "total": 150.00,
    "items": [...]
  }
  ```

### Browser Notification Service

- **Service**: `notificationService` singleton
- **Location**: `/services/notificationService.ts`
- **Key Methods**:
  - `requestPermission()`: Request notification permission
  - `showNotification()`: Display a notification
  - `showOrderNotification()`: Show order-specific notification
  - `hasPermission()`: Check if permission is granted
  - `isSupported()`: Check if browser supports notifications

### Integration Points

1. **Order Creation**: `AdminContext.addOrder()`
   - Sends email notification (non-blocking)
   - Sends browser notification (if admin logged in with permission)

2. **Admin Dashboard**: `AdminDashboardPage`
   - Displays NotificationSettings component
   - Shows current permission status
   - Allows users to enable/disable notifications

---

## 🎯 Best Practices

1. **Keep Admin Panel Open**: Browser notifications only work when the browser window is open
2. **Stay Logged In**: Browser notifications require an active admin session
3. **Logo Navigation**: Clicking the logo in admin panel returns you to the homepage without logging you out, so browser notifications continue working
4. **Check Email Quota**: Monitor Resend email quota to avoid service interruption
5. **Test Regularly**: Periodically test both email and browser notifications
6. **Update Contact Info**: Keep notification recipient email up to date

---

## 📊 Monitoring

### Email Logs
- Check Supabase Edge Function logs: Supabase Dashboard → Edge Functions → Logs
- Check Resend dashboard: https://resend.com/emails

### Browser Notification Status
- Visible on Admin Dashboard in NotificationSettings card
- Check browser console for notification-related logs

---

## 🆘 Support

If you encounter issues:
1. **Check console logs** - See `/CONSOLE_ERRORS_GUIDE.md` for detailed console debugging
2. Check this guide's troubleshooting sections
3. Review Supabase Edge Function logs
4. Verify all environment variables are set
5. Ensure browser notifications are enabled in browser settings

**Important Note:**
- The `hero_slides` 400 error in console is **expected and safe to ignore** during initial setup
- This error won't affect order creation or email notifications
- See `/CONSOLE_ERRORS_GUIDE.md` for full explanation

---

## ✨ Summary

- ✅ Email notifications automatically sent to octavian.dumitrescu@gmail.com for new orders
- ✅ Browser notifications available for logged-in admins
- ✅ Easy one-click setup for browser notifications
- ✅ Both notifications triggered on every new order
- ✅ Password change verification emails sent automatically
- ✅ Email domain validation enforces @bluehand.ro addresses
- ✅ All admins can edit their own profiles
- ✅ Non-blocking implementation (order creation never fails due to notification errors)

**All set! You'll now receive email and browser notifications for every new order, plus password change verification emails for enhanced security.** 🎉