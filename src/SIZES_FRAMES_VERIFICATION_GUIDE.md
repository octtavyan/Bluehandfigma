# 🔍 **Checking Supabase: Sizes & Frame Types**

## 📊 **Why This Matters**

The frontend **critically depends** on these tables:
- **canvas_sizes** → Product pricing, size options, frame availability
- **frame_types** → Frame selection options in ordering flow

If the structure doesn't match, the app will break! ❌

---

## 🎯 **What the Frontend Expects**

### **canvas_sizes Table Structure:**

```typescript
{
  id: string;              // UUID
  width: number;           // e.g., 30, 40, 50
  height: number;          // e.g., 40, 60, 70
  price: number;           // Base price (e.g., 150)
  discount: number;        // Discount % (e.g., 10 = 10% off)
  isActive: boolean;       // true/false
  supportsPrintCanvas: boolean;   // NEW! Can this size be used for Print Canvas?
  supportsPrintHartie: boolean;   // NEW! Can this size be used for Print Hartie?
  framePrices: {          // CRITICAL: Frame pricing per size
    "Fara Rama": {
      price: 0,
      discount: 0,
      availableForCanvas: true,
      availableForPrint: true
    },
    "Rama Neagra": {
      price: 25,
      discount: 0,
      availableForCanvas: true,
      availableForPrint: true
    },
    // ... etc for all frame types
  }
}
```

### **frame_types Table Structure:**

```typescript
{
  id: string;       // UUID
  name: string;     // "Fara Rama", "Rama Neagra", etc.
  isActive: boolean; // true/false
  order: number;    // Display order (1, 2, 3...)
}
```

---

## ✅ **STEP 1: Run Verification Script**

### **Open Supabase SQL Editor:**
👉 https://supabase.com/dashboard/project/uarntnjpoikeoigyatao

### **Run This File:**
Copy and paste all SQL from: **`/verify_sizes_frames_schema.sql`**

### **What It Does:**
1. ✅ Checks if tables exist
2. ✅ Shows current column structure
3. ✅ Displays all existing data
4. ✅ Adds missing columns if needed
5. ✅ Shows expected vs actual schema
6. ✅ Inserts sample data if tables are empty
7. ✅ Checks RLS status

---

## 🔍 **STEP 2: Check Results**

### **Look for These Messages:**

#### ✅ **Good Signs:**
```
✅ canvas_sizes table EXISTS
✅ frame_types table EXISTS
✓ supports_print_canvas column already exists
✓ supports_print_hartie column already exists
✓ frame_prices column already exists
```

#### ⚠️ **Warning Signs:**
```
❌ canvas_sizes table DOES NOT EXIST
❌ Added frame_prices column (was missing)
```

---

## 🔧 **STEP 3: Common Issues & Fixes**

### **Issue 1: Tables Don't Exist**
**Fix**: Run the full setup script `/supabase_setup.sql`

### **Issue 2: Missing Columns**
**Fix**: The verification script auto-adds them! Just run it.

### **Issue 3: frame_prices is NULL or Wrong Format**
**Fix**: Run this SQL:
```sql
UPDATE canvas_sizes 
SET frame_prices = '{
  "Fara Rama": {"price": 0, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
  "Rama Neagra": {"price": 25, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
  "Rama Alba": {"price": 25, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
  "Rama Lemn Natural": {"price": 35, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
  "Rama Aurie": {"price": 40, "discount": 0, "availableForCanvas": true, "availableForPrint": true}
}'::jsonb
WHERE id = 'YOUR_SIZE_ID_HERE';
```

### **Issue 4: Old Column Names**
If your existing Supabase uses different column names, let me know! I can update the data service mapping.

Common old names:
- `size_width` → Should be `width`
- `size_height` → Should be `height`
- `is_active_status` → Should be `is_active`

---

## 📊 **Database Column Mapping**

### **Supabase (snake_case) ↔ Frontend (camelCase)**

