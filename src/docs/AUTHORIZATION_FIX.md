# Authorization Header Fix - 401 Error Resolved ✅

## Problem

After implementing server-side uploads, the upload was failing with:

```
Upload error: {
  "code": 401,
  "message": "Missing authorization header"
}
❌ Upload failed: Error: Failed to upload paintings/image.jpg: Unknown error
```

## Root Cause

The frontend was calling the server endpoint **without** the required `Authorization` header. Supabase Edge Functions require authentication even for "public" endpoints.

## Why It Happened

When we moved from direct Supabase uploads to server-side uploads, we forgot to add the authorization header to the fetch requests.

**Code before fix:**
```typescript
// ❌ Missing Authorization header
const response = await fetch(`${SERVER_URL}/storage/upload`, {
  method: 'POST',
  body: formData
});
```

## Solution

Added the `Authorization: Bearer <publicAnonKey>` header to all fetch requests to the server endpoints.

**Code after fix:**
```typescript
// ✅ With Authorization header
const response = await fetch(`${SERVER_URL}/storage/upload`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${publicAnonKey}`
  },
  body: formData
});
```

## Changes Made

### File: `/lib/optimizedStorage.ts`

#### 1. Added publicAnonKey import
```typescript
import { projectId, publicAnonKey } from '../utils/supabase/info';
```

#### 2. Updated uploadFile() function
```typescript
async function uploadFile(
  path: string,
  blob: Blob
): Promise<string> {
  const formData = new FormData();
  formData.append('path', path);
  formData.append('file', blob);

  const response = await fetch(`${SERVER_URL}/storage/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}` // ✅ Added this
    },
    body: formData
  });

  // ... rest of the function
}
```

#### 3. Updated deleteOptimizedImage() function
```typescript
export async function deleteOptimizedImage(
  urls: UploadedImageUrls
): Promise<void> {
  // ... extract paths ...

  const response = await fetch(`${SERVER_URL}/storage/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}` // ✅ Added this
    },
    body: JSON.stringify({ paths })
  });

  // ... rest of the function
}
```

## How Authorization Works

### Architecture Flow
```
Frontend
  ↓
  Sends: Authorization: Bearer <publicAnonKey>
  ↓
Edge Function (receives request)
  ↓
  Verifies: Token is valid
  ✅ Authenticated
  ↓
  Uses: SUPABASE_SERVICE_ROLE_KEY (server-side)
  ↓
Supabase Storage
  ✅ Upload successful
```

### Security Layers

1. **Frontend → Server**: Uses `publicAnonKey` (safe to expose)
2. **Server → Storage**: Uses `SUPABASE_SERVICE_ROLE_KEY` (never exposed)

This means:
- ✅ Frontend can call server endpoints (with anon key)
- ✅ Server has full admin access (with service role key)
- ✅ Service role key stays secure on server
- ✅ No RLS policies needed

## Why We Need Both Keys

| Key | Where | Purpose | Exposed? |
|-----|-------|---------|----------|
| `publicAnonKey` | Frontend | Authenticate requests to Edge Function | ✅ Yes (safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Admin access to Storage | ❌ No (secret) |

## Testing

### Before Fix
```
❌ 401 Unauthorized
❌ Missing authorization header
❌ Upload failed
```

### After Fix
```
✅ Storage bucket already exists (409)
🖼️ Optimizing image...
💾 Uploading optimized image (saved 92%)...
☁️ Uploading to Supabase...
✅ File uploaded: paintings/img-original.jpg
✅ File uploaded: paintings/img-medium.jpg
✅ File uploaded: paintings/img-thumbnail.jpg
✅ Upload complete!
```

## Files Modified

1. `/lib/optimizedStorage.ts` - Added Authorization headers to upload/delete

## Related Documentation

- `/docs/STORAGE_BUCKET_FIX.md` - Original bucket creation fix
- `/docs/RLS_UPLOAD_FIX_SUMMARY.md` - Server-side upload implementation
- `/docs/QUICK_FIX_REFERENCE.md` - Quick troubleshooting guide

## Status: ✅ COMPLETE

Authorization header now properly included in all storage requests. Uploads work perfectly!

---

**Date**: December 27, 2024  
**Issue**: 401 Missing authorization header  
**Resolution**: Added `Authorization: Bearer ${publicAnonKey}` to fetch requests  
**Impact**: Image uploads now fully functional
