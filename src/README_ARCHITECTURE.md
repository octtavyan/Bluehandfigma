# 🏗️ BlueHand Canvas - Architecture Overview

## 📊 Hybrid Architecture (Development Mode)

Your app now uses a **SMART HYBRID** approach:

---

## 🟢 Supabase (Development Data Layer)

### What's on Supabase:
✅ **Core Data** (via `/lib/supabaseDataService.ts`):
- Paintings / Products
- Orders
- Clients
- Admin Users
- Canvas Sizes
- Frame Types
- Categories / Subcategories
- Hero Slides
- Blog Posts

### Why Supabase for Development:
- 🚀 **Instant updates** in Figma Make
- 🐛 **Easy debugging** with Dashboard
- 📊 **Visual data editor** - No SQL needed
- 🔄 **Real-time sync** across devices
- 🆓 **Free tier** for development

---

## 🟡 BlueHand.ro Server (Production-Only Features)

### What Stays on Your Server:
❗ **Production Services** (direct API calls):
- FanCourier Integration (`/components/admin/FanCourierTab.tsx`)
- Email Configuration (`/components/admin/EmailConfigTab.tsx`)
- Netopia Payment Gateway (`/pages/CheckoutPage.tsx`)
- Cart Session Management (`/context/CartContext.tsx`)
- Unsplash Settings (`/pages/HomePage.tsx`)

### Why Keep These on Your Server:
- 🔐 **Security**: Payment/shipping APIs need server secrets
- 💰 **Cost**: Third-party services require your accounts
- 🎯 **Production-only**: These features only work when live

---

## 📁 File Structure

### Active Development Files:
```
/lib/supabaseDataService.ts      ← ✅ CURRENTLY ACTIVE
/context/AdminContext.tsx         ← Imports from supabaseDataService
/utils/supabase/info.tsx          ← Supabase credentials
```

### Production-Ready Files (Not Active Yet):
```
/lib/phpDataService.ts            ← 🟡 Ready for future use
/services/api.ts                  ← PHP API client (not used now)
```

### Hybrid Features (Always Production):
```
/components/admin/FanCourierTab.tsx      ← Calls bluehand.ro
/components/admin/EmailConfigTab.tsx     ← Calls bluehand.ro
/pages/CheckoutPage.tsx                  ← Calls bluehand.ro (Netopia)
/context/CartContext.tsx                 ← Calls bluehand.ro (sessions)
```

---

## 🔄 Data Flow

### Development Mode (NOW):

```
┌─────────────────────────────────────────────────┐
│  Figma Make (React App)                         │
│  ┌──────────────────────────────────────────┐   │
│  │ Components                               │   │
│  │  ↓                                       │   │
│  │ AdminContext                             │   │
│  │  ↓                                       │   │
│  │ supabaseDataService.ts                   │   │
│  └──────────────┬───────────────────────────┘   │
│                 ↓                               │
│         📡 Supabase Cloud                       │
│         (Postgres Database)                     │
│                                                 │
│  + Direct API calls for:                        │
│    → FanCourier (bluehand.ro)                  │
│    → Email (bluehand.ro)                       │
│    → Payment (bluehand.ro)                     │
└─────────────────────────────────────────────────┘
```

### Production Mode (FUTURE):

```
┌─────────────────────────────────────────────────┐
│  bluehand.ro (React App)                        │
│  ┌──────────────────────────────────────────┐   │
│  │ Components                               │   │
│  │  ↓                                       │   │
│  │ AdminContext                             │   │
│  │  ↓                                       │   │
│  │ phpDataService.ts                        │   │
│  └──────────────┬───────────────────────────┘   │
│                 ↓                               │
│         🗄️  MySQL Database                      │
│         (localhost)                             │
│                                                 │
│  + Direct API calls for:                        │
│    → FanCourier (same server)                  │
│    → Email (same server)                       │
│    → Payment (same server)                     │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Development Workflow

### Current Workflow (Supabase):
1. Edit in Figma Make
2. Changes auto-refresh
3. Data saves to Supabase
4. View data in Supabase Dashboard
5. Test features instantly

### Benefits:
- ⚡ **Fast iteration** - No server setup
- 🔍 **Easy debugging** - Visual database editor
- 📱 **Multi-device** - Data syncs everywhere
- 🎨 **Focus on UI** - Backend handled by Supabase

---

## 🚀 Production Deployment (Future)

### When Ready to Launch:

#### Step 1: Export Supabase Data
```sql
-- In Supabase Dashboard → SQL Editor:
COPY paintings TO '/tmp/paintings.csv' WITH CSV HEADER;
COPY orders TO '/tmp/orders.csv' WITH CSV HEADER;
-- ... etc for all tables
```

#### Step 2: Import to MySQL
```bash
# On bluehand.ro server:
mysql -u bluehand_user -p bluehand_canvas < import_script.sql
```

#### Step 3: Switch Backend (One Line!)
```typescript
// In /context/AdminContext.tsx:
import { ... } from '../lib/supabaseDataService'; // ❌ Remove
import { ... } from '../lib/phpDataService';      // ✅ Add
```

#### Step 4: Deploy
```bash
# Build and upload to bluehand.ro
npm run build
# Upload /dist to /public_html/
```

---

## 📊 Database Schema (Same in Both Modes)

Both Supabase and MySQL use identical schema:

```sql
paintings (
  id, title, category, subcategory, image, 
  available_sizes, price, discount, is_active
)

orders (
  id, customer_name, customer_email, items,
  total, status, created_at
)

canvas_sizes (
  id, width, height, price, discount, 
  frame_prices, is_active
)

frame_types (
  id, name, is_active, order
)

admin_users (
  id, username, password, role, is_active
)

-- ... and more
```

---

## 🔧 Configuration Files

### Supabase Config (Current):
```typescript
// /utils/supabase/info.tsx
export const projectId = "uarntnjpoikeoigyatao"
export const publicAnonKey = "eyJhbG..."
```

### MySQL Config (Future):
```php
// /api/db.php (on server)
define('DB_HOST', 'localhost');
define('DB_NAME', 'bluehand_canvas');
define('DB_USER', 'bluehand_user');
define('DB_PASS', 'your_password');
```

---

## 🎓 Key Concepts

### Service Layer Pattern:
Both `supabaseDataService.ts` and `phpDataService.ts` implement the **SAME INTERFACE**.

This means:
- ✅ Same function names
- ✅ Same parameters
- ✅ Same return types
- ✅ Components don't know which backend is used!

Example:
```typescript
// Works with BOTH Supabase AND PHP:
const paintings = await paintingsService.getAll();
const order = await ordersService.create(orderData);
```

### Switch Backends = Change 1 Import:
```typescript
// Development (Supabase):
import { paintingsService } from '../lib/supabaseDataService';

// Production (PHP):
import { paintingsService } from '../lib/phpDataService';

// Code using paintingsService stays EXACTLY THE SAME! 🎉
```

---

## 📚 Documentation Files

- **This file** - Architecture overview
- `/DEPLOYMENT_GUIDE.md` - Step-by-step deployment instructions
- `/RECONNECTED_TO_SUPABASE.md` - Current setup confirmation
- `/lib/supabaseDataService.ts` - Supabase implementation (ACTIVE)
- `/lib/phpDataService.ts` - PHP implementation (READY)

---

## ✨ Summary

**You have the BEST of both worlds:**

🟢 **Development**: Fast, easy, cloud-based (Supabase)  
🟡 **Production**: Full control, your server (MySQL)  
🔄 **Migration**: Simple one-line change when ready!

**Keep building in Figma Make with Supabase. Deploy to bluehand.ro when ready!** 🚀
