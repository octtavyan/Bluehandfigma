# 🔧 BlueHand Canvas - Configuration Summary

This document provides a quick reference for all configuration settings and credentials for your BlueHand Canvas application.

---

## 📊 Project Information

**Project Name:** BlueHand Canvas  
**Type:** Romanian Canvas Art E-commerce Platform  
**Framework:** React + TypeScript + Tailwind CSS  
**Database:** Supabase (PostgreSQL)  
**Email Service:** Resend  
**Deployment:** Figma Make  

---

## 🔑 Supabase Configuration

### Project Details
- **Project ID:** `uarntnjpoikeoigyatao`
- **Project URL:** `https://uarntnjpoikeoigyatao.supabase.co`
- **Dashboard:** https://supabase.com/dashboard/project/uarntnjpoikeoigyatao
- **Region:** Auto-selected by Supabase

### API Keys (Frontend)
```javascript
// Located in: /utils/supabase/info.tsx
export const projectId = "uarntnjpoikeoigyatao"
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Environment Variables (Backend)
These are auto-configured by Supabase and Figma Make:

| Variable | Status | Location |
|----------|--------|----------|
| `SUPABASE_URL` | ✅ Auto-configured | Supabase Edge Functions |
| `SUPABASE_ANON_KEY` | ✅ Auto-configured | Supabase Edge Functions |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Auto-configured | Supabase Edge Functions |
| `SUPABASE_DB_URL` | ✅ Auto-configured | Supabase Edge Functions |
| `RESEND_API_KEY` | ⚠️ **MUST BE SET** | Supabase Edge Functions |

---

## 📧 Resend Configuration

### API Credentials
- **API Key:** `re_5NCJQCN6_Q4bPvRW93eAvZo9pD82ezn3j`
- **Dashboard:** https://resend.com/overview
- **Documentation:** https://resend.com/docs

### Email Settings
| Setting | Value |
|---------|-------|
| **From Email** | `BlueHand Canvas <onboarding@resend.dev>` |
| **Admin Email** | `octavian.dumitrescu@gmail.com` |
| **Provider** | Resend |

### Email Types
1. **Order Notifications** → Sent to admin when order is placed
2. **Password Change Alerts** → Sent to user when password is changed
3. **Test Emails** → For testing integration

### Custom Domain (Optional)
To use custom email like `contact@bluehandcanvas.ro`:
1. Add domain in Resend Dashboard
2. Configure DNS records
3. Update `from` field in `/supabase/functions/server/index.tsx`

---

## 🗄️ Database Schema

### Tables Created
| Table | Purpose | Records (Initial) |
|-------|---------|-------------------|
| `paintings` | Product catalog | 0 (add via admin) |
| `sizes` | Canvas sizes | 12 (default sizes) |
| `categories` | Main categories | 3 (default categories) |
| `subcategories` | Product subcategories | 8 (default subcategories) |
| `orders` | Customer orders | 0 (populated by customers) |
| `clients` | Customer database | 0 (auto-populated) |
| `users` | Admin/operator users | 1 (default admin) |
| `hero_slides` | Homepage carousel | 0 (add via admin) |
| `blog_posts` | Blog content | 0 (add via admin) |

### Default Data

#### Admin User
```
Username: admin
Password: admin123  ⚠️ CHANGE THIS IMMEDIATELY
Role: admin
Email: octavian.dumitrescu@gmail.com
Status: Active
```

#### Categories
- Tablouri Canvas
- Multicanvas
- Tablouri Personalizate

#### Subcategories
- Peisaje
- Abstracte
- Orase
- Flori
- Animale
- Portrete
- Moderne
- Clasice

#### Canvas Sizes (Square)
| Size (cm) | Price (lei) | Discount |
|-----------|-------------|----------|
| 30 x 30 | 99.00 | 0% |
| 40 x 40 | 129.00 | 0% |
| 50 x 50 | 159.00 | 0% |
| 60 x 60 | 189.00 | 0% |
| 70 x 70 | 219.00 | 0% |
| 80 x 80 | 249.00 | 0% |

#### Canvas Sizes (Rectangular)
| Size (cm) | Price (lei) | Discount |
|-----------|-------------|----------|
| 30 x 40 | 109.00 | 0% |
| 40 x 60 | 149.00 | 0% |
| 50 x 70 | 179.00 | 0% |
| 60 x 80 | 209.00 | 0% |
| 60 x 90 | 239.00 | 0% |
| 70 x 100 | 269.00 | 0% |

---

## 🌐 API Endpoints

### Base URL
```
https://uarntnjpoikeoigyatao.supabase.co/functions/v1/make-server-bbc0c500
```

### Available Endpoints

#### Health Check
```
GET /health
Response: { "status": "ok" }
```

#### Test Resend Configuration
```
GET /test-resend
Response: {
  "configured": true,
  "message": "Resend API key is properly configured",
  "keyPreview": "re_5NCJQCN...n3j"
}
```

#### Send Test Email
```
POST /send-test-email
Body: {
  "to": "email@example.com",
  "subject": "Test Subject",
  "message": "Test message"
}
Response: {
  "success": true,
  "emailId": "xxx-xxx-xxx"
}
```

#### Send Order Notification (Auto-triggered)
```
POST /send-order-notification
Body: {
  "orderNumber": "BH-001",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "total": 299.99,
  "items": [...]
}
Response: {
  "success": true,
  "emailId": "xxx-xxx-xxx"
}
```

#### Send Password Verification (Auto-triggered)
```
POST /send-password-verification
Body: {
  "userEmail": "user@example.com",
  "userName": "User Name",
  "changedBy": "Admin Name"
}
Response: {
  "success": true,
  "emailId": "xxx-xxx-xxx"
}
```

---

## 🎨 Application Routes

### Public Routes
| Route | Page | Description |
|-------|------|-------------|
| `/` | Homepage | Hero carousel, featured products |
| `/tablouri-canvas` | Products | Product catalog with filters |
| `/tablouri-canvas/:id` | Product Detail | Single product view |
| `/tablou-canvas-personalizat` | Personalized Canvas | Custom canvas ordering |
| `/multicanvas` | Multicanvas | Multi-panel canvas info |
| `/oferte` | Offers | Special offers page |
| `/blog` | Blog | Blog posts listing |
| `/blog/:slug` | Blog Post | Single blog post |
| `/contact` | Contact | Contact form |
| `/cos` | Cart | Shopping cart |
| `/checkout` | Checkout | Order checkout |

### Admin Routes
| Route | Page | Description |
|-------|------|-------------|
| `/admin` | Login | Admin login page |
| `/admin/dashboard` | Dashboard | Admin dashboard with stats |
| `/admin/comenzi` | Orders | Order management |
| `/admin/comenzi/:id` | Order Detail | Single order view |
| `/admin/clienti` | Clients | Client management |
| `/admin/clienti/:id` | Client Detail | Single client view |
| `/admin/tablouri` | Products | Product management |
| `/admin/dimensiuni` | Sizes | Size management |
| `/admin/hero-slides` | Hero Slides | Homepage carousel management |
| `/admin/blog` | Blog Posts | Blog management |
| `/admin/setari` | Settings | Categories, email config |
| `/admin/utilizatori` | Users | User management |

---

## 📦 Key Files & Locations

### Configuration Files
| File | Purpose |
|------|---------|
| `/utils/supabase/info.tsx` | Supabase credentials (auto-generated) |
| `/lib/supabase.ts` | Supabase client initialization |
| `/supabase/functions/server/index.tsx` | Edge Functions (API endpoints) |
| `/supabase/functions/server/kv_store.tsx` | Key-value store utilities (protected) |

### Component Files
| File | Purpose |
|------|---------|
| `/App.tsx` | Main application component & routing |
| `/components/Header.tsx` | Site header & navigation |
| `/components/Footer.tsx` | Site footer |
| `/components/ProductCard.tsx` | Product display card |
| `/components/CartReturnToast.tsx` | Cart persistence notification |
| `/components/admin/AdminLayout.tsx` | Admin panel layout |
| `/components/admin/ResendTestPanel.tsx` | Email testing interface |
| `/components/admin/NotificationSettings.tsx` | Email notification settings |

### Context Files
| File | Purpose |
|------|---------|
| `/context/CartContext.tsx` | Shopping cart state management |
| `/context/AdminContext.tsx` | Admin panel state & data operations |

### Page Files
| Directory | Purpose |
|-----------|---------|
| `/pages/` | Public-facing pages |
| `/pages/admin/` | Admin panel pages |

### Data & Services
| File | Purpose |
|------|---------|
| `/lib/dataService.ts` | Database operations service |
| `/services/notificationService.ts` | Browser notification service |
| `/data/mockData.ts` | Sample/fallback data |

### Documentation
| File | Purpose |
|------|---------|
| `/COMPLETE_SETUP_GUIDE.md` | Step-by-step setup instructions |
| `/SUPABASE_ENV_SETUP.md` | Environment variables guide |
| `/COMPLETE_SUPABASE_SCHEMA.sql` | Complete database schema |
| `/SETUP_CHECKLIST.md` | Verification checklist |
| `/CONFIG_SUMMARY.md` | This file - quick reference |

---

## 🔐 Security Notes

### Credentials to Change Immediately
1. ⚠️ **Default admin password:** `admin123` → Change via Admin Panel
2. ⚠️ **Admin email:** Update if different from `octavian.dumitrescu@gmail.com`

### Protected Information
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Never expose to frontend
- ✅ `RESEND_API_KEY` - Only in server environment
- ✅ User passwords - Stored as bcrypt hashes
- ✅ API keys - Never committed to Git

### Best Practices
- [ ] Use different API keys for development vs production
- [ ] Rotate API keys every 6-12 months
- [ ] Monitor Resend dashboard for unusual activity
- [ ] Regular database backups (Supabase auto-backup enabled)
- [ ] Enable 2FA on Supabase and Resend accounts

---

## 🚀 Deployment Information

### Current Deployment
- **Platform:** Figma Make
- **Auto-deploy:** Yes (on file changes)
- **Build Process:** Automatic
- **Environment:** Production

### URLs
- **Application URL:** Provided by Figma Make
- **Admin Panel:** `{app-url}/admin`
- **API Endpoints:** Via Supabase Edge Functions

---

## 📊 Monitoring & Logs

### Access Points
| Resource | URL |
|----------|-----|
| **Supabase Dashboard** | https://supabase.com/dashboard/project/uarntnjpoikeoigyatao |
| **Edge Function Logs** | Dashboard → Edge Functions → Logs |
| **Database Logs** | Dashboard → Logs → Postgres Logs |
| **Resend Dashboard** | https://resend.com/overview |
| **Email Logs** | Resend Dashboard → Emails |

### What to Monitor
- Order placement success rate
- Email delivery success rate
- Database query performance
- Error rates in logs
- API usage (Resend quota)

---

## 🛠️ Maintenance Tasks

### Daily
- [ ] Check for new orders in admin panel
- [ ] Verify email notifications received

### Weekly
- [ ] Review error logs
- [ ] Check email delivery rate
- [ ] Monitor database size
- [ ] Backup important data

### Monthly
- [ ] Review API usage and costs
- [ ] Check for security updates
- [ ] Review and update product catalog
- [ ] Analyze order statistics

### As Needed
- [ ] Add new products
- [ ] Update hero slides
- [ ] Publish blog posts
- [ ] Manage user accounts
- [ ] Update pricing

---

## 📞 Support Resources

### Technical Support
- **Supabase Support:** https://supabase.com/support
- **Resend Support:** https://resend.com/support
- **Documentation:** All MD files in project root

### Quick Commands

#### Test Database Connection
```bash
curl https://uarntnjpoikeoigyatao.supabase.co/functions/v1/make-server-bbc0c500/health
```

#### Test Email Configuration
```bash
curl https://uarntnjpoikeoigyatao.supabase.co/functions/v1/make-server-bbc0c500/test-resend
```

#### Check Database Tables
```sql
-- Run in Supabase SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

---

## ✅ Setup Status

Use this section to track your setup progress:

- [ ] Database schema created
- [ ] Default admin user exists
- [ ] RESEND_API_KEY configured ⚠️ **REQUIRED**
- [ ] Email integration tested
- [ ] Test order placed successfully
- [ ] Default admin password changed
- [ ] Products added to catalog
- [ ] Hero slides configured
- [ ] Blog posts published (optional)
- [ ] Additional users created (optional)

---

*Configuration Summary Version: 1.0.0*  
*Last Updated: December 24, 2024*  
*Application: BlueHand Canvas - Romanian Canvas Art E-commerce Platform*

---

## 📝 Custom Notes

Use this space to document any custom changes or important information:

```
Date: _______________
Change: ________________________________________________________________
Reason: ________________________________________________________________
Updated by: ____________________________________________________________
```

---

**🎉 Your BlueHand Canvas application is ready to go!**

**Next Step:** Set the `RESEND_API_KEY` environment variable in Supabase Edge Functions (see `/SUPABASE_ENV_SETUP.md` for detailed instructions).