```typescript
// canvas_sizes table mapping:
id                    → id
width                 → width
height                → height
price                 → price
discount              → discount
is_active             → isActive
supports_print_canvas → supportsPrintCanvas
supports_print_hartie → supportsPrintHartie
frame_prices          → framePrices

// frame_types table mapping:
id        → id
name      → name
is_active → isActive
order     → order
```

This mapping is handled automatically in `/lib/supabaseDataService.ts`!

---

## 🎯 **STEP 4: Test in App**

### **Go to Test Page:**
```
/supabase-test
```

### **What to Check:**
1. **canvas_sizes table** shows rows with data
2. **frame_types table** shows rows with frame names
3. **frame_prices** column shows JSON structure
4. No error messages

---

## 🛠️ **Example: Correct Data Structure**

### **canvas_sizes Example Row:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "width": 40,
  "height": 60,
  "price": 200,
  "discount": 0,
  "is_active": true,
  "supports_print_canvas": true,
  "supports_print_hartie": true,
  "frame_prices": {
    "Fara Rama": {
      "price": 0,
      "discount": 0,
      "availableForCanvas": true,
      "availableForPrint": true
    },
    "Rama Neagra": {
      "price": 35,
      "discount": 0,
      "availableForCanvas": true,
      "availableForPrint": true
    }
  }
}
```

### **frame_types Example Row:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "name": "Rama Neagra",
  "is_active": true,
  "order": 2
}
```

---

## ⚠️ **Critical: frame_prices Structure**

The `frame_prices` MUST be JSONB with this exact structure:

```json
{
  "Frame Name": {
    "price": number,
    "discount": number,
    "availableForCanvas": boolean,
    "availableForPrint": boolean
  }
}
```

**Frame names MUST match** the names in `frame_types` table!

---

## 🔄 **If You Have Existing Data**

### **Scenario 1: You have sizes but no frame_prices**
Run the verification script - it will add the column with default empty object.
Then update each size with proper frame pricing.

### **Scenario 2: You have old schema (different column names)**
Tell me your current column names and I'll adapt the data service!

### **Scenario 3: You have correct schema but no data**
The verification script will insert sample data automatically.

---

## 🚨 **Common Frontend Errors if Schema Wrong**

### **Error: "Cannot read property 'price' of undefined"**
**Cause**: `framePrices` is NULL or missing
**Fix**: Update frame_prices column to proper JSON structure

### **Error: "Size not found"**
**Cause**: No active sizes in database
**Fix**: Ensure `is_active` = true for at least one size

### **Error: "Frame type not available"**
**Cause**: Frame name in `frame_prices` doesn't match `frame_types.name`
**Fix**: Make sure frame names match exactly (case-sensitive!)

---

## 📝 **Quick Checklist**

Before testing your app:

- [ ] `canvas_sizes` table exists
- [ ] `frame_types` table exists
- [ ] `canvas_sizes` has columns: width, height, price, discount, is_active, supports_print_canvas, supports_print_hartie, frame_prices
- [ ] `frame_types` has columns: id, name, is_active, order
- [ ] `frame_prices` is JSONB (not text/varchar)
- [ ] At least 1 size has `is_active` = true
- [ ] At least 1 frame has `is_active` = true
- [ ] Frame names in both tables match exactly
- [ ] RLS is disabled OR public read policies exist

---

## 🎯 **Next Steps**

1. **Run**: `/verify_sizes_frames_schema.sql` in Supabase
2. **Check**: Results for any warnings/errors
3. **Test**: Go to `/supabase-test` in your app
4. **Verify**: Data shows correctly in test page
5. **Launch**: App should now work perfectly!

---

## 💡 **Need Help?**

If the verification script shows issues or you have existing data with different structure, share:

1. Screenshot of SQL verification results
2. Current column names from your tables
3. Sample row from your existing data

I'll adapt the data service to match your exact schema! 🚀
