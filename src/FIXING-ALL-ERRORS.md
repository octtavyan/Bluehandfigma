# 🔧 FIXING ALL ERRORS - COMPLETE GUIDE

## 📊 **Error Summary:**

1. ❌ **Paintings API**: `Failed to fetch` → File missing or CORS issue
2. ❌ **Orders API**: `Failed to fetch` → File missing or CORS issue  
3. ✅ **Sizes Service**: FIXED! (Added create/update/delete methods)

---

## 🚀 **SOLUTION: Upload Missing PHP Files**

### **Step 1: Upload paintings.php**

**From:** `/server-deploy/api/paintings.php`  
**To:** `/public_html/api/paintings.php`

**Test:** https://bluehand.ro/api/paintings  
**Expected:** `{"paintings": []}`

---

### **Step 2: Create orders.php**

You need to create `orders.php` in `/public_html/api/` folder.

**Here's the complete orders.php file:**

```php
<?php
// BlueHand Canvas - Orders API
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';

// Extract path
$path = preg_replace('#\?.*$#', '', $requestUri);
$path = preg_replace('#^/api/#', '', $path);
$path = trim($path, '/');

error_log("📦 Orders Handler: METHOD={$method}, PATH={$path}");

try {
    $db = getDB();
    
    // GET /api/orders - Get all orders
    if ($method === 'GET' && $path === 'orders') {
        // Admin only
        $auth = requireAuth();
        
        $stmt = $db->query("
            SELECT * FROM orders 
            ORDER BY created_at DESC
        ");
        $orders = $stmt->fetchAll();
        
        // Parse JSON fields
        foreach ($orders as &$order) {
            $order['items'] = json_decode($order['items'] ?? '[]', true);
        }
        
        jsonResponse(['orders' => $orders]);
    }
    
    // GET /api/orders/{id} - Get single order
    elseif ($method === 'GET' && preg_match('#^orders/([a-zA-Z0-9-]+)$#', $path, $matches)) {
        $orderId = $matches[1];
        
        $stmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();
        
        if (!$order) {
            jsonResponse(['error' => 'Order not found'], 404);
        }
        
        // Parse JSON fields
        $order['items'] = json_decode($order['items'] ?? '[]', true);
        
        jsonResponse(['order' => $order]);
    }
    
    // POST /api/orders - Create order
    elseif ($method === 'POST' && $path === 'orders') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $id = 'order-' . time() . '-' . uniqid();
        $orderNumber = 'BH' . date('Ymd') . rand(1000, 9999);
        
        $stmt = $db->prepare("
            INSERT INTO orders (
                id, order_number, customer_name, customer_email, customer_phone,
                delivery_address, delivery_city, delivery_county, delivery_postal_code,
                delivery_option, payment_method, payment_status,
                items, subtotal, delivery_cost, total,
                status, notes, created_at, updated_at
            ) VALUES (
                :id, :order_number, :customer_name, :customer_email, :customer_phone,
                :delivery_address, :delivery_city, :delivery_county, :delivery_postal_code,
                :delivery_option, :payment_method, :payment_status,
                :items, :subtotal, :delivery_cost, :total,
                :status, :notes, NOW(), NOW()
            )
        ");
        
        $stmt->execute([
            'id' => $id,
            'order_number' => $orderNumber,
            'customer_name' => $data['customer_name'],
            'customer_email' => $data['customer_email'],
            'customer_phone' => $data['customer_phone'],
            'delivery_address' => $data['delivery_address'],
            'delivery_city' => $data['delivery_city'] ?? '',
            'delivery_county' => $data['delivery_county'] ?? '',
            'delivery_postal_code' => $data['delivery_postal_code'] ?? '',
            'delivery_option' => $data['delivery_option'],
            'payment_method' => $data['payment_method'],
            'payment_status' => $data['payment_status'] ?? 'pending',
            'items' => json_encode($data['items']),
            'subtotal' => $data['subtotal'],
            'delivery_cost' => $data['delivery_cost'],
            'total' => $data['total'],
            'status' => 'pending',
            'notes' => $data['notes'] ?? ''
        ]);
        
        // Fetch created order
        $stmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->execute([$id]);
        $order = $stmt->fetch();
        $order['items'] = json_decode($order['items'], true);
        
        jsonResponse([
            'success' => true,
            'order' => $order,
            'order_number' => $orderNumber
        ], 201);
    }
    
    // PUT /api/orders/{id}/status - Update order status
    elseif ($method === 'PUT' && preg_match('#^orders/([a-zA-Z0-9-]+)/status$#', $path, $matches)) {
        $auth = requireAuth();
        $orderId = $matches[1];
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $db->prepare("
            UPDATE orders 
            SET status = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$data['status'], $orderId]);
        
        jsonResponse(['success' => true]);
    }
    
    else {
        jsonResponse(['error' => 'Not found'], 404);
    }
    
} catch (PDOException $e) {
    error_log('Orders API Error: ' . $e->getMessage());
    jsonResponse(['error' => 'Database error', 'message' => $e->getMessage()], 500);
} catch (Exception $e) {
    error_log('Orders API Error: ' . $e->getMessage());
    jsonResponse(['error' => 'Server error', 'message' => $e->getMessage()], 500);
}
```

---

### **Step 3: Test The APIs**

After uploading both files, test:

1. **Paintings API:**
   ```
   https://bluehand.ro/api/paintings
   ```
   Should return: `{"paintings": []}`

2. **Orders API:**
   ```
   https://bluehand.ro/api/orders
   ```
   Should return: `{"error": "Unauthorized"}` (because you need admin token)

---

## ✅ **What's Already Fixed:**

### **1. Sizes Service** ✓
- Added `create()` method
- Added `update()` method
- Added `delete()` method
- Properly transforms camelCase ↔ snake_case

The error `canvasSizesService.create is not a function` is now **FIXED!**

---

## 📋 **Quick Upload Checklist:**

- [ ] Upload `paintings.php` to `/public_html/api/`
- [ ] Create `orders.php` in `/public_html/api/`
- [ ] Test paintings API
- [ ] Test orders API
- [ ] Refresh your app

---

## 🔍 **If Still Getting CORS Errors:**

### **Check 1: Verify File Exists**
```bash
# In cPanel File Manager or via SSH
ls -la /home/wiseguy/public_html/api/
```

Should show:
- config.php
- categories.php
- frame-types.php
- sizes.php
- paintings.php ← NEW
- orders.php ← NEW

### **Check 2: File Permissions**
```bash
chmod 644 /home/wiseguy/public_html/api/paintings.php
chmod 644 /home/wiseguy/public_html/api/orders.php
```

### **Check 3: Test with curl**
```bash
curl -I https://bluehand.ro/api/paintings
```

Should show:
```
HTTP/2 200
access-control-allow-origin: *
content-type: application/json
```

### **Check 4: Apache mod_headers**
If CORS still doesn't work, add to `.htaccess` in `/public_html/api/`:

```apache
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
</IfModule>
```

---

## 🎯 **After Fixing:**

Your admin panel will be able to:
- ✅ Load paintings (even if empty)
- ✅ Add new paintings
- ✅ Edit paintings
- ✅ Delete paintings
- ✅ Add new sizes
- ✅ Edit sizes
- ✅ Delete sizes
- ✅ View orders
- ✅ Update order status

---

## 📞 **Test Steps:**

1. Upload paintings.php and orders.php
2. Open your app
3. Go to Admin → Paintings
4. Click "Adaugă Tablou"
5. Fill form and save
6. Should work without errors!

---

**Upload these 2 files and all errors will be fixed!** 🚀
