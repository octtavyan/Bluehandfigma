# 🎯 QUICK START GUIDE - Let's Activate Everything!

## 📦 **STEP 1: Upload Paintings API** (2 minutes)

Upload this file to your server:
- **File**: `/server-deploy/api/paintings.php`
- **Upload To**: `/public_html/api/paintings.php`
- **Action**: OVERWRITE if it exists

### Test It:
Open: https://bluehand.ro/api/paintings

**Expected Result:**
```json
{
  "paintings": []
}
```
(Empty array is GOOD! It means the API works, you just need to add paintings)

---

## 🎨 **STEP 2: Add Your First Painting** (5 minutes)

### Option A: Via Admin Panel (RECOMMENDED)
1. Open your app in browser
2. Go to `/admin/login`
3. Login:
   - Username: `admin`
   - Password: `admin123`
4. Click "Tablouri" in sidebar
5. Click "Adaugă Tablou" button
6. Fill in the form:
   - **Titlu**: "Peisaj Montan de Toamnă"
   - **Categorie**: Select "Peisaje" or "Natură"
   - **Descriere**: "Tablou cu peisaj montan în culori calde de toamnă"
   - **Imagine**: Use Unsplash search or upload
   - **Preț Bază**: 299.99
   - **Tipuri Print**: Check "Print Canvas"
   - **Dimensiuni**: Select 3-5 sizes
   - **Activ**: Check (enabled)
7. Click "Salvează"

### Option B: Direct SQL (FAST!)
Run this in phpMyAdmin:

```sql
INSERT INTO paintings (
  id, title, slug, category, description, image,
  available_sizes, price, discount, is_active,
  print_types, frame_types_by_print_type,
  orientation, dominant_color,
  created_at, updated_at
) VALUES (
  'painting-sample-1',
  'Peisaj Montan de Toamnă',
  'peisaj-montan-de-toamna',
  'cat-nature',
  'Tablou cu peisaj montan în culori calde de toamnă. Perfect pentru living sau dormitor.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
  '["size-60x40", "size-80x60", "size-100x70"]',
  299.99,
  0,
  1,
  '["Print Canvas"]',
  '{"Print Canvas": ["frame-canvas-none", "frame-canvas-black", "frame-canvas-white"]}',
  'landscape',
  '#F97316',
  NOW(),
  NOW()
);
```

**Then add 2 more paintings:**

```sql
-- Painting 2: Abstract
INSERT INTO paintings (
  id, title, slug, category, description, image,
  available_sizes, price, discount, is_active,
  print_types, frame_types_by_print_type,
  orientation, dominant_color,
  created_at, updated_at
) VALUES (
  'painting-sample-2',
  'Compoziție Abstractă',
  'compozitie-abstracta',
  'cat-abstract',
  'Tablou abstract modern cu forme geometrice și culori vibrante.',
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200',
  '["size-50x40", "size-70x50", "size-90x60"]',
  249.99,
  10,
  1,
  '["Print Canvas", "Print Hartie"]',
  '{"Print Canvas": ["frame-canvas-none", "frame-canvas-black"], "Print Hartie": ["frame-hartie-none", "frame-hartie-black", "frame-hartie-white"]}',
  'landscape',
  '#3B82F6',
  NOW(),
  NOW()
);

-- Painting 3: Cities
INSERT INTO paintings (
  id, title, slug, category, description, image,
  available_sizes, price, discount, is_active,
  print_types, frame_types_by_print_type,
  orientation, dominant_color,
  created_at, updated_at
) VALUES (
  'painting-sample-3',
  'Noapte în Paris',
  'noapte-in-paris',
  'cat-cities',
  'Vedere nocturnă a Turnului Eiffel cu iluminare spectaculoasă.',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200',
  '["size-40x30", "size-60x40", "size-80x60", "size-100x70"]',
  349.99,
  15,
  1,
  '["Print Canvas"]',
  '{"Print Canvas": ["frame-canvas-black", "frame-canvas-white", "frame-canvas-natural"]}',
  'portrait',
  '#1F2937',
  NOW(),
  NOW()
);
```

---

## ✅ **STEP 3: Test The Frontend** (2 minutes)

### Test 1: API Returns Paintings
Open: https://bluehand.ro/api/paintings

**Should show 3 paintings with all data**

### Test 2: Homepage Gallery
1. Open your app homepage
2. Scroll to "Printuri si Canvas" section
3. **Should see**: Your 3 paintings displayed in grid

### Test 3: Click a Painting
1. Click on one painting
2. **Should see**: 
   - Image loads
   - Price shows
   - Size selector
   - Frame type selector (based on print type)
   - "Adaugă în Coș" button

### Test 4: Customize & Add to Cart
1. Select a size (e.g., "80x60 cm")
2. Select print type (Canvas/Hartie)
3. Select frame type
4. Price updates automatically
5. Click "Adaugă în Coș"
6. **Should see**: Toast notification "Produs adăugat în coș!"
7. Cart icon shows (1) badge

---

## 🎯 **STEP 4: Test Complete Order Flow** (5 minutes)

