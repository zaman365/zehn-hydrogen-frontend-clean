# ZEHN Product Workflow

Step-by-step workflow for adding products to ZEHN. No code changes needed!

**Total Time**: ~20 minutes per product

---

## Pre-Setup Checklist

- [ ] Product photos ready (4-8 images per color, 2048x2048px JPG)
- [ ] Product info (title, description, materials, features)
- [ ] Pricing (EUR), colors, sizes
- [ ] Color hex codes for swatches

---

## Phase 1: Create Product in Shopify (10 min)

### Step 1: Basic Info
1. Go to **Shopify Admin** > **Products** > **Add product**
2. Enter **Title** (max 70 chars): "Premium Cotton Polo Shirt"
3. Enter **Description** (150-300 words with features)
4. Set **Vendor**: `ZEHN`
5. Set **Product Type**: Polo, Cargo, Chino, Jacket, Shirt, Pants
6. Add **Tags**: `men`, `bestseller`, `cotton`, etc.

### Step 2: Upload Images

**CRITICAL**: Rename photos first!

**Format**: `[product-slug]-[exact-color-name]-[number].jpg`

**Example for Cargo Pants:**
```
Heritage Blue:
- cargo-pants-heritage-blue-1.jpg (front)
- cargo-pants-heritage-blue-2.jpg (back)
- cargo-pants-heritage-blue-3.jpg (side)

City Slate:
- cargo-pants-city-slate-1.jpg (front)
- cargo-pants-city-slate-2.jpg (back)

Olive:
- cargo-pants-olive-1.jpg (front)
- cargo-pants-olive-2.jpg (back)
```

**Upload:**
1. Click **Add media**
2. Upload all renamed images
3. Add **Alt Text**: `[Product] - [Color] - [View]`
   - Example: "Cargo Pants - Heritage Blue - Front View"

### Step 3: Configure Variants

**Add Options:**
1. Click **Add variant**
2. Add **Color** option: "Heritage Blue", "City Slate", "Olive"
3. Add **Size** option: 28, 30, 32, 34, 36, 38, 40

**For Each Variant:**
1. Set **Price** (EUR)
2. Set **SKU**: `ZEHN-CARGO-BLUE-32`
3. Enable **Track quantity**
4. Set **Inventory** levels

### Step 4: SEO
1. Scroll to **Search engine listing**
2. Click **Edit website SEO**
3. **Page title**: `[Product Name] | ZEHN` (50-60 chars)
4. **Meta description**: 150-160 chars with features
5. **URL handle**: `lowercase-with-hyphens`

### Step 5: Save
Click **Save** and set status to **Active**

---

## Phase 2: Configure Color Swatches (5 min)

1. Go to product variants
2. Add hex code for each color:
   - Navy: `#001f3f`
   - Olive: `#556b2f`
   - Black: `#000000`
   - Heritage Blue: `#4a6fa5`
   - City Slate: `#708090`

---

## Phase 3: Testing Checklist (5 min)

- [ ] Product page loads
- [ ] Select each color → correct images display
- [ ] Variant selection works
- [ ] Add to cart functions
- [ ] Color swatches show on product card
- [ ] Mobile responsive
- [ ] No console errors

---

## Common Workflows

### Adding New Color (5 min)

1. **Rename photos**: `product-new-color-1.jpg`
2. **Upload** to Shopify with alt text
3. **Add variant**: Select Color option, add "New Color"
4. **Set** price, SKU, inventory
5. **Add hex code** for swatch
6. **Test** color filtering

**NO CODE CHANGES NEEDED!**

### Adding Size Variants (3 min)

1. Go to product
2. Add Size option if not exists
3. Enter sizes (S, M, L, XL)
4. Set price, SKU, inventory
5. Save

---

## Troubleshooting

### Images not filtering by color
**Cause**: Filename doesn't match color name

**Fix**:
1. Check color variant: "Heritage Blue"
2. Check filename: `product-heritage-blue-1.jpg`
3. Must be lowercase, spaces as hyphens

### German colors not working
**Cause**: Images have English names

**Fix**: System auto-translates:
- Schwarz → matches "black", "schwarz", "slade"
- Blau → matches "blue", "blau"
- Grün → matches "green", "olive", "grün"
- Grau → matches "gray", "grey", "slate", "slade", "grau"

### Swatches not showing
**Fix**: Add hex code to each color variant

### Wrong images showing
**Fix**: Remove extra color keywords from filename
- ❌ `cargo-blue-olive-1.jpg`
- ✅ `cargo-blue-1.jpg`

---

## Key Principles

1. **No Code Changes** - Follow naming convention, filtering works automatically
2. **Consistency** - Use exact color names in variant, filename, and alt text
3. **Test First** - Always test before making live
4. **Keep Simple** - "Navy" is better than "Deep Ocean Navy Blue"

---

## Next Steps

- [ZEHN_Product_Setup_Guidelines.md](./ZEHN_Product_Setup_Guidelines.md) - Detailed specs
- [ZEHN_Product_Quick_Reference.md](./ZEHN_Product_Quick_Reference.md) - Quick lookups
