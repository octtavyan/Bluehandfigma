# FAN Courier AWB - Setup Instructions

## Quick Start

### ✅ Error Fixed!

The error `Cannot read properties of undefined (reading 'VITE_FAN_COURIER_USERNAME')` has been resolved. The service now safely checks for environment variables and provides helpful error messages.

### Current Status

- ✅ **Code Integration**: Complete and working
- ⚠️ **Configuration**: Needs FAN Courier credentials
- ✅ **UI**: AWB card ready to use
- ✅ **Error Handling**: Graceful degradation when not configured

## Configuration Steps

### 1. Get FAN Courier API Access

Contact FAN Courier to request SelfAWB API access:
- 📞 Phone: Contact FAN Courier support
- 🌐 Website: https://www.fancourier.ro/servicii/self-awb/
- 📧 Email: Request API access from your account manager

You will receive:
- `Username` (API username)
- `Password` (API password)
- `Client ID` (Your FAN Courier client identifier)

### 2. Add Environment Variables

#### For Local Development

Create a `.env` file in your project root:

```env
# FAN Courier API Configuration
VITE_FAN_COURIER_USERNAME=your_username_here
VITE_FAN_COURIER_PASSWORD=your_password_here
VITE_FAN_COURIER_CLIENT_ID=your_client_id_here
```

**Important**: Never commit the `.env` file to git! It's already in `.gitignore`.

#### For Production (Vercel/Netlify/etc.)

Add these environment variables in your deployment platform:

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add each variable:
   - `VITE_FAN_COURIER_USERNAME` = `your_username`
   - `VITE_FAN_COURIER_PASSWORD` = `your_password`
   - `VITE_FAN_COURIER_CLIENT_ID` = `your_client_id`
3. Redeploy

**Netlify:**
1. Go to Site Settings → Build & Deploy → Environment
2. Add each variable
3. Redeploy

**Other Platforms:**
Follow your platform's guide for adding environment variables.

### 3. Verify Configuration

After adding credentials:

1. **Reload the application**
2. Go to any order in admin panel: `/admin/orders/{orderId}`
3. Scroll to **"AWB FAN Courier"** section
4. Click **"Generează AWB"**
5. If configured correctly, AWB number will be generated
6. If not configured, you'll see a helpful error message

## What Happens Without Configuration?

The application works perfectly **without** FAN Courier credentials:

✅ **All existing features work normally**  
✅ **Orders can be created and managed**  
✅ **No errors or crashes**  
⚠️ **AWB generation shows "credentials not configured" error**  
ℹ️ **AWB card is hidden or shows setup instructions**

This is intentional - FAN Courier is an **optional** feature that enhances your workflow but doesn't break anything if not configured.

## Testing

### With Test Credentials

If you have FAN Courier test/sandbox credentials:

```env
VITE_FAN_COURIER_USERNAME=test_user
VITE_FAN_COURIER_PASSWORD=test_pass
VITE_FAN_COURIER_CLIENT_ID=test_client_123
```

### Without Credentials

The app gracefully handles missing credentials:
- Shows helpful setup guide
- Provides clear error messages
- Doesn't break existing functionality

## Troubleshooting

### Error: "Credentials not configured"

**Solution**: Add the environment variables as described above.

### Environment Variables Not Loading

1. **Restart development server** after adding `.env` file
2. **Clear browser cache** and reload
3. **Check variable names** - must start with `VITE_`
4. **Verify `.env` file location** - must be in project root

### Variables Work Locally But Not in Production

1. **Check deployment platform** environment variables
2. **Redeploy** after adding variables
3. **Verify variable names** match exactly (case-sensitive)

### AWB Generation Fails

1. **Verify credentials are correct** - test on FAN Courier website
2. **Check order has complete address** (street, city, county, zip)
3. **Check customer phone number** is valid Romanian format
4. **View browser console** for detailed error messages

## Testing Checklist

Before going live:

- [ ] FAN Courier credentials obtained
- [ ] Environment variables added (local + production)
- [ ] Application redeployed
- [ ] Test order created
- [ ] AWB generated successfully
- [ ] Tracking update tested
- [ ] Label download tested
- [ ] Error handling verified (wrong credentials, invalid address, etc.)

## Support

### FAN Courier Support
- Website: https://www.fancourier.ro
- Documentation: https://www.fancourier.ro/servicii/self-awb/

### Code Implementation
- Service: `/services/fanCourierService.ts`
- Component: `/components/admin/AWBCard.tsx`
- Context: `/context/AdminContext.tsx`

## Next Steps

1. ✅ **Code is ready** - Integration complete
2. ⏳ **Get credentials** - Contact FAN Courier
3. ⏳ **Configure** - Add environment variables
4. ✅ **Start using** - Generate AWBs with one click!

---

**Status**: Ready for production after adding FAN Courier credentials 🚀
