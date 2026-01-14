# FAN Courier AWB Integration Guide

## Overview

This integration seamlessly connects your BlueHand Canvas e-commerce platform with FAN Courier's SelfAWB API (v2.0, May 2023) for automated shipping label generation, tracking, and management.

## Features

✅ **Automatic AWB Generation** - Generate shipping labels with one click  
✅ **Real-time Tracking** - Update order status with live tracking information  
✅ **Label Download** - Download printable AWB labels as PDF  
✅ **Smart Calculations** - Automatic weight and dimension calculations based on canvas items  
✅ **COD Support** - Automatic Cash on Delivery configuration for ramburs payments  
✅ **No Breaking Changes** - Completely additive integration that preserves existing functionality  

## Setup Instructions

### 1. Environment Variables

Add these environment variables to your deployment:

```env
# FAN Courier Credentials
VITE_FAN_COURIER_USERNAME=your_username
VITE_FAN_COURIER_PASSWORD=your_password
VITE_FAN_COURIER_CLIENT_ID=your_client_id
```

**How to get credentials:**
1. Contact FAN Courier to create an API account
2. Request SelfAWB API access
3. Obtain your username, password, and client ID

### 2. Database Schema Updates (Optional)

If using Supabase, add these columns to the `orders` table:

```sql
-- AWB tracking fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS awb_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS awb_generated_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS awb_status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS awb_tracking_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS awb_last_update TIMESTAMP;

-- Package details
ALTER TABLE orders ADD COLUMN IF NOT EXISTS package_weight DECIMAL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS package_dimensions JSONB;
```

**Note:** The integration works WITHOUT database changes - AWB data is stored in memory. Database storage is optional for persistence.

## Usage

### For Admins

#### Generating an AWB

1. Open any order in the admin panel (`/admin/orders/{orderId}`)
2. Scroll to the **AWB FAN Courier** section
3. Review the auto-calculated shipping details:
   - **Weight**: Automatically calculated based on canvas items (0.5kg per canvas)
   - **Dimensions**: Calculated from canvas sizes + 10cm padding
   - **COD**: Automatically set if payment method is "Ramburs"
   - **Delivery Method**: Matches order delivery method (Express/Standard)
4. Click **"Generează AWB"**
5. AWB number will appear with tracking link

#### Tracking Shipment

1. Click **"Actualizează"** to refresh tracking status
2. View current status: Pending → In Transit → Delivered
3. Click tracking link to view full history on FAN Courier site

#### Download Label

1. Click **"Descarcă AWB"**
2. PDF label downloads automatically
3. Print and attach to package

### For Developers

#### Manual AWB Generation

```typescript
import { useAdmin } from './context/AdminContext';

const { generateAWB } = useAdmin();

// Generate AWB for an order
const result = await generateAWB(orderId);

if (result.success) {
  console.log('AWB generated:', result.awb);
} else {
  console.error('Error:', result.error);
}
```

#### Update Tracking

```typescript
const { updateAWBTracking } = useAdmin();

await updateAWBTracking(orderId);
```

#### Download Label

```typescript
const { downloadAWBLabel } = useAdmin();

await downloadAWBLabel(orderId);
```

## Architecture

### Files Added

```
/services/fanCourierService.ts       # Core FAN Courier API integration
/components/admin/AWBCard.tsx        # UI component for AWB management
/FAN_COURIER_INTEGRATION.md          # This documentation
```

### Files Modified

```
/context/AdminContext.tsx            # Added AWB methods and OrderItem fields
/lib/dataService.ts                  # Added AWB fields to Order interface
/pages/admin/AdminOrderDetailPage.tsx # Integrated AWB card into UI
```

### No Breaking Changes

✅ All changes are **additive**  
✅ Existing order flow unchanged  
✅ No required migrations  
✅ Works with or without database columns  

## API Details

### Authentication

- Endpoint: `POST https://api.fancourier.ro/login`
- Token cached for 23 hours
- Automatic re-authentication on expiry

### AWB Generation

- Endpoint: `POST https://api.fancourier.ro/intern-awb`
- Creates shipping label with all order details
- Returns AWB number and tracking info

### Tracking

- Endpoint: `GET https://api.fancourier.ro/reports/awb/tracking`
- Real-time shipment status
- Event history with timestamps

### Label Download

- Endpoint: `GET https://api.fancourier.ro/awb/label`
- Supports PDF and HTML formats
- Direct browser download

## Data Flow

```
Order Created
    ↓
Admin Opens Order Details
    ↓
Clicks "Generează AWB"
    ↓
System Calculates:
  - Weight (based on canvas items)
  - Dimensions (based on canvas sizes)
  - COD amount (if payment = ramburs)
  - Recipient address (from order)
    ↓
API Call to FAN Courier
    ↓
AWB Number Returned
    ↓
Stored in Order + Database
    ↓
Admin Can:
  - Track shipment
  - Download label
  - View status updates
```

## Error Handling

### Missing Credentials

```
Error: FAN Courier credentials not configured
Solution: Set environment variables
```

### Invalid Address

```
Error: Failed to parse delivery address
Solution: Ensure order has complete address (street, city, county, zip)
```

### API Failures

All API failures are gracefully handled:
- Error message shown to admin
- Order remains unchanged
- Retry available

## Testing

### Test Order Requirements

For successful AWB generation, orders must have:
- ✅ Valid customer name
- ✅ Valid phone number (Romanian format)
- ✅ Valid email address
- ✅ Complete delivery address (street, number, city, county, zip)
- ✅ At least one canvas item

### Test in Development

1. Set environment variables with FAN Courier test credentials
2. Create a test order
3. Open order details in admin panel
4. Click "Generează AWB"
5. Verify AWB number appears
6. Test tracking update
7. Test label download

## Production Checklist

- [ ] FAN Courier API credentials obtained
- [ ] Environment variables configured
- [ ] Test AWB generation successful
- [ ] Test tracking updates working
- [ ] Test label download working
- [ ] Admin trained on AWB workflow
- [ ] Backup plan for API failures
- [ ] Monitoring configured for AWB errors

## Support

### FAN Courier API Documentation

- Official docs: https://www.fancourier.ro/servicii/self-awb/
- API version: v2.0 (May 2023)
- Support: Contact FAN Courier technical support

### Implementation Support

All AWB functionality is contained in:
- `/services/fanCourierService.ts` - Core API logic
- `/components/admin/AWBCard.tsx` - UI component
- `/context/AdminContext.tsx` - State management

## Future Enhancements

Possible additions (not implemented):

1. **Bulk AWB Generation** - Generate AWBs for multiple orders at once
2. **Automatic Tracking Updates** - Scheduled background tracking updates
3. **Email Notifications** - Send tracking links to customers via email
4. **AWB History** - Track all AWB regenerations and cancellations
5. **Custom Package Types** - Support for envelopes and other package types
6. **Multi-parcel Support** - Split orders into multiple packages

## Troubleshooting

### AWB Generation Fails

1. Check environment variables are set
2. Verify FAN Courier credentials are valid
3. Ensure order has complete address
4. Check API logs in browser console

### Tracking Not Updating

1. Verify AWB number exists
2. Check AWB is active in FAN Courier system
3. Try manual tracking on FAN Courier website
4. Wait a few minutes and retry

### Label Download Fails

1. Verify AWB was generated successfully
2. Check browser allows pop-ups/downloads
3. Try again (temporary network issue)
4. Download from FAN Courier website as backup

---

**Integration Complete** ✅

Your BlueHand Canvas platform now has full FAN Courier AWB integration!
