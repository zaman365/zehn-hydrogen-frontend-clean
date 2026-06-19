# ZEHN Product Quick Reference

One-page cheat sheet for adding products to ZEHN.

---

## Image Naming Format

```
[product-slug]-[exact-color-name]-[number].jpg
```

**Examples:**
- `polo-shirt-navy-1.jpg`
- `cargo-pants-heritage-blue-2.jpg`
- `chino-city-slate-3.jpg`

**Rules:** Lowercase, spaces → hyphens, match color variant name

---

## German-English Color Translations

| German | Matches Images With |
|--------|---------------------|
| Schwarz | black, schwarz, slade |
| Blau | blue, blau |
| Grün | green, olive, grün |
| Grau | gray, grey, slate, slade, grau |

---

## Alt Text Format

```
[Product Name] - [Color] - [View Type]
```

**Example:** "Premium Polo Shirt - Navy - Front View"

---

## SKU Format

```
ZEHN-[TYPE]-[COLOR]-[SIZE]
```

**Examples:** `ZEHN-POLO-BLK-M`, `ZEHN-CARGO-NAVY-32`

---

## Required Fields

- [ ] Title (max 70 chars)
- [ ] Description (150-300 words)
- [ ] Vendor: `ZEHN`
- [ ] Product Type
- [ ] Tags
- [ ] Images (4-8 per color, renamed)
- [ ] Alt text
- [ ] Color & size variants
- [ ] Price (EUR)
- [ ] SKU
- [ ] Inventory tracking
- [ ] Color swatches (hex)
- [ ] Meta title (50-60 chars)
- [ ] Meta description (150-160 chars)

---

## Image Specs

| Spec | Value |
|------|-------|
| Dimensions | 2048x2048px (min 1200x1200px) |
| Format | JPG |
| Max Size | 20MB |
| Count | 4-8 per product |

---

## Common Color Hex Codes

| Color | Hex |
|-------|-----|
| Black | `#000000` |
| Navy | `#001f3f` |
| Olive | `#556b2f` |
| Heritage Blue | `#4a6fa5` |
| City Slate | `#708090` |
| Charcoal | `#36454f` |
| Forest Green | `#228b22` |

---

## Testing Checklist

- [ ] Product page loads
- [ ] Color filtering works (test each color)
- [ ] Variant selection updates
- [ ] Add to cart works
- [ ] Swatches display
- [ ] Mobile responsive
- [ ] No console errors

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Images not filtering | Filename must match color variant name |
| Swatches not showing | Add hex code to variants |
| Wrong images | Remove extra color keywords from filename |
| Not on storefront | Set "Active", check inventory > 0 |

---

## Time Estimates

| Task | Time |
|------|------|
| Create product | 10 min |
| Configure swatches | 5 min |
| Testing | 5 min |
| Add new color | 5 min |
| **Total** | **~20 min** |

---

## Key Principle

**NO CODE CHANGES NEEDED!** Follow naming convention and filtering works automatically.

---

## Need Help?

- **Setup Guide**: [ZEHN_Product_Setup_Guidelines.md](./ZEHN_Product_Setup_Guidelines.md)
- **Workflow**: [ZEHN_Product_Workflow.md](./ZEHN_Product_Workflow.md)
