# 🚀 BlueHand Canvas - Complete Setup Guide

This guide will walk you through setting up your complete BlueHand Canvas application with Supabase and Resend email integration.

---

## 📋 Prerequisites

- ✅ Supabase Project: `uarntnjpoikeoigyatao`
- ✅ Resend API Key: `re_5NCJQCN6_Q4bPvRW93eAvZo9pD82ezn3j`
- ✅ Application deployed on Figma Make

---

## 🎯 Step 1: Database Setup

### Option A: Automated Setup (Recommended)
Your database tables should already be created automatically by the application on first load.

### Option B: Manual Setup
If you need to recreate the database or set it up manually:

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/uarntnjpoikeoigyatao
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `/COMPLETE_SUPABASE_SCHEMA.sql`
5. Click **Run** to execute the SQL

This will create:
- ✅ All database tables (paintings, orders, clients, users, sizes, categories, subcategories, hero_slides, blog_posts)
- ✅ Default admin user (username: `admin`, password: `admin123`)
- ✅ Default categories and subcategories
- ✅ Default canvas sizes
- ✅ Indexes for optimal performance
- ✅ Triggers for automatic timestamp updates

---

## 🔑 Step 2: Configure Resend API Key

### What is this for?
The Resend API key enables email notifications when:
- Customers place orders → Admin receives notification
- Passwords are changed → User receives security notification

### Setup Instructions:

1. **Access Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/uarntnjpoikeoigyatao
   
2. **Navigate to Edge Functions**
   - Click **Edge Functions** in the left sidebar
   - Click on **Secrets** or **Settings** tab
   
3. **Add the Secret**
   - Click **Add secret** or **New secret**
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_5NCJQCN6_Q4bPvRW93eAvZo9pD82ezn3j`
   - Click **Save** or **Add**
   
4. **Wait for Propagation**
   - Wait 10-30 seconds for the environment variable to propagate
   - The Edge Function will automatically pick up the new value

---

## ✅ Step 3: Verify Setup

### Test Database Connection
1. Open your application
2. Navigate to Admin Login: `/admin`
3. Login with:
   - **Username:** `admin`
   - **Password:** `admin123`
4. If successful, your database is connected! ✅

### Test Email Integration
1. In the Admin Panel, go to **Setări** (Settings)
2. Click on the **Configurare Email** tab
3. Click **Verifică Configurația** button
4. You should see: ✅ "Resend API key is properly configured"
5. Try sending a test email:
   - Enter your email address
   - Click **Trimite Email de Test**
   - Check your inbox for the test email

### Test Complete Flow
1. As a customer, add items to cart
2. Complete checkout with your details
3. Submit the order
4. Check that:
   - ✅ Order appears in Admin Panel → Comenzi
   - ✅ Email notification received at octavian.dumitrescu@gmail.com
   - ✅ Customer data saved in Clienți
   - ✅ Order status can be updated

---

## 📚 Key Features Enabled

### Frontend Features
- 🏠 Homepage with hero carousel
- 🖼️ Product catalog (Tablouri Canvas)
- 🎨 Personalized canvas ordering with photo upload
- 🛒 Shopping cart with persistence
- 💳 Complete checkout flow
- 📱 Fully responsive design
- 📖 Blog system
- 📞 Contact page

### Admin Panel Features
- 📊 Dashboard with statistics
- 📦 Order management with status updates
- 👥 Client management
- 🖼️ Product (paintings) management
- 📐 Size management for personalized canvas
- 🎯 Hero slides management
- 📝 Blog posts management
- 🏷️ Categories & subcategories management
- 👤 User management (roles: admin, operator)
- 📧 Email notification system
- ⚙️ Resend integration testing

### Backend Features
- 🗄️ PostgreSQL database (Supabase)
- 🚀 Edge Functions for server operations
- 📧 Email notifications via Resend
- 🔐 Password security notifications
- 🔄 Real-time data synchronization
- 📊 Client statistics tracking

---

## 🎨 Default Admin Credentials

**Important:** Change these after first login!

- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `octavian.dumitrescu@gmail.com`
- **Role:** `admin` (full access)

### How to Change Password:
1. Login to Admin Panel
2. Go to **Utilizatori** (Users)
3. Click on the admin user
4. Update password
5. Save changes

---

## 📧 Email Configuration

### Current Setup
- **Provider:** Resend (https://resend.com)
- **From Email:** `onboarding@resend.dev` (Resend's default)
- **Admin Email:** `octavian.dumitrescu@gmail.com`

### Email Templates Included
1. **Order Notification** - Sent to admin when new order is placed
2. **Password Change** - Sent to user when password is changed
3. **Test Email** - For testing the integration

### Customizing Emails
To customize email templates or sender address:
1. Open `/supabase/functions/server/index.tsx`
2. Find the email template section
3. Modify HTML content, styling, or sender info
4. Edge function auto-deploys on save

### Using Custom Domain Email
To use `contact@bluehandcanvas.ro` instead of `onboarding@resend.dev`:
1. Go to Resend Dashboard: https://resend.com
2. Click **Domains** → **Add Domain**
3. Follow DNS verification steps
4. Update `from` field in `/supabase/functions/server/index.tsx`

---

## 🔧 API Endpoints Reference

Your application exposes these server endpoints:

### Health Check
```
GET https://uarntnjpoikeoigyatao.supabase.co/functions/v1/make-server-bbc0c500/health
```

### Test Resend Configuration
```
GET https://uarntnjpoikeoigyatao.supabase.co/functions/v1/make-server-bbc0c500/test-resend
```

### Send Test Email
```
POST https://uarntnjpoikeoigyatao.supabase.co/functions/v1/make-server-bbc0c500/send-test-email
Content-Type: application/json

