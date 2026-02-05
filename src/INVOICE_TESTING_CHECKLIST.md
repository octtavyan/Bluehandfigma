# Invoice System - Testing Checklist

**Version:** 2.6.0  
**Last Updated:** 2026-01-31

---

## ✅ Quick Testing Checklist

### 1. Server Health Check

**Test the server is running:**

```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-bbc0c500/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "BlueHand Canvas API is running",
  "version": "2.6.0",
  "lastUpdate": "2026-01-31 - Cleaned up all PDF/Cloudinary code, now serving HTML invoices directly",
  "invoiceStatus": "✅ HTML invoices served via /invoice/view/:orderNumber (no PDF generation)"
}
```

---

### 2. Invoice Generation Test

**Prerequisites:**
- Have at least one order in the database
- Know the order number (e.g., "BHC-001234")

**Steps:**

1. **Go to Admin Panel** → Orders → Click on an order
2. **Check Invoice Status:**
   - If "Generează Factură" button shows → No invoice yet
   - If "Vezi Factură" + "Regenerează" buttons show → Invoice exists

3. **Click "Generează Factură" or "Regenerează"**
4. **Wait for success toast:** "Factura a fost generată și salvată cu succes!"
5. **Verify buttons changed:** Should now show "Vezi Factură" + "Regenerează"

**✅ Pass Criteria:**
- Success toast appears
- Buttons change to "Vezi Factură" + "Regenerează"
- No errors in browser console

---

### 3. Invoice Viewing Test

**Steps:**

1. **Click "Vezi Factură" button**
2. **Modal should open** with invoice displayed in iframe
3. **Check invoice content:**
   - BlueHand Canvas logo visible at top
   - Invoice number format: "TINY XXX"
   - Company info: TINYPODS S.R.L., CUI, Reg. Com.
   - Customer info: Name, email, address
   - Items table with correct data
   - VAT calculation (21%)
   - Total amounts

4. **Click "Deschide în filă nouă"**
5. **Verify invoice opens in new browser tab**
6. **Test Print Preview** (Ctrl+P or Cmd+P)
7. **Close modal** (X button)

**✅ Pass Criteria:**
- Modal opens without errors
- Invoice displays correctly in iframe
- All data is accurate
- New tab opens correctly
- Print preview works
- Modal closes properly

---

### 4. Invoice Regeneration Test

**Steps:**

1. **Note current invoice data** (write down totals, date, etc.)
2. **Click "Regenerează" button**
3. **Wait for success toast**
4. **Click "Vezi Factură" to view**
5. **Verify new invoice:**
   - New generation timestamp
   - Same order data
   - Correct calculations

**✅ Pass Criteria:**
- Success toast appears
- Invoice regenerates successfully
- All data remains correct
- URL updated in database

---

### 5. Direct URL Access Test

**Steps:**

1. **Copy invoice URL from order detail page** or from browser when viewing invoice
2. **Open URL in private/incognito window** (to test public access)
3. **Verify invoice displays** without authentication

