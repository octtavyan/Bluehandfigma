# Quick Fix Reference - Storage Upload Errors

## 🔴 Error: "Missing authorization header" (401)

**What it means**: Server endpoint needs Authorization header.

**Solution**: ✅ **ALREADY FIXED** - Added Bearer token to requests!

**How it works now**:
```typescript
fetch('/storage/upload', {
  headers: {
    'Authorization': `Bearer ${publicAnonKey}`
  }
})
```

---

## 🔴 Error: "new row violates row-level security policy"

**What it means**: Frontend trying to upload with anon key, but RLS blocks it.

**Solution**: ✅ **ALREADY FIXED** - Now uploads via server with admin key!

**How it works now**:
```
Your Code → Server Endpoint → Supabase (admin key) → ✅ Success
```

---

## 🟡 Error: "The resource already exists" (409)

**What it means**: Bucket already created (which is good!)

**Solution**: ✅ **ALREADY FIXED** - 409 now treated as success!

**What you'll see now**:
```
✅ Storage bucket already exists (409)
```

---

## 🟡 Warning: "Multiple GoTrueClient instances detected"

**What it means**: Creating multiple Supabase clients.

**Impact**: Mostly harmless, but fixed anyway!

**Solution**: ✅ **ALREADY FIXED** - Using singleton pattern!

---

## How To Use Image Upload Now

### Simple Example
```typescript
import { uploadOptimizedImage } from '../lib/optimizedStorage';

// That's it! No credentials needed!
const urls = await uploadOptimizedImage(file, 'paintings');

console.log(urls.thumbnail);  // For grids
console.log(urls.medium);     // For detail pages
console.log(urls.original);   // For downloads
```

### With Hook
```typescript
import { useOptimizedImageUpload } from '../hooks/useOptimizedImageUpload';

const { uploadImage, isUploading, uploadProgress } = useOptimizedImageUpload();

const handleUpload = async (file: File) => {
  const urls = await uploadImage(file, 'paintings');
  // Save urls to database
};
```

---

## Server Endpoints Reference

### Upload
```
POST /make-server-bbc0c500/storage/upload
FormData: { file, path }
Returns: { success, url, path }
```

### Delete
```
POST /make-server-bbc0c500/storage/delete
Body: { paths: string[] }
Returns: { success, deletedCount }
```

### Init Bucket
```
POST /make-server-bbc0c500/storage/init-bucket
Returns: { success, message, bucket }
```

---

## Troubleshooting

### Upload Still Fails?

1. **Check server is running**
   ```
   GET /make-server-bbc0c500/health
   Should return: { status: "ok" }
   ```

2. **Check environment variables**
   - SUPABASE_URL ✓
   - SUPABASE_SERVICE_ROLE_KEY ✓

3. **Check bucket exists**
   - Go to Supabase Dashboard → Storage
   - Look for: `make-bbc0c500-images`
   - If missing: Click "Inițializează Storage Bucket" in admin

4. **Check file size**
   - Must be < 10MB
   - Optimizer automatically compresses

---

## What Changed?

| Before | After |
|--------|-------|
| Frontend uploads directly | Frontend → Server → Storage |
| Needs RLS policies | No RLS needed (admin key) |
| Pass credentials everywhere | No credentials needed |
| Scary 409 errors | 409 = success ✅ |
| Multiple clients warning | Single client instance |

---

## Status: ALL FIXED ✅

You can now:
- ✅ Upload images without RLS errors
- ✅ See clean console logs
- ✅ Use simpler API (no credentials)
- ✅ Have better security (server-side)

---

**Need Help?** Check full documentation:
- `/docs/STORAGE_BUCKET_FIX.md` - Complete implementation details
- `/docs/RLS_UPLOAD_FIX_SUMMARY.md` - Detailed fix explanation