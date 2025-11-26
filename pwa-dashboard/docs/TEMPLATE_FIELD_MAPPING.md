# Template Field Mapping Documentation

This document maps form fields from the PWA Dashboard editor to their corresponding locations in template files.

## Form Field → Template Location Mapping

### App Name (`config[store][name]`)

**Form Field**: Store Page Design → App name

**Template Locations**:

#### index.html
- Line 4: `<title class="name">Big Bass Splash</title>`
- Line 88: `<p class="name skiptranslate">Big Bass Splash</p>`
- Line 316: `<p class="smallname skiptranslate">Big Bass Splash</p>` (in description fullscreen)
- Line 395: `<p class="smallname skiptranslate">Big Bass Splash</p>` (in reviews fullscreen)
- Multiple: Hardcoded string "Big Bass Splash" in description text

#### home.php / home.html
- Line 33: `<title>Gates of Olympus</title>`
- Line 77: `<span class="name">Gates of Olympus</span>`
- Multiple: Hardcoded string "Gates of Olympus" throughout

#### Other files
- `html/index.html`: Similar to index.html
- `pagedirect.php`: Similar to index.html

**Replacement Strategy**:
1. CSS class-based: Find elements with `class="name"` or `class="smallname"`
2. Hardcoded string replacement: Replace "Big Bass Splash" and "Gates of Olympus"
3. Title tag replacement: Update `<title>` tags

---

### Developer Name (`config[store][developer]`)

**Form Field**: Store Page Design → Developer

**Template Locations**:

#### index.html
- Line 90: `<p class="developer devname skiptranslate">IGAMING AGENCY</p>`
- Line 193: `<div class="developer-name devname skiptranslate">IGAMING AGENCY</div>`
- Line 247: `<div class="information-value devname skiptranslate">IGAMING AGENCY</div>`
- Line 271: `<div class="information-value devname skiptranslate">© IGAMING AGENCY</div>`
- Line 368: `<span class="devname skiptranslate">IGAMING AGENCY</span>`

#### home.php / home.html
- Line 121: `<span class="value">Zayd Group</span>` (in developer stat block)

**Hardcoded Values to Replace**:
- "IGAMING AGENCY"
- "HELIX WatchStudio"
- "Zayd Group"

**Replacement Strategy**:
1. CSS class-based: Find elements with `class="developer"`, `class="devname"`, or `class="developer-name"`
2. Hardcoded string replacement: Replace known developer names

---

### Rating (`config[store][rating]`)

**Form Field**: Store Page Design → Rating / Ratings and Reviews → Rating

**Template Locations**:

#### index.html
- Line 115: `<div class="ratingvalue">4.8</div>` (Android)
- Line 120: `<div class="ios shortinfo ratingvalue">4.8</div>` (iOS)
- Line 227: `<div class="rating-big ratingvalue">4.8</div>` (in ratings section)

#### home.php / home.html
- Line 82: `<span>4.8</span>` (in rating badge)

**Replacement Strategy**:
1. CSS class-based: Find elements with `class="ratingvalue"` or `class="rating-big ratingvalue"`
2. Hardcoded value replacement: Replace "4.8"

---

### Reviews Count (`config[reviewsCount]`)

**Form Field**: Ratings and Reviews → Number of reviews

**Template Locations**:

#### index.html
- Line 118: `<span class="ratingscountshort">132K</span>` (Android, with " reviews")
- Line 119: `<span class="ratingscountshort">132K</span>` (iOS, with " RATINGS")
- Line 230: `<div class="rating-count android ratingscountlong">132,451</div>`
- Line 231: `<div class="rating-count ios"><span class="ratingscountlong">132 451</span> Ratings</div>`

#### home.php / home.html
- Line 84: `<span>1M reviews</span>` (in rating badge)

**Replacement Strategy**:
1. CSS class-based: Find elements with `class="ratingscountshort"` or `class="ratingscountlong"`
2. Format handling: May need to parse "132K" format or use as-is

---

### Size (`config[store][size]`)

**Form Field**: Store Page Design → Size

**Template Locations**:

#### index.html
- Line 126: `<div class="android label size">12 MB</div>` (Android)
- Line 128: `<div class="ios shortinfo sizeNmbr">12</div>` + `<div class="ios label sizeLttr">MB</div>` (iOS - split format)
- Line 251: `<div class="information-value size">12 MB</div>` (iOS information section)
- Line 364: `<span class="size">12 MB</span>` (in app info section)

**Replacement Strategy**:
1. CSS class-based: Find elements with `class="size"`
2. For iOS split format: Update both `sizeNmbr` (number) and `sizeLttr` (unit)

---

### Age Rating (`config[store][age]`)

**Form Field**: Store Page Design → Age

**Template Locations**:

#### index.html
- Line 133: `<div class="ios shortinfo">18+</div>` (iOS)
- Line 144: `<div class="android label">18+</div>` (Android)
- Line 267: `<div class="information-value">18+</div>` (iOS information section)

