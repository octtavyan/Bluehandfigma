# Netopia SDK Integration - Testing Checklist

## ✅ Pre-Testing Setup

### 1. Verify Environment Variables in Supabase
Go to: **Supabase → Project Settings → Edge Functions → Secrets**

Required secrets:
- [x] `NETOPIA_API_KEY` - Already configured ✅
- [x] `NETOPIA_POS_SIGNATURE` - Already configured ✅
- [x] `SUPABASE_URL` - Auto-configured ✅
- [x] `SUPABASE_SERVICE_ROLE_KEY` - Auto-configured ✅
- [x] `RESEND_API_KEY` - Already configured ✅

### 2. Verify Admin Settings
Go to: **Admin Panel → Settings → Netopia Payments**

Check:
- [ ] POS Signature is set (or use environment variable)
- [ ] Environment is set to "Sandbox" for testing
- [ ] Settings show as "Configured" ✅

### 3. Deploy Edge Function
The Edge Function should auto-deploy. To verify:
- Go to Supabase → Functions
- Check that `make-server-bbc0c500` is deployed
- Last deployment should be recent

## 🧪 Testing Steps

### Test 1: Quick SDK Test (5 minutes)

**Navigate to**: `/netopia-test`

**Steps**:
1. Open browser console (F12)
2. Click "Test Netopia Payment" button
3. Wait for response (should be 2-5 seconds)

**Expected Result**:
- ✅ Green success alert appears
- ✅ Shows redirect URL starting with `https://secure.sandbox.netopia-payments.com/`
- ✅ Console shows SDK logs:
  ```
  🧪 Testing Netopia payment with data: {...}
  📥 Netopia response: { success: true, redirectUrl: "...", ... }
  ✅ Payment initialized successfully!
  🔗 Redirect URL: https://...
  ```
- ✅ Auto-redirects after 3 seconds

**If Failed**:
1. Check browser console for error message
2. Check Supabase Edge Function logs
3. Verify environment variables are set
4. Review `/NETOPIA_TEST_GUIDE.md`

---

### Test 2: Edge Function Logs Check (2 minutes)

**Go to**: **Supabase → Project → Logs → Edge Functions**

**Look for** (from Test 1):
```
💳 Initiating Netopia payment for order TEST-...
📦 Importing Netopia SDK...
✅ Netopia SDK imported successfully
✅ Netopia instance created
📝 Payment data prepared: {...}
🚀 Creating payment with Netopia SDK...
✅ Netopia SDK response: {...}
✅ Payment initialized successfully. Redirect URL: https://...
```

**Expected**:
- ✅ All logs show success (✅)
- ✅ No error messages (❌)
- ✅ SDK import successful
- ✅ Payment URL returned

**If Failed**:
- Look for ❌ error messages
- Check which step failed
- Common issues:
  - SDK import failed → Check Deno can access npm packages
  - API error → Verify credentials
  - No payment URL → Check Netopia account status

---

### Test 3: Full Checkout Flow (10 minutes)

**Steps**:
1. Go to home page
2. Click "Comandă Tablou Personalizat"
3. Upload an image
4. Select a size
5. Add to cart
6. Go to checkout
7. Fill in customer details:
   - Name: Ion Popescu
   - Email: ion.popescu@test.ro
   - Phone: 0722123456
   - Address: Str. Victoriei nr. 10
   - City: București
   - County: București
8. Select "Card online" payment
9. Click "Finalizează comanda"

**Expected Result**:
- ✅ Processing... spinner shows
- ✅ Redirects to Netopia payment page
- ✅ Payment page shows correct amount
- ✅ Order details are correct

**If Failed**:
- Check checkout page console for errors
- Verify Edge Function logs
- Make sure cart has items
- Verify all form fields are filled

---

### Test 4: Payment Completion (Sandbox) (5 minutes)

**On Netopia Payment Page**:

**Use Sandbox Test Card**:
```
Card Number: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
Cardholder: TEST USER
```

**Steps**:
1. Enter test card details
2. Click "Pay"
3. Wait for confirmation

**Expected Result**:
- ✅ Payment processes successfully
- ✅ Redirects back to `/payment-success`
- ✅ Success message shows order number
- ✅ IPN callback received (check Edge Function logs)

**Check**:
- Go to Supabase Edge Function logs
- Look for: `🔔 Received Netopia IPN: {...}`
- Payment status should update to "paid"

---

### Test 5: Order Verification (3 minutes)

**Go to**: **Admin Panel → Orders**

**Check**:
- [ ] New order appears in list
- [ ] Order number matches payment
- [ ] Payment status is "Paid" (if payment completed) or "Unpaid" (if abandoned)
- [ ] Customer details are correct
- [ ] Order total matches payment amount

---

## 🔍 Debugging Guide

### Issue: "Netopia payment gateway not configured"

**Fix**:
1. Go to Admin → Settings → Netopia Payments
2. Verify POS Signature is entered
3. Click "Save Settings"
4. Or set `NETOPIA_POS_SIGNATURE` in Supabase secrets

### Issue: "Failed to import Netopia SDK"

**Fix**:
1. Check Edge Function logs for exact error
2. Verify Deno can access npm packages
3. The import should be: `npm:netopia-payment2@1.0.3`
4. Try redeploying the Edge Function

### Issue: "No payment URL returned"

**Fix**:
1. Check API credentials are correct
2. Verify you're using sandbox credentials in sandbox mode
3. Check Netopia account is active
4. Review Edge Function logs for API response

### Issue: Payment redirects but no success page

**Fix**:
1. Check return URL in Edge Function logs
2. Verify `/payment-success` route exists
3. Check browser console for routing errors
4. Make sure order was created in database

### Issue: IPN not received

**Fix**:
1. Verify IPN URL is accessible: `https://[project].supabase.co/functions/v1/make-server-bbc0c500/netopia/ipn`
2. Check Edge Function logs for IPN requests
3. Make sure Netopia can reach your callback URL
4. For local testing, use ngrok or similar

---

## ✅ Success Criteria

All tests pass when:

- [x] Test page successfully initializes payment
- [x] Edge Function logs show SDK working correctly
- [x] Full checkout flow redirects to Netopia
- [x] Test payment completes successfully
- [x] Order appears in admin panel
- [x] Payment status updates correctly
- [x] IPN callbacks are received

## 📊 Test Results

### Test 1: SDK Test
- Status: ⏳ Pending
- Result: 
- Notes:

### Test 2: Logs Check
- Status: ⏳ Pending
- Result:
- Notes:

### Test 3: Checkout Flow
- Status: ⏳ Pending
- Result:
- Notes:

### Test 4: Payment Completion
- Status: ⏳ Pending
- Result:
- Notes:

### Test 5: Order Verification
- Status: ⏳ Pending
- Result:
- Notes:

---

## 🚀 Ready for Production?

Before switching to live mode:

- [ ] All sandbox tests pass ✅
- [ ] IPN callbacks work correctly
- [ ] Order creation works
- [ ] Email notifications work
- [ ] Payment status updates correctly
- [ ] Error handling tested
- [ ] Load testing completed
- [ ] Security review done
- [ ] Backup plan in place

**Then**:
1. Update to **live** credentials in Supabase secrets
2. Change environment to "Live" in Admin Settings
3. Test with small real payment
4. Monitor for 24-48 hours
5. Gradually increase traffic

---

**Start Testing**: Go to `/netopia-test` and click the button! 🚀

**Last Updated**: January 28, 2026