1. **View Cart**: Click cart icon (top right)
2. **Verify Item**: 
   - Image shows
   - Title correct
   - Size, frame, print type correct
   - Price correct
3. **Go to Checkout**: Click "Finalizează Comanda"
4. **Fill Form**:
   - Nume: Test User
   - Email: test@example.com
   - Telefon: 0712345678
   - Oraș: București
   - Județ: București
   - Adresă: Strada Test 123
5. **Select Delivery**: Standard (15-20 lei)
6. **Select Payment**: Ramburs (Cash on Delivery)
7. **Submit**: Click "Trimite Comanda"
8. **Result**: 
   - Success message
   - Order confirmation page
   - Email sent (if configured)

---

## ⚙️ **STEP 5: Configure Admin Settings** (10 minutes)

### 5.1 Unsplash Settings ✅ ALREADY CONFIGURED
- Already working!
- Gallery pre-populates with 24 images
- No action needed

### 5.2 Email Settings
1. Go to Admin → Settings → Email tab
2. Configure:
   - **From Email**: noreply@bluehand.ro
   - **From Name**: BlueHand Canvas
   - **SMTP** (optional): Leave blank for PHP mail()
3. Click "Salvează Setări"
4. Click "Trimite Email de Test"
5. Check if email arrives

### 5.3 Netopia Payments (For Card Payments)
1. Go to Admin → Settings → Netopia tab
2. Create account: https://admin.netopia-payments.com
3. Get credentials from dashboard
4. Configure:
   - **Merchant ID**: Your merchant ID
   - **API Key**: Your API key
   - **POS Signature**: Your signature
   - **Public Key**: Your public key
   - **Live Mode**: OFF (for testing), ON (for production)
5. Click "Salvează Setări"
6. Click "Testează Conexiunea"

### 5.4 FAN Courier AWB (For Shipping Labels)
1. Go to Admin → Settings → FAN Courier tab
2. Get FAN Courier account
3. Configure:
   - **Client ID**: Your client ID
   - **Username**: Your FAN username
   - **Password**: Your FAN password
4. Click "Salvează Setări"
5. Click "Testează Conexiunea"

---

## 🚀 **STEP 6: Verify Everything Works**

### Admin Panel Checklist:
- [ ] Can login to admin
- [ ] Dashboard shows stats
- [ ] Can view orders
- [ ] Can view paintings
- [ ] Can add/edit paintings
- [ ] Can view clients
- [ ] Can manage users
- [ ] Settings save correctly

### Frontend Checklist:
- [ ] Homepage loads
- [ ] Categories show
- [ ] Paintings display in gallery
- [ ] Can click painting to view details
- [ ] Can customize (size, frame, print type)
- [ ] Price calculates correctly
- [ ] Can add to cart
- [ ] Cart persists (refresh page, still there)
- [ ] Can update cart quantities
- [ ] Can remove from cart
- [ ] Can go to checkout
- [ ] Form validation works
- [ ] Can submit order
- [ ] Order appears in admin panel

---

## 🎉 **SUCCESS!**

If ALL checkboxes are ticked, **YOUR SYSTEM IS FULLY OPERATIONAL!** 🚀

---

## 🆘 **Common Issues & Fixes:**

### Issue: "Paintings not showing on homepage"
**Check:**
1. API returns data: https://bluehand.ro/api/paintings
2. Paintings have `is_active = 1` in database
3. Browser console for errors (F12 → Console)

**Fix:**
- If API returns empty array → Add paintings
- If API returns error → Check paintings.php uploaded correctly
- If CORS error → Check config.php has CORS headers

### Issue: "Price not calculating"
**Check:**
1. Sizes have `base_price` in database
2. Frame types have `price_percentage` in database
3. Console for JavaScript errors

**Fix:**
```sql
-- Check sizes
SELECT id, name, base_price FROM sizes;

-- Check frame types
SELECT id, name, price_percentage FROM frame_types;
```

### Issue: "Images not loading"
**Check:**
1. `/public_html/uploads/` folder exists
2. Folder permissions: `chmod 755 uploads`
3. Image URLs are correct

**Fix:**
```bash
# In cPanel File Manager or via SSH:
cd /home/wiseguy/public_html
mkdir -p uploads/paintings
chmod 755 uploads
chmod 755 uploads/paintings
```

### Issue: "Can't login to admin"
**Default credentials:**
- Username: `admin`
- Email: `admin@bluehand.ro`
- Password: `admin123`

**Reset password in phpMyAdmin:**
```sql
UPDATE users 
SET password_hash = '$2y$10$75gn.yN58TR71pKy8DRUl.73KtOuvRshl6DEp8KzXeQ48aD5XE1bq'
WHERE username = 'admin';
-- This sets password to: admin123
```

---

## 📞 **NEXT STEPS:**

Once everything works:
1. **Add more paintings** (10-20 products)
2. **Add real product photos**
3. **Configure payment gateway** (Netopia)
4. **Set up email** (SMTP or PHP mail)
5. **Test order flow** end-to-end
6. **Launch!** 🎉

---

**START WITH STEP 1: Upload paintings.php and test the API!** 🚀
