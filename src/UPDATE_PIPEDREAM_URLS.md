# 🔧 Update All Netopia IPN URLs to Pipedream

## ✅ Your Pipedream Webhook URL:
```
https://eokrex1e5lzckse.m.pipedream.net
```

## 📝 Manual Update Instructions

Since there are 7 locations with similar code, here's a simple find & replace:

### Find:
```
https://${projectUrl}/functions/v1/make-server-bbc0c500/netopia/ipn-public?apikey=${anonKey}
```

### Replace with:
```
https://eokrex1e5lzckse.m.pipedream.net
```

## 📍 Exact Locations to Update:

### 1. Line ~1853 - First start-payment-v4
**Find:**
```typescript
notifyUrl: `https://${projectUrl}/functions/v1/make-server-bbc0c500/netopia/ipn-public?apikey=${anonKey}`,
```
**Replace with:**
```typescript
notifyUrl: `https://eokrex1e5lzckse.m.pipedream.net`,
```

### 2. Line ~2158 - Second start-payment-v4
**Find:**
```typescript
notifyUrl: `https://${projectUrl}/functions/v1/make-server-bbc0c500/netopia/ipn-public?apikey=${anonKey}`,
```
**Replace with:**
```typescript
notifyUrl: `https://eokrex1e5lzckse.m.pipedream.net`,
```

### 3. Line ~2444 - XML confirm #1
**Find:**
```typescript
<confirm>${escapeXml(`https://${projectUrl}/functions/v1/make-server-bbc0c500/netopia/ipn-public?apikey=${anonKey}`)}</confirm>
```
**Replace with:**
```typescript
<confirm>${escapeXml(`https://eokrex1e5lzckse.m.pipedream.net`)}</confirm>
```

### 4. Line ~2633 - JSON config
**Find:**
```typescript
notifyUrl: `https://${projectUrl}/functions/v1/make-server-bbc0c500/netopia/ipn-public?apikey=${anonKey}`,
```
**Replace with:**
```typescript
notifyUrl: `https://eokrex1e5lzckse.m.pipedream.net`,
```

### 5. Line ~2916 - XML builder
**Find:**
```typescript
confirm: `https://${projectUrl}/functions/v1/make-server-bbc0c500/netopia/ipn-public?apikey=${anonKey}`,
```
**Replace with:**
```typescript
confirm: `https://eokrex1e5lzckse.m.pipedream.net`,
```

### 6. Line ~2985 - XML confirm #2
**Find:**
```typescript
<confirm>${escapeXml(`https://${projectUrl}/functions/v1/make-server-bbc0c500/netopia/ipn-public?apikey=${anonKey}`)}</confirm>
```
**Replace with:**
```typescript
<confirm>${escapeXml(`https://eokrex1e5lzckse.m.pipedream.net`)}</confirm>
```

### 7. Line ~3200 - Encrypted request
**Find:**
```typescript
notifyUrl: `https://${projectUrl}/functions/v1/make-server-bbc0c500/netopia/ipn-public?apikey=${anonKey}`,
```
**Replace with:**
```typescript
notifyUrl: `https://eokrex1e5lzckse.m.pipedream.net`,
```

---

## ✅ After Updates:

1. **Save the file**
2. **Deploy** (Figma Make should auto-deploy)
3. **Test with a real payment**
4. **Check Pipedream logs** - you should see the IPN arrive
5. **Check Supabase logs** - you should see `[PUBLIC IPN]` messages
6. **Netopia gets HTTP 200** instead of 401! ✅

---

## 🧪 Testing:

After deploying, place a test order:

**Expected flow:**
```
1. Customer pays → Netopia processes
2. Netopia sends IPN → Pipedream (https://eokrex1e5lzckse.m.pipedream.net)
3. Pipedream forwards → Supabase (with correct JWT)
4. Supabase processes → Order created
5. Pipedream returns → HTTP 200 to Netopia ✅
```

**Check Pipedream:**
- Go to https://pipedream.com/workflows
- Click on your workflow
- You'll see all IPN requests in the logs!

**Check Supabase:**
- Edge Functions → Logs
- Look for: `🔔 [PUBLIC IPN] Received Netopia IPN notification`

---

Date: February 5, 2026
Status: Ready to update
Next: Find & replace all 7 URLs, test payment
