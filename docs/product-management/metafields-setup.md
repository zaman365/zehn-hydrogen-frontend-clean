# Product Metafields Setup Guide

## Overview
The product details page now uses dynamic content from Shopify metafields instead of hardcoded text. This allows you to customize the accordion content for each product.

## Required Metafields

You need to create 4 metafields in your Shopify admin:

### 1. Materials (Materialien)
- **Namespace:** `custom`
- **Key:** `materials`
- **Type:** Single line text or Multi-line text
- **Example (Short):** `98% Baumwolle, 2% Elastan. Atmungsaktiv und strapazierfähig. Premium-Qualität.`
- **Example (Long):** "Premium-Stoffzusammensetzung: 98% Baumwolle, 2% Elastan. Atmungsaktives, weiches Material mit hervorragender Haltbarkeit. Ethisch beschafft und mit Liebe zum Detail produziert."

### 2. Features (Eigenschaften)
- **Namespace:** `custom`
- **Key:** `features`
- **Type:** Single line text or Multi-line text
- **Example (Short):** `Moderne Passform mit funktionalen Taschen. Verstärkte Nähte für lange Haltbarkeit.`
- **Example (Long):** "Moderne, maßgeschneiderte Passform mit raffinierten Details. Verstärkte Nähte für langlebige Haltbarkeit. Funktionale Taschen mit sauberen Abschlüssen. Für vielseitiges Styling und ganztägigen Komfort."

### 3. Care Instructions (Pflegehinweise)
- **Namespace:** `custom`
- **Key:** `care`
- **Type:** Single line text or Multi-line text
- **Example (Short):** `Maschinenwäsche bei 30°C. Nicht bleichen. Bei niedriger Temperatur trocknen.`
- **Example (Long):** "Maschinenwäsche kalt mit ähnlichen Farben. Im Trockner bei niedriger Temperatur oder an der Luft trocknen. Bei Bedarf kühl bügeln. Nicht bleichen. Pflegeetikett beachten."

### 4. Shipping & Returns (Versand & Rückgabe)
- **Namespace:** `custom`
- **Key:** `shipping`
- **Type:** Single line text or Multi-line text
- **Example (Short):** `Kostenloser Versand ab 75€. Lieferung 5-7 Tage. 30 Tage Rückgaberecht.`
- **Example (Long):** "Kostenloser Standardversand ab 75€. Expressversand an der Kasse verfügbar. Standardlieferung: 5-7 Werktage. Bestellungen werden innerhalb von 1-2 Werktagen versandt. Rückgabe innerhalb von 30 Tagen mit Originaletiketten."

## Quick Copy-Paste Content (German - Short Version)

Use these for quick setup:

**Materials:**
```
98% Baumwolle, 2% Elastan. Atmungsaktiv und strapazierfähig. Premium-Qualität.
```

**Features:**
```
Moderne Passform mit funktionalen Taschen. Verstärkte Nähte für lange Haltbarkeit.
```

**Care:**
```
Maschinenwäsche bei 30°C. Nicht bleichen. Bei niedriger Temperatur trocknen.
```

**Shipping:**
```
Kostenloser Versand ab 75€. Lieferung 5-7 Tage. 30 Tage Rückgaberecht.
```

## How to Add Metafields in Shopify

### Step 1: Create Metafield Definitions
1. Go to **Settings** → **Custom data** → **Products**
2. Click **Add definition**
3. Fill in the details:
   - Name: Materials (or Materialien)
   - Namespace and key: `custom.materials`
   - Type: Multi-line text
   - Validation: Optional (you can set max length)
4. Click **Save**
5. Repeat for `features`, `care`, and `shipping`

### Step 2: Add Content to Products
1. Go to **Products** → Select a product
2. Scroll down to the **Product metafields** section
3. Fill in the custom fields you created
4. **IMPORTANT: Click the green "Save" button** (top right corner)
5. Wait for "Product saved" confirmation message
6. Refresh your product page to see the changes

## Fallback Behavior

If a product doesn't have metafields set, the page will display default German text:

- **Materials:** Default cotton/elastane description
- **Features:** Default fit and quality description
- **Care:** Default washing instructions
- **Shipping:** Default shipping and return policy

## Troubleshooting

### Metafields not showing on the website?

1. **Check if you saved the product** - Make sure you clicked the green "Save" button after adding metafield content
2. **Verify namespace and key** - Must be exactly `custom.materials`, `custom.features`, `custom.care`, `custom.shipping`
3. **Clear browser cache** - Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check console logs** - Open browser console (F12) and look for "Product metafields:" log to see what data is being fetched

### How to verify metafields are working?

1. Open your product page in the browser
2. Press F12 to open Developer Console
3. Look for console log: `Product metafields: {materials: {...}, features: {...}, ...}`
4. If you see `materials: null`, the metafield is not saved in Shopify
5. If you see `materials: {value: "your content"}`, it's working!

## Benefits of This Approach

✅ **Product-specific content** - Each product can have unique details
✅ **Easy to manage** - Update content directly in Shopify admin
✅ **No code changes needed** - Content editors can update without developers
✅ **SEO friendly** - Unique content for each product
✅ **Multilingual ready** - Can be extended for multiple languages

## Future Enhancements

Consider adding these additional metafields:
- Size guide (specific measurements per product)
- Sustainability information
- Country of origin
- Product certifications
- Video URLs
