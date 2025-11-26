# Template Audit Results

This document lists all hardcoded values found in the template files that need to be replaced during PWA generation.

## Template: template_bigbasssplashplaygame

### Files Audited
- `index.html` (Primary app store listing page)
- `home.php` (Landing/hero page)
- `home.html` (Alternative landing page)
- `html/index.html` (Variant)
- `pagedirect.php` (Alternative page)

---

## Hardcoded Values by Category

### App Name Values
**Found in**: index.html, home.php, home.html, html/index.html, pagedirect.php

- "Big Bass Splash" - Main template default for index.html
- "Gates of Olympus" - Main template default for home.php/home.html

**Locations**:
- `<title class="name">Big Bass Splash</title>` (index.html:4)
- `<p class="name skiptranslate">Big Bass Splash</p>` (index.html:88)
- `<p class="smallname skiptranslate">Big Bass Splash</p>` (index.html:316, 395)
- `<span class="name">Gates of Olympus</span>` (home.php:77)
- Multiple hardcoded strings in description text

**Maps to**: `config[store][name]` form field

---

### Developer Name Values
**Found in**: index.html, home.php, home.html

- "IGAMING AGENCY" - Primary default
- "HELIX WatchStudio" - Alternative default
- "Zayd Group" - Used in home.php

**Locations**:
- `<p class="developer devname skiptranslate">IGAMING AGENCY</p>` (index.html:90)
- `<div class="developer-name devname skiptranslate">IGAMING AGENCY</div>` (index.html:193)
- `<div class="information-value devname skiptranslate">IGAMING AGENCY</div>` (index.html:247)
- `<div class="information-value devname skiptranslate">© IGAMING AGENCY</div>` (index.html:271)
- `<span class="devname skiptranslate">IGAMING AGENCY</span>` (index.html:368)
- `<span class="value">Zayd Group</span>` (home.php:121)

**Maps to**: `config[store][developer]` form field

---

### Rating Values
**Found in**: index.html, home.php, home.html

- "4.8" - Default rating value

**Locations**:
- `<div class="ratingvalue">4.8</div>` (index.html:115, 120, 227)
- `<span>4.8</span>` (home.php:82)

**Maps to**: `config[store][rating]` form field

---

### Reviews Count Values
**Found in**: index.html, home.php, home.html

- "132K" - Short format
- "132,451" / "132 451" - Long format
- "1M" - Alternative format

**Locations**:
- `<span class="ratingscountshort">132K</span>` (index.html:118, 119)
- `<div class="rating-count android ratingscountlong">132,451</div>` (index.html:230)
- `<span class="ratingscountlong">132 451</span>` (index.html:231)
- `<span>1M reviews</span>` (home.php:84)

**Maps to**: `config[reviewsCount]` form field

---

### Size Values
**Found in**: index.html

- "12 MB" - Default app size

**Locations**:
- `<div class="android label size">12 MB</div>` (index.html:126)
- Split format: `<div class="ios shortinfo sizeNmbr">12</div>` + `<div class="ios label sizeLttr">MB</div>` (index.html:128-129)
- `<div class="information-value size">12 MB</div>` (index.html:251)
- `<span class="size">12 MB</span>` (index.html:364)

**Maps to**: `config[store][size]` form field

---

### Age Rating Values
**Found in**: index.html

- "18+" - Default age rating

**Locations**:
- `<div class="ios shortinfo">18+</div>` (index.html:133)
- `<div class="android label">18+</div>` (index.html:144)
- `<div class="information-value">18+</div>` (index.html:267)

**Maps to**: `config[store][age]` form field

---

### Installs/Downloads Values
**Found in**: index.html

- "700K+" - Default installs count

**Locations**:
- `<div class="installs">700K+</div>` (index.html:138)
- `<span class="installslong">700K+</span>` (index.html:360)

**Maps to**: `config[store][installs]` form field

---

### Icon Paths
**Found in**: index.html, home.php, home.html

**Locations**:
- `./static/icons/icon.png` (index.html:77, 82, 315, 394)
- `./static/home/images/app-icon.jpg` (home.php:74, home.html:52)

**Maps to**: `config[images][icon]` form field (base64 data URL from upload)

---

### Screenshot Paths
**Found in**: index.html, home.php, home.html

**index.html format**:
- `./static/images/screenshot0.jpg`
- `./static/images/screenshot1.jpg`
- `./static/images/screenshot2.jpg`
- `./static/images/screenshot3.jpg`

**home.php format**:
- `./static/home/images/screenshot1.jpg`
- `./static/home/images/screenshot2.jpg`
- ... up to screenshot6.jpg

**Maps to**: `config[images][screenshots][]` form field array

---

### Description/Content Values
**Found in**: index.html, home.php, home.html

**Locations**:
- Description text in various `<p class="subtitle">`, `<div class="bodytext">`, etc.
- Hardcoded game descriptions mentioning "Big Bass Splash" and "Gates of Olympus"

**Maps to**: `config[description]` form field

---

## Replacement Strategy

1. **CSS Class-Based Replacement** (Primary): Match elements by CSS class names and replace inner content
2. **Hardcoded String Replacement** (Fallback): Replace known template default strings throughout the file
3. **Pattern-Based Replacement**: Use regex patterns to find and replace values in specific contexts

## Notes

- Some values appear in multiple formats (e.g., reviews: "132K" vs "132,451")
- Some values are split across multiple elements (e.g., size: "12" + "MB" in iOS format)
- Icon paths differ between `index.html` (`static/icons/`) and `home.php` (`static/home/images/`)
- Screenshot indexing differs: `index.html` uses 0-indexed, `home.php` uses 1-indexed

