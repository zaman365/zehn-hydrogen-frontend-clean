# ZEHN Photography Guidelines
## Professional Image Specifications for Responsive Web Design

**Version:** 1.0
**Last Updated:** March 13, 2026
**Project:** ZEHN E-commerce Platform

---

## Table of Contents
1. [Overview](#overview)
2. [Technical Requirements](#technical-requirements)
3. [Image Specifications by Component](#image-specifications-by-component)
4. [Composition Guidelines](#composition-guidelines)
5. [Responsive Considerations](#responsive-considerations)
6. [Delivery Format](#delivery-format)
7. [Quality Checklist](#quality-checklist)

---

## Overview

This document provides comprehensive photography guidelines for the ZEHN e-commerce platform. All images must be optimized for responsive design, ensuring perfect display across mobile, tablet, and desktop devices.

### Design System Colors
- **Primary (Anodized Indigo):** #0F1426
- **Accent (Safety Signal):** #FF5F1F
- **Background (Platinum):** #F4F4F5
- **Secondary (Industrial Slate):** #8E97A4

---

## Technical Requirements

### File Formats
- **Primary Format:** JPG/JPEG (for photographs)
- **Secondary Format:** PNG (for images requiring transparency)
- **Web Optimization:** WebP (optional, for better compression)

### Color Space
- **sRGB** (mandatory for web display)
- **Color Profile:** Embedded sRGB IEC61966-2.1

### Compression
- **Quality:** 85-90% (balance between quality and file size)
- **Maximum File Size:**
  - Hero images: 500KB max
  - Product images: 200KB max
  - Thumbnails: 100KB max

### Resolution
- **Minimum DPI:** 72 DPI (web standard)
- **Pixel Density:** Provide @2x versions for Retina displays

---

## Image Specifications by Component

### 1. Hero Banner (Homepage)

**Desktop:**
- **Dimensions:** 2400 × 1600px minimum
- **Aspect Ratio:** 3:2 (landscape)
- **Display Height:** Flexible (scales with viewport, max ~900px)
- **File Name:** `hero-main.jpg`

**Mobile:**
- **Dimensions:** 1200 × 1600px minimum
- **Aspect Ratio:** 3:4 (portrait)
- **Display Height:** 200px (mobile), 280px (tablet), 450px (desktop)
- **File Name:** `hero-main-mobile.jpg`

**Composition Notes:**
- Keep primary subject centered
- Safe zone: Center 60% of image (text overlay area)
- Avoid busy backgrounds on left side (text placement area)
- Ensure high contrast for text readability

**Current Example:**
- `/Untitled design.png` - Hero image
- `/newarrivalbanner.jpg` - New arrival banner

---

### 2. Product Grid Images

**Specifications:**
- **Dimensions:** 1200 × 1200px (minimum)
- **Aspect Ratio:** 1:1 (Square)
- **Display Size:** 380px height (fixed container)
- **Object Fit:** Contain (product centered with white background)
- **Background:** Pure white (#FFFFFF) or transparent PNG

**Requirements:**
- Product must be centered
- 10-15% padding around product edges
- No shadows (added by CSS)
- Consistent lighting across all products
- Multiple angles recommended (front, side, detail)

**Color Variants:**
- Each color variant needs separate image
- Same composition and lighting
- File naming: `product-name-color.jpg`

**File Naming Convention:**
```
polo-shirt-navy-front.jpg
polo-shirt-navy-back.jpg
polo-shirt-white-front.jpg
cargo-pant-khaki-front.jpg
```

---

### 3. Category Tiles

**Desktop:**
- **Dimensions:** 1600 × 1200px minimum
- **Aspect Ratio:** 4:3 or 1:1
- **Display Height:** 450px (desktop)
- **File Name:** `category-[name].jpg`

**Mobile/Tablet:**
- **Dimensions:** 1600 × 1600px minimum
- **Aspect Ratio:** 1:1 (Square)
- **Display Size:** 280px width (mobile), 40% viewport (tablet)

**Composition Notes:**
- Dark gradient overlay applied (from black/70% to transparent)
- Keep subject in lower 2/3 of frame
- Leave top 1/3 relatively clear for text
- High contrast subjects work best

**Current Examples:**
```
Best Seller: 800×800px
New Arrival: 800×800px
Sale: 800×800px
```

---

### 4. Bento Grid (Featured Section)

The Bento Grid uses multiple aspect ratios in a mosaic layout:

#### Tall Portrait Items (Salmon, Pork, Edamame, Tomato)
- **Dimensions:** 1200 × 1800px
- **Aspect Ratio:** 2:3 (Portrait)
- **File Names:** `bento-new-arrivals.jpg`, `bento-sale.jpg`, `bento-bestsellers.jpg`, `bento-collections.jpg`

#### Wide Landscape Item (Tamago)
- **Dimensions:** 1600 × 900px
- **Aspect Ratio:** 16:9 (Landscape)
- **File Name:** `bento-style-guide.jpg`

#### Square Item (Broccoli)
- **Dimensions:** 1200 × 1200px
- **Aspect Ratio:** 1:1 (Square)
- **File Name:** `bento-premium.jpg`

**Grid Layout:**
```
Desktop (4×8 grid):
┌─────┬─────┬─────────┐
│     │ Sq  │  Wide   │
│ Tall│─────┼────┬────┤
│     │Tall │Tall│Tall│
│     │     │    │    │
└─────┴─────┴────┴────┘

Mobile (2×2 grid):
Shows first 4 items only
```

**Composition Notes:**
- Each image should work independently
- Subjects should be clearly visible at small sizes
- Avoid text in images (added via overlay)

---

### 5. Collection Banners

**Specifications:**
- **Dimensions:** 1600 × 1200px minimum
- **Aspect Ratio:** 4:3 (mobile), 1:1 (desktop)
- **Display Height:** Responsive (maintains aspect ratio)

**Layout:**
- Split layout: 50% text, 50% image
- Image can be left or right side
- Rounded corners (2xl = 24px radius)

**Composition Notes:**
- Product should face toward text side
- Clean background or subtle gradient
- High-quality product photography
- Ensure product is fully visible (no cropping)

---

### 6. New Arrival Banner (Full Width)

**Specifications:**
- **Dimensions:** 2400 × 800px minimum
- **Aspect Ratio:** 3:1 (Ultra-wide)
- **Display Heights:**
  - Mobile: 200px
  - Tablet: 280px
  - Desktop: 450px

**Composition Notes:**
- Text overlay on LEFT side
- Keep left 30% of image relatively clear
- Subject/product on right 70%
- Horizontal composition works best

**Current Example:**
- `/newarrivalbanner.jpg`

---

### 7. Product Detail Page Images

**Main Product Image:**
- **Dimensions:** 2000 × 2000px minimum
- **Aspect Ratio:** 1:1 (Square)
- **Display:** Responsive, max height calc(100vh-10rem)
- **Background:** White or transparent

**Thumbnail Gallery:**
- **Dimensions:** 400 × 400px
- **Aspect Ratio:** 1:1 (Square)
- **Display Size:** ~80px × 80px
- **Border:** Rounded (xl = 12px radius)

**Requirements:**
- Minimum 4 images per product
- Include: front, back, detail, lifestyle
- Consistent lighting and background
- High resolution for zoom functionality

---

### 8. Testimonial Images

**Specifications:**
- **Dimensions:** 200 × 200px minimum
- **Aspect Ratio:** 1:1 (Square)
- **Display Size:** 48px × 48px (circular crop)
- **Format:** JPG or PNG

**Requirements:**
- Headshot style (face centered)
- Neutral background
- Good lighting
- Professional appearance

---

### 9. Blog/Article Images

**Featured Image:**
- **Dimensions:** 1600 × 1067px minimum
- **Aspect Ratio:** 3:2 (Landscape)
- **Display:** Responsive

**Thumbnail:**
- **Dimensions:** 800 × 533px
- **Aspect Ratio:** 3:2 (Landscape)

---

### 10. Static Page Hero Images

**Specifications:**
- **Dimensions:** 1920 × 600px minimum
- **Aspect Ratio:** 16:5 (Wide banner)
- **Display Heights:**
  - Mobile: 280px
  - Tablet: 320px
  - Desktop: 400px

**Variants:**
- Dark background hero
- Light background hero
- Gradient background hero
- Minimal hero (no image)
- Split hero (decorative panel)

---

## Composition Guidelines

### Product Photography Best Practices

#### Lighting
- **Setup:** 3-point lighting (key, fill, back)
- **Color Temperature:** 5500K (daylight balanced)
- **Shadows:** Soft, minimal shadows
- **Highlights:** Avoid blown-out highlights

#### Background
- **Color:** Pure white (#FFFFFF) for product grid
- **Texture:** Smooth, no distractions
- **Consistency:** Same background across all products

#### Framing
- **Product Size:** 70-80% of frame
- **Padding:** 10-15% margin on all sides
- **Centering:** Perfect center alignment
- **Orientation:** Straight, not tilted

#### Focus
- **Depth of Field:** f/8 to f/11 (sharp throughout)
- **Focus Point:** Center of product
- **Sharpness:** Tack sharp, no motion blur

### Lifestyle Photography

#### Context
- **Setting:** Clean, modern environments
- **Props:** Minimal, complementary items
- **Models:** Professional, diverse representation
- **Styling:** Consistent with brand aesthetic

#### Mood
- **Tone:** Premium, aspirational
- **Colors:** Align with brand palette
- **Lighting:** Natural, soft light preferred
- **Composition:** Rule of thirds, leading lines

---

## Responsive Considerations

### Safe Zones

All images should consider safe zones for text overlays and responsive cropping:

**Hero Images:**
- **Desktop:** Center 60% is safe zone
- **Mobile:** Center 80% is safe zone
- **Text Area:** Left 30% (keep clear)

**Category Tiles:**
- **Text Area:** Bottom 40% (gradient overlay)
- **Subject Area:** Top 60%

**Banners:**
- **Text Area:** Left or right 40%
- **Image Area:** Opposite 60%

### Focal Points

Ensure the main subject remains visible across all breakpoints:

- **Mobile (320px - 767px):** Center-weighted crop
- **Tablet (768px - 1023px):** Balanced composition
- **Desktop (1024px+):** Full composition visible

### Aspect Ratio Handling

Images will be displayed using CSS `object-fit`:
- **Contain:** Product images (no cropping)
- **Cover:** Lifestyle/banner images (may crop edges)

**Important:** Keep critical elements within the center 80% of frame to avoid cropping issues.

---

## Delivery Format

### File Naming Convention

```
[category]-[product-name]-[variant]-[view].[ext]

Examples:
polo-premium-cotton-navy-front.jpg
polo-premium-cotton-navy-back.jpg
polo-premium-cotton-white-front.jpg
cargo-tactical-khaki-front.jpg
hero-spring-collection-desktop.jpg
hero-spring-collection-mobile.jpg
bento-new-arrivals.jpg
category-bestseller.jpg
```

### Folder Structure

```
/images
  /hero
    - hero-main.jpg
    - hero-main-mobile.jpg
    - newarrivalbanner.jpg
  /products
    /polo
      - polo-[name]-[color]-front.jpg
      - polo-[name]-[color]-back.jpg
      - polo-[name]-[color]-detail.jpg
    /cargo
      - cargo-[name]-[color]-front.jpg
    /chino
      - chino-[name]-[color]-front.jpg
    /jacket
      - jacket-[name]-[color]-front.jpg
  /categories
    - category-bestseller.jpg
    - category-new-arrival.jpg
    - category-sale.jpg
  /bento
    - bento-new-arrivals.jpg
    - bento-premium.jpg
    - bento-style-guide.jpg
    - bento-sale.jpg
    - bento-bestsellers.jpg
    - bento-collections.jpg
  /banners
    - banner-[name].jpg
  /testimonials
    - testimonial-[name].jpg
  /blog
    - blog-[article-slug].jpg
```

### Metadata Requirements

Each image should include:
- **Alt Text:** Descriptive, keyword-rich (provided separately)
- **Title:** Product/image name
- **Copyright:** © ZEHN 2026
- **EXIF Data:** Removed for privacy/file size

---

## Quality Checklist

### Pre-Delivery Checklist

- [ ] **Resolution:** Meets minimum pixel dimensions
- [ ] **Aspect Ratio:** Correct for intended use
- [ ] **Color Space:** sRGB embedded
- [ ] **File Size:** Within specified limits
- [ ] **Compression:** 85-90% quality
- [ ] **Naming:** Follows convention
- [ ] **Background:** Clean (white for products)
- [ ] **Lighting:** Consistent across set
- [ ] **Focus:** Sharp throughout
- [ ] **Composition:** Subject properly framed
- [ ] **Safe Zones:** Critical elements protected
- [ ] **Color Accuracy:** Matches physical product
- [ ] **No Artifacts:** No compression artifacts or noise
- [ ] **Orientation:** Correct (not rotated)

### Technical Validation

Use these tools to validate images:
- **ImageMagick:** Check dimensions and color space
- **Photoshop:** Verify quality and compression
- **TinyPNG/TinyJPG:** Optimize file size
- **Chrome DevTools:** Test responsive display

### Command Line Validation

```bash
# Check image dimensions
identify -format "%f: %wx%h\n" *.jpg

# Check color space
identify -verbose image.jpg | grep Colorspace

# Batch resize (example)
mogrify -resize 1200x1200 -quality 90 *.jpg

# Convert to sRGB
mogrify -colorspace sRGB *.jpg
```

---

## Quick Reference Table

| Component | Aspect Ratio | Min Dimensions | Display Size | Background |
|-----------|--------------|----------------|--------------|------------|
| Hero (Desktop) | 3:2 | 2400×1600px | Flexible | Any |
| Hero (Mobile) | 3:4 | 1200×1600px | 200-450px | Any |
| Product Grid | 1:1 | 1200×1200px | 380px | White |
| Category Tiles | 1:1 or 4:3 | 1600×1600px | 450px | Any |
| Bento Tall | 2:3 | 1200×1800px | Variable | Any |
| Bento Wide | 16:9 | 1600×900px | Variable | Any |
| Bento Square | 1:1 | 1200×1200px | Variable | Any |
| Collection Banner | 4:3 or 1:1 | 1600×1200px | Responsive | Any |
| New Arrival Banner | 3:1 | 2400×800px | 200-450px | Any |
| Product Detail | 1:1 | 2000×2000px | Responsive | White |
| Thumbnails | 1:1 | 400×400px | 80px | White |
| Testimonials | 1:1 | 200×200px | 48px | Neutral |
| Blog Featured | 3:2 | 1600×1067px | Responsive | Any |

---

## Contact & Support

For questions or clarifications regarding these guidelines:

**Project:** ZEHN E-commerce Platform
**Document Version:** 1.0
**Last Updated:** March 13, 2026

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-13 | Initial release - Complete photography guidelines |

---

**Note:** These guidelines are based on the current ZEHN website implementation. All specifications have been cross-verified against the actual codebase to ensure accuracy. Images must be optimized for web delivery while maintaining professional quality standards.
