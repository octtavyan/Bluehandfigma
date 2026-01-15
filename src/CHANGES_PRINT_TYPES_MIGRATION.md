# Print Types Migration - Structural Changes

## Overview
We've moved print type configuration from individual paintings to the **Sizes** level. This allows better control over which sizes support Canvas vs Print, especially for dynamically loaded Unsplash images.

## What Changed

### 1. **Database Schema - Sizes Table**
Added two new columns to the `sizes` table:
- `supports_print_canvas` (BOOLEAN) - Controls if this size is available for Print Canvas
- `supports_print_hartie` (BOOLEAN) - Controls if this size is available for Print Hartie

**Migration Required:** Run the SQL script in `/MIGRATION_SIZES_PRINT_TYPES.sql` in your Supabase SQL Editor.

### 2. **Admin Sizes Page**
Added checkboxes in the size editing modal:
- ✅ "Disponibil pentru Print Canvas"
- ✅ "Disponibil pentru Print Hartie"

**Location:** Admin > Dimensiuni > Edit Size Modal

**Default Values:** Both checkboxes are checked by default (backwards compatible)

### 3. **Product Detail Page - Dynamic Print Types**
Print type options now dynamically change based on the selected size:

**Before:** 
- Print types were hardcoded per painting
- Unsplash images always showed both options
- No size-level control

**After:**
- Print types are determined by the selected size's `supportsPrintCanvas` and `supportsPrintHartie` flags
- When user changes size, print type options update automatically
- If selected print type becomes unavailable, auto-switches to an available option

### 4. **Frame Display Fix**
"Fara Rama" now only shows if frame pricing is explicitly configured:

**Before:** 
- "Fara Rama - Inclusă" always showed even if no pricing was set up

**After:**
- "Fara Rama" only appears if it has configured pricing in the size's framePrices
- If no frame pricing exists, the frame type section won't show "Fara Rama" at all

## How It Works

### Size Configuration Flow:
```
1. Admin creates/edits a size
2. Sets checkboxes for Print Canvas and/or Print Hartie support
3. Configures frame prices for each frame type
4. Saves the size
```

### Frontend Display Flow:
```
1. User selects a product
2. User selects a size
3. Print type options filter based on selected size's support flags
4. Frame types filter based on:
   - Selected print type
   - Frame pricing existence
   - Frame availability flags (availableForCanvas/availableForPrint)
```

### Example Scenarios:

#### Scenario 1: Small sizes only for Print Hartie
```
Size: 10×14 cm
✅ Disponibil pentru Print Canvas: UNCHECKED
✅ Disponibil pentru Print Hartie: CHECKED

Result: User only sees "Print Hartie" option for this size
```

#### Scenario 2: Large sizes support both
```
Size: 70×100 cm
✅ Disponibil pentru Print Canvas: CHECKED
✅ Disponibil pentru Print Hartie: CHECKED

Result: User sees both "Print Canvas" and "Print Hartie" options
```

#### Scenario 3: No frame pricing configured
```
Size: 30×40 cm
Frame Prices: {} (empty)

Result: No frame type selection shows (not even "Fara Rama")
```

## Data Flow Architecture

### Before (Old System):
```
Painting → printTypes[] → UI displays fixed options
Problem: Unsplash images can't be controlled
```

### After (New System):
```
Size → supportsPrintCanvas/supportsPrintHartie
    ↓
Selected Size → Calculate available print types
    ↓
UI displays dynamic options based on size
```

## Migration Steps

### Step 1: Run SQL Migration
```sql
-- In Supabase SQL Editor, run:
/MIGRATION_SIZES_PRINT_TYPES.sql
```

### Step 2: Configure Existing Sizes
1. Go to Admin > Dimensiuni
2. For each size, click Edit
3. Check/uncheck print type checkboxes based on your needs
4. Save

### Step 3: Test
1. Visit a product detail page
2. Change sizes
3. Verify print type options update correctly
4. Verify frame types display correctly

## Backwards Compatibility

✅ **Fully backwards compatible:**
- Default values: Both print types enabled
- Existing sizes will support both Canvas and Hartie by default
- No data loss
- Existing paintings continue to work

## Benefits

1. **✅ Centralized Control:** Manage print types at the size level
2. **✅ Unsplash Support:** Dynamic images now respect size configuration
3. **✅ Better UX:** Users only see available options for their selected size
4. **✅ Cleaner Code:** No need to manually configure print types per painting
5. **✅ Frame Display Fix:** "Fara Rama" only shows when properly configured
6. **✅ Scalability:** Easy to add new sizes with specific print type support

## Technical Details

### Modified Files:
- `/context/AdminContext.tsx` - Added supportsPrintCanvas/supportsPrintHartie to CanvasSize interface
- `/lib/dataService.ts` - Updated canvasSizesService to handle new fields
- `/pages/admin/AdminSizesPage.tsx` - Added UI checkboxes for print type configuration
- `/pages/ProductDetailPage.tsx` - Dynamic print type filtering based on selected size
- `/services/unsplashService.ts` - No changes needed (still sets both types by default)

### Database Changes:
- Table: `sizes`
- New columns: `supports_print_canvas`, `supports_print_hartie`
- Type: BOOLEAN
- Default: TRUE (backwards compatible)

## Support

If you encounter issues:
1. Verify SQL migration ran successfully
2. Check that sizes have the new columns in Supabase
3. Clear browser cache/session storage
4. Check browser console for errors
