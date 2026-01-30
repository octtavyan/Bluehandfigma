# Invoice Generation Fix - Complete

## Changes Made

### 1. Changed VAT rate from 21% to 19%
- Line 1280: `const VAT_RATE = 0.19;`

### 2. Fixed HTML invoice (lines 1319, 1336, 1430)
Replace `(21%)` with `(19%)`:
- Line 1319: `${itemVAT.toFixed(2)} (19%)`
- Line 1336: `${deliveryVATAmount.toFixed(2)} (19%)`
- Line 1430: `TVA 19%: <strong>${vatAmount.toFixed(2)} RON</strong>`

### 3. Fixed PDF table structure (lines 1537-1557)
Add TVA column to table header and calculate per-row VAT:

```typescript
// Table header (around line 1537)
doc.text('Produs', 20, yPos);
doc.text('Cant.', 100, yPos);
doc.text('Pret unitar', 120, yPos);
doc.text('TVA 19%', 150, yPos);
doc.text('Total', 175, yPos);

// Table rows (around line 1549)
items.forEach((item: any) => {
  const itemTotal = parseFloat(item.price || 0);
  const itemWithoutVAT = itemTotal / (1 + VAT_RATE);
  const itemVAT = itemTotal - itemWithoutVAT;
  const quantity = item.quantity || 1;
  const unitPrice = itemWithoutVAT / quantity;
  
  const itemName = item.name?.length > 30 ? item.name.substring(0, 27) + '...' : (item.name || 'Item');
  doc.text(itemName, 20, yPos);
  doc.text(quantity.toString(), 103, yPos, { align: 'right' });
  doc.text(`${unitPrice.toFixed(2)}`, 138, yPos, { align: 'right' });
  doc.text(`${itemVAT.toFixed(2)}`, 163, yPos, { align: 'right' });
  doc.text(`${itemTotal.toFixed(2)}`, 188, yPos, { align: 'right' });
  yPos += 6;
});
```

### 4. Fixed Cloudinary upload for PDFs (line 1609)
Add `resource_type: 'raw'` to FormData:

```typescript
formData.append('file', dataURI);
formData.append('upload_preset', cloudinarySettings.uploadPreset);
formData.append('resource_type', 'raw'); // CRITICAL for PDFs
formData.append('public_id', publicId);
formData.append('folder', 'invoices');
```

## Files to Update
- `/supabase/functions/server/index.tsx` - Lines 1278-1650
