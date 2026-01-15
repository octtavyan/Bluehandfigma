# Facebook Pixel Implementation

## ✅ Completed Implementation

Facebook Pixel tracking has been successfully integrated into BlueHand Canvas.

### Pixel ID
- **ID**: `1630749871436923`

### Features Implemented

#### 1. **Base Pixel Installation** ✅
- Facebook Pixel script loads on every page
- Automatic PageView tracking
- Noscript fallback for users with JavaScript disabled

#### 2. **E-commerce Event Tracking** ✅

**AddToCart Event:**
- Fires when user adds product to cart
- Tracks: product name, ID, value, currency (RON)
- Includes customization data for personalized canvases

**Event Data Sent:**
```javascript
{
  content_name: "Product Title",
  content_ids: ["product_id"],
  content_type: "product",
  value: 150.00,
  currency: "RON"
}
```

#### 3. **Events Ready to Implement**

The following tracking functions are available but need to be connected:

**ViewContent** - Track when users view product pages
```javascript
import { trackViewContent } from './utils/facebookPixel';

trackViewContent({
  content_name: "Product Name",
  content_ids: ["123"],
  content_type: "product",
  value: 150,
  currency: "RON"
});
```

**InitiateCheckout** - Track when users begin checkout
```javascript
import { trackInitiateCheckout } from './utils/facebookPixel';

trackInitiateCheckout({
  content_ids: ["123", "456"],
  contents: [{id: "123", quantity: 1}],
  value: 300,
  currency: "RON",
  num_items: 2
});
```

**Purchase** - Track completed orders
```javascript
import { trackPurchase } from './utils/facebookPixel';

trackPurchase({
  value: 300,
  currency: "RON",
  content_ids: ["123", "456"],
  content_type: "product",
  contents: [{id: "123", quantity: 1}]
});
```

**Search** - Track product searches
```javascript
import { trackSearch } from './utils/facebookPixel';

trackSearch("tablouri moderne");
```

**Contact** - Track contact form submissions
```javascript
import { trackContact } from './utils/facebookPixel';

trackContact();
```

### Files Modified

1. `/utils/facebookPixel.ts` - Created
   - Core Facebook Pixel utility
   - All tracking functions
   - Helper functions for cart tracking

2. `/App.tsx` - Modified
   - Added Pixel initialization on app mount
   - Runs on every page load

3. `/context/CartContext.tsx` - Modified
   - Added AddToCart event tracking
   - Fires when products are added to cart

### Testing

To verify Facebook Pixel is working:

1. **Facebook Pixel Helper Chrome Extension**
   - Install: https://chrome.google.com/webstore/detail/facebook-pixel-helper
   - Visit your site
   - Click the extension icon
   - Should show "PageView" event firing

2. **Facebook Events Manager**
   - Go to: https://business.facebook.com/events_manager
   - Select your Pixel
   - View "Test Events" tab
   - Perform actions on your site
   - Events should appear in real-time

3. **Browser Console**
   - Open Developer Tools
   - Type: `fbq`
   - Should return the Facebook Pixel function (not undefined)

### Next Steps (Optional)

To maximize tracking, consider adding:

1. **ViewContent** on product detail pages
2. **InitiateCheckout** on checkout page
3. **Purchase** on payment success page
4. **Search** when users search products
5. **Contact** on contact form submission

### Privacy & GDPR

⚠️ **Important**: Facebook Pixel collects user data. Make sure your privacy policy mentions:
- Use of Facebook Pixel for analytics
- Cookie consent banner (if required in Romania/EU)
- User's right to opt-out

Current privacy policy location: `/pages/GDPRPage.tsx`

### Support

Facebook Pixel Documentation: https://developers.facebook.com/docs/meta-pixel