**Example URL:**
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-bbc0c500/invoice/view/BHC-001234
```

**✅ Pass Criteria:**
- Invoice displays without login
- No authentication errors
- Invoice is fully readable

---

### 6. Email Integration Test

**Steps:**

1. **Go to order with invoice**
2. **Change order status to "Livrat"** (Delivered)
3. **Check server logs** for email sending confirmation
4. **Check customer email inbox**
5. **Verify email contains:**
   - Order confirmation message
   - Invoice link button
   - Correct order details

6. **Click invoice link in email**
7. **Verify invoice opens correctly**

**✅ Pass Criteria:**
- Email sent successfully
- Invoice link present in email
- Link works when clicked
- Invoice displays correctly

---

### 7. API Endpoint Tests

#### Test 1: Generate Invoice via API

```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-bbc0c500/invoice/generate \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "BHC-TEST-001",
    "orderDate": "2026-01-31T10:00:00.000Z",
    "customerName": "Test Customer",
    "customerEmail": "test@example.com",
    "customerPhone": "+40712345678",
    "customerAddress": "Str. Test 1",
    "customerCity": "București",
    "customerCounty": "Ilfov",
    "total": 299.99,
    "deliveryPrice": 0,
    "items": [{
      "paintingTitle": "Test Painting",
      "size": "30×40 cm",
      "orientation": "portrait",
      "quantity": 1,
      "price": 299.99,
      "total": 299.99
    }]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "invoiceNumber": "TINY TEST-001",
  "publicUrl": "https://xxx.supabase.co/functions/v1/make-server-bbc0c500/invoice/view/BHC-TEST-001",
  "cloudinaryUrl": "https://xxx.supabase.co/functions/v1/make-server-bbc0c500/invoice/view/BHC-TEST-001"
}
```

#### Test 2: Get Invoice Metadata

```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-bbc0c500/invoice/BHC-TEST-001 \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Expected Response:**
```json
{
  "success": true,
  "invoice": {
    "invoiceNumber": "TINY TEST-001",
    "orderNumber": "BHC-TEST-001",
    "publicUrl": "https://xxx.supabase.co/functions/v1/make-server-bbc0c500/invoice/view/BHC-TEST-001",
    "totalWithoutVAT": "247.93",
    "vatAmount": "52.06",
    "totalAmount": "299.99"
  }
}
```

#### Test 3: View Invoice HTML

```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-bbc0c500/invoice/view/BHC-TEST-001
```

**Expected Response:** HTML document starting with:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Factură TINY TEST-001</title>
  ...
```

**✅ Pass Criteria:**
- All API calls return 200 status
- Responses match expected format
- HTML invoice is valid and complete

---

### 8. VAT Calculation Verification

**Test Case 1: Single Item**
- Item price (with VAT): 299.99 RON
- Expected without VAT: 247.93 RON
- Expected VAT (21%): 52.06 RON

**Test Case 2: Multiple Items + Delivery**
- Item 1: 274.99 RON (without VAT: 227.26, VAT: 47.73)
- Delivery: 25.00 RON (without VAT: 20.66, VAT: 4.34)
- Total: 299.99 RON (without VAT: 247.92, VAT: 52.07)

**Verification Steps:**
1. Generate invoice with known prices
2. Check invoice totals section
3. Manually verify calculations
4. Ensure rounding is correct (2 decimals)

**✅ Pass Criteria:**
- All VAT calculations are accurate
- Totals add up correctly
- No rounding errors

---

### 9. Browser Compatibility Test

**Test in multiple browsers:**
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile Safari (iPhone)
- ✅ Chrome Mobile (Android)

**For each browser:**
1. Open invoice in modal
2. Open invoice in new tab
3. Test print preview
4. Verify layout and styling

**✅ Pass Criteria:**
- Invoice displays correctly in all browsers
- No layout issues
- Print preview works
- Mobile responsive

---

### 10. Performance Test

**Measure generation time:**

1. **Start timer**
2. **Click "Generează Factură"**
3. **Stop timer when success toast appears**

**Acceptable Times:**
- ⚡ Excellent: < 1 second
- ✅ Good: 1-2 seconds
- ⚠️ Acceptable: 2-5 seconds
- ❌ Too slow: > 5 seconds

**Test with:**
- Single item order
- Multiple items (5+)
- Large order (10+ items)

**✅ Pass Criteria:**
- Most invoices generate in < 2 seconds
- No timeout errors
- Consistent performance

---

### 11. Error Handling Test

#### Test 1: Missing Order Data

**Steps:**
1. Try to generate invoice for non-existent order
2. Verify error message appears
3. Check no invoice was created

#### Test 2: Invalid Order Number

**Steps:**
1. Try to access: `/invoice/view/INVALID-ORDER`
2. Verify proper error response
3. Check error message is user-friendly

#### Test 3: Network Failure

**Steps:**
1. Disable network during invoice generation
2. Verify error toast appears
3. Re-enable network and retry
4. Verify retry works

**✅ Pass Criteria:**
- All errors handled gracefully
- Clear error messages shown
- No system crashes
- Retry functionality works

---

### 12. Database Verification

**Check database after invoice generation:**

```sql
-- Check order has invoice URL
SELECT orderNumber, invoiceUrl 
FROM orders 
WHERE orderNumber = 'BHC-TEST-001';