{
  "to": "test@example.com",
  "subject": "Test Subject",
  "message": "Test message"
}
```

### Send Order Notification (Auto-triggered)
```
POST https://uarntnjpoikeoigyatao.supabase.co/functions/v1/make-server-bbc0c500/send-order-notification
Content-Type: application/json

{
  "orderNumber": "BH-001",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "total": 299.99,
  "items": [...]
}
```

---

## 🐛 Troubleshooting

### Database Connection Issues
**Symptoms:** Can't login to admin, data not loading
**Solutions:**
1. Check Supabase project status
2. Verify `/utils/supabase/info.tsx` has correct credentials
3. Check browser console for errors
4. Try clearing browser cache

### Email Not Sending
**Symptoms:** Orders placed but no email received
**Solutions:**
1. Verify RESEND_API_KEY in Supabase Edge Functions
2. Check spam/junk folder
3. Test with Resend panel: Admin → Setări → Configurare Email
4. Check Edge Function logs for errors
5. Verify Resend account is active

### Orders Not Saving
**Symptoms:** Checkout completes but order doesn't appear in admin
**Solutions:**
1. Check browser console for errors
2. Verify `orders` table exists in Supabase
3. Check Supabase logs for database errors
4. Try placing order with simplified data

### Admin Login Failed
**Symptoms:** Can't login with admin credentials
**Solutions:**
1. Verify `users` table exists
2. Check if default admin user was created
3. Run query: `SELECT * FROM users WHERE username = 'admin'`
4. If missing, re-run `/COMPLETE_SUPABASE_SCHEMA.sql`

---

## 📖 Additional Resources

### Documentation Files
- `/SUPABASE_ENV_SETUP.md` - Detailed environment variables guide
- `/COMPLETE_SUPABASE_SCHEMA.sql` - Complete database schema
- `/SUPABASE_COMPLETE.md` - Migration and setup documentation

### External Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)

### Admin Panel Testing
- **Test Resend Integration:** Admin → Setări → Configurare Email
- **View Database:** Admin → Supabase (if available)
- **Check Logs:** Supabase Dashboard → Edge Functions → Logs

---

## 🎉 You're All Set!

Your BlueHand Canvas application is now fully configured with:
- ✅ Complete database schema
- ✅ Email notifications
- ✅ Admin panel
- ✅ Order management
- ✅ Product catalog
- ✅ Personalized canvas ordering

### Next Steps:
1. ✅ **Change default admin password**
2. ✅ **Add your first products** (Admin → Tablouri)
3. ✅ **Configure hero slides** (Admin → Hero Slides)
4. ✅ **Test complete order flow**
5. ✅ **Create additional admin users** (Admin → Utilizatori)
6. ✅ **(Optional) Set up custom domain email**

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Check Supabase logs in the dashboard
4. Verify all environment variables are set correctly

---

*Last Updated: December 24, 2024*
*Version: 1.0.0*
*Application: BlueHand Canvas - Romanian Canvas Art E-commerce Platform*

🎨 **Happy Selling!** 🎨