**Replacement Strategy**:
1. Context-based: Find age rating elements (may need to check parent context)
2. Hardcoded value replacement: Replace "18+", "17+" patterns

---

### Installs (`config[store][installs]`)

**Form Field**: Store Page Design → Installs

**Template Locations**:

#### index.html
- Line 138: `<div class="installs">700K+</div>` (Android)
- Line 360: `<span class="installslong">700K+</span>` (in app info section)

**Replacement Strategy**:
1. CSS class-based: Find elements with `class="installs"` or `class="installslong"`
2. Hardcoded value replacement: Replace "700K+"

---

### Icon (`config[images][icon]`)

**Form Field**: Store Page Design → Icon upload

**Template Locations**:

#### index.html
- Line 77: `<img src="./static/icons/icon.png">` (in navbar)
- Line 82: `<img src="./static/icons/icon.png">` (in header)
- Line 315: `<img src="./static/icons/icon.png">` (in fullscreen navbar)
- Line 394: `<img src="./static/icons/icon.png">` (in reviews fullscreen navbar)

#### home.php / home.html
- Line 74: `<img src="./static/home/images/app-icon.jpg" alt="...">`

**Replacement Strategy**:
1. Process uploaded icon (base64 data URL) to files:
   - Save to `static/icons/icon.png` (for index.html)
   - Save to `static/home/images/app-icon.jpg` or `.png` (for home.php)
2. Replace all icon `src` attributes

---

### Screenshots (`config[images][screenshots][]`)

**Form Field**: Images and Video → Screenshots

**Template Locations**:

#### index.html
- Line 148: Screenshots in carousel:
  - `<img src="./static/images/screenshot0.jpg">`
  - `<img src="./static/images/screenshot1.jpg">`
  - `<img src="./static/images/screenshot2.jpg">`
  - `<img src="./static/images/screenshot3.jpg">`
- Line 298: Same screenshots in fullscreen swiper

#### home.php / home.html
- Lines 209-253: Screenshots in grid:
  - `<img src="./static/home/images/screenshot1.jpg">`
  - `<img src="./static/home/images/screenshot2.jpg">`
  - ... up to screenshot6.jpg

**Replacement Strategy**:
1. Map screenshot array index to template location
2. Handle two formats:
   - `static/images/screenshot{index}.jpg` (index.html, 0-indexed)
   - `static/home/images/screenshot{index+1}.jpg` (home.php, 1-indexed)

---

### Description (`config[description]`)

**Form Field**: App description and Tags → Description

**Template Locations**:

#### index.html
- Line 165-167: Short description in Android view
- Line 168-190: Full description in iOS view
- Line 324-344: Full description in fullscreen view

#### home.php / home.html
- Line 88-90: Subtitle paragraph
- Line 262-270: About the Game section

**Replacement Strategy**:
1. Replace subtitle/tagline elements
2. Replace description paragraphs
3. Replace full description sections

---

### Tags (`config[tags]`)

**Form Field**: App description and Tags → Tags

**Template Locations**:

#### index.html
- Line 208: Category tags: `<div class="category">#1 top in Casino</div><div class="category">Slots</div><div class="category">Single player</div>`

**Replacement Strategy**:
1. Parse comma-separated tags from form
2. Replace or update category divs

---

## Summary of CSS Classes Used for Replacement

| CSS Class | Maps To | Notes |
|-----------|---------|-------|
| `class="name"` | App name | Primary app name display |
| `class="smallname"` | App name | Small name in modals |
| `class="developer"` or `class="devname"` | Developer name | Multiple variations |
| `class="ratingvalue"` | Rating | Numeric rating value |
| `class="ratingscountshort"` | Reviews count | Short format (e.g., "132K") |
| `class="ratingscountlong"` | Reviews count | Long format (e.g., "132,451") |
| `class="size"` | Size | App size |
| `class="installs"` or `class="installslong"` | Installs | Download count |
| Icon `src` attributes | Icon | Various locations |
| Screenshot `src` attributes | Screenshots | Array mapping needed |

## Notes

1. **Multiple File Formats**: Templates use both `index.html` (Android/iOS store listing) and `home.php` (landing page). Both need processing.

2. **Multiple Class Variations**: Some values use multiple CSS classes (e.g., `class="developer devname skiptranslate"`). Replacement patterns must handle all variations.

3. **Hardcoded String Fallback**: In addition to CSS class-based replacement, hardcoded string replacement serves as a fallback for values that might not have consistent classes.

4. **Format Variations**: Some values appear in different formats:
   - Reviews: "132K" (short) vs "132,451" (long) vs "1M"
   - Size: "12 MB" (combined) vs split "12" + "MB" (iOS)

5. **Index Differences**: Screenshot indexing differs:
   - `index.html`: 0-indexed (screenshot0.jpg)
   - `home.php`: 1-indexed (screenshot1.jpg)

