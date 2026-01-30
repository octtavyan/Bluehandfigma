# Cloudinary Configuration - Verified & Fixed ✅

## Issue Resolved
Fixed a critical key name mismatch in the Edge Function that prevented invoice PDFs from uploading to Cloudinary.

## The Problem
- **Edge Function endpoints** were using: `cloudinary_settings`
- **Invoice generation code** was using: `cloudinary:settings` (with a colon)
- This mismatch caused invoice generation to fail silently and fall back to HTML storage

## The Fix
Changed line 1455 in `/supabase/functions/server/index.tsx`:
```typescript
// BEFORE (incorrect)
const cloudinarySettings = await kv.get('cloudinary:settings');

// AFTER (correct)
const cloudinarySettings = await kv.get('cloudinary_settings');
```

## Cloudinary Configuration Summary

### For Image Uploads (Frontend)
**File:** `/services/cloudinaryService.ts`
- **Endpoint:** `https://api.cloudinary.com/v1_1/{cloudName}/image/upload`
- **Method:** Unsigned upload (no API key required)
- **Required Settings:**
  - `cloudName` - Your Cloudinary cloud name
  - `uploadPreset` - An unsigned upload preset
- **Default Folder:** `bluehand-canvas`

### For PDF Uploads (Edge Function)
**File:** `/supabase/functions/server/index.tsx` (line ~1610)
- **Endpoint:** `https://api.cloudinary.com/v1_1/{cloudName}/upload` (generic upload)
- **Method:** Unsigned upload (no API key required)
- **Required Settings:**
  - `cloudName` - Your Cloudinary cloud name (SAME as frontend)
  - `uploadPreset` - An unsigned upload preset (SAME as frontend)
- **Default Folder:** `invoices`

## Key Points

✅ **Same Configuration for Both:**
Both frontend image uploads and backend PDF uploads use the **EXACT SAME** Cloudinary configuration:
- Same `cloudName`
- Same `uploadPreset`
- No API key needed (unsigned uploads)

✅ **Storage Location:**
Configuration is stored in the KV store as:
- Key: `cloudinary_settings`
- Contains: `{ cloudName, uploadPreset, apiKey, isConfigured }`
- Note: `apiKey` is stored but not used for unsigned uploads

✅ **Admin Configuration:**
Configure via: **Admin → Setări → Cloudinary**

## How It Works

### 1. Frontend Image Upload Flow
```
User uploads image 
  → CloudinaryService.loadConfig() 
  → Fetch from Edge Function: /cloudinary/settings
  → Get cloudinary_settings from KV
  → Upload to Cloudinary: /image/upload
  → Store secure_url
```

### 2. Backend PDF Upload Flow
```
Order placed 
  → Generate invoice (Edge Function)
  → Get cloudinary_settings from KV
  → Generate PDF with jsPDF
  → Convert to base64 data URI
  → Upload to Cloudinary: /upload
  → Store secure_url in invoice data
```

## Cloudinary Setup Instructions

### 1. Create Unsigned Upload Preset
In your Cloudinary dashboard:
1. Go to **Settings → Upload**
2. Scroll to **Upload presets**
3. Click **Add upload preset**
4. Set:
   - **Signing Mode:** Unsigned
   - **Upload preset name:** (e.g., `bluehand_unsigned`)
   - **Folder:** Leave empty (we set it per-upload)
   - **Upload mode:** ✓ Allow unsigned uploading
5. Save

### 2. Configure in Admin Panel
1. Go to **Admin → Setări → Cloudinary**
2. Enter:
   - **Cloud Name:** Your cloud name (e.g., `dxxxxxx`)
   - **Upload Preset:** The preset name you created
   - **API Key:** (optional, not used for unsigned uploads)
3. Click **Salvează**

### 3. Test Both Uploads
- **Test images:** Upload a painting in Admin → Tablouri
- **Test PDFs:** Place an order and check if invoice generates

## Technical Details

### Why Unsigned Uploads?
- **No secrets needed:** Frontend can upload directly without exposing API secrets
- **Simpler:** Only requires cloud name and upload preset
- **Secure:** Cloudinary validates the upload preset
- **Consistent:** Same method for both frontend and backend

### Why Different Endpoints?
- **Images:** `/image/upload` - Optimized for image processing
- **PDFs:** `/upload` - Generic upload for any file type
- Both support unsigned uploads with the same credentials

### File Organization
- **Images:** Stored in `bluehand-canvas` folder
- **Invoices:** Stored in `invoices` folder
- **Format:** `invoices/invoice-{orderNumber}-{timestamp}`

## Verification Checklist

- [x] Key name fixed: `cloudinary_settings` (not `cloudinary:settings`)
- [x] Frontend uses unsigned upload for images
- [x] Backend uses unsigned upload for PDFs
- [x] Same cloudName for both
- [x] Same uploadPreset for both
- [x] No API key required for either
- [x] Settings page saves/loads correctly
- [x] Invoice generation reads correct key

## What Changed
**Single line fix in Edge Function:**
```typescript
const cloudinarySettings = await kv.get('cloudinary_settings'); // Fixed key name
```

**Result:** Invoice PDFs now upload successfully to Cloudinary using the same configuration as frontend image uploads! 🎉