-- Expected result:
-- BHC-TEST-001 | https://xxx.supabase.co/functions/v1/make-server-bbc0c500/invoice/view/BHC-TEST-001
```

**Check KV store:**

```typescript
// In admin console or via API
const invoice = await kv.get('invoice:BHC-TEST-001');
console.log(invoice);

// Should return invoice object with html, publicUrl, etc.
```

**✅ Pass Criteria:**
- Invoice URL saved to orders table
- Invoice data stored in KV store
- Data matches generated invoice

---

### 13. Security Test

**Test 1: Public Access (Allowed)**
- Access invoice URL without authentication
- Should work (invoices are public for customer convenience)

**Test 2: Admin Endpoints (Protected)**
```bash
# Try to generate invoice without auth
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-bbc0c500/invoice/generate \
  -H "Content-Type: application/json" \
  -d '{...}'

# Should work with publicAnonKey (current design)
# Or return 401 if you want to restrict (optional)
```

**✅ Pass Criteria:**
- Public invoice viewing works
- No sensitive data exposed
- Admin actions properly secured

---

### 14. Load Test (Optional)

**Stress test invoice generation:**

1. Generate 10 invoices simultaneously
2. Monitor server resources
3. Check all invoices generated correctly
4. Verify no data corruption

**Tools:**
- Apache Bench (ab)
- Artillery
- Manual browser tabs

**✅ Pass Criteria:**
- System handles concurrent requests
- All invoices generate successfully
- No performance degradation

---

## Common Issues & Solutions

### Issue 1: Invoice displays blank

**Possible Causes:**
- HTML not properly stored
- KV store error
- Order number mismatch

**Solution:**
1. Check browser console for errors
2. Regenerate invoice
3. Verify order number is correct
4. Check KV store directly

---

### Issue 2: VAT calculations wrong

**Possible Causes:**
- Item prices not including VAT
- Rounding errors
- Wrong VAT rate

**Solution:**
1. Verify VAT_RATE = 0.21 in invoice.tsx
2. Check item prices in order data
3. Recalculate manually
4. Regenerate invoice

---

### Issue 3: Invoice button not showing

**Possible Causes:**
- Invoice URL not in database
- Frontend not detecting invoice
- State management issue

**Solution:**
1. Refresh page
2. Check database for invoiceUrl
3. Regenerate invoice
4. Clear browser cache

---

## Testing Completion Checklist

Mark each test as complete:

- [ ] 1. Server Health Check
- [ ] 2. Invoice Generation Test
- [ ] 3. Invoice Viewing Test
- [ ] 4. Invoice Regeneration Test
- [ ] 5. Direct URL Access Test
- [ ] 6. Email Integration Test
- [ ] 7. API Endpoint Tests
- [ ] 8. VAT Calculation Verification
- [ ] 9. Browser Compatibility Test
- [ ] 10. Performance Test
- [ ] 11. Error Handling Test
- [ ] 12. Database Verification
- [ ] 13. Security Test
- [ ] 14. Load Test (Optional)

---

## Final Verification

**Before marking system as production-ready:**

✅ All critical tests pass  
✅ No console errors  
✅ Performance is acceptable  
✅ Error handling works  
✅ Database updates correctly  
✅ Emails sent successfully  
✅ Cross-browser compatible  
✅ Mobile responsive  
✅ Documentation complete  

**Status:** Ready for Production 🚀

---

## Quick Debug Commands

**Check server logs:**
```bash
# Supabase CLI
supabase functions logs make-server-bbc0c500

# Or view in Supabase Dashboard → Edge Functions → Logs
```

**Test invoice route directly:**
```bash
# Browser console
fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-bbc0c500/invoice/view/BHC-001234')
  .then(r => r.text())
  .then(html => console.log(html))
```

**Check KV store:**
```typescript
// In admin context
import * as kv from './supabase/functions/server/kv_store.tsx';
const invoice = await kv.get('invoice:BHC-001234');
console.log(invoice);
```

---

**Happy Testing! 🎉**
