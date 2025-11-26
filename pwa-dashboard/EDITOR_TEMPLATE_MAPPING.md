# Editor to Template Mapping

## Understanding the Connection

### Template = Structure (Always Required)

**Even for "manual entry", a template must be selected** because:
- Template determines which files are generated (index.html, home.php, manifest.json, etc.)
- Template determines the layout and structure
- Template provides the base HTML/CSS/JS structure

**The `template_bigbasssplashplaygame` template IS the structure.**

### Default Values = Optional Pre-fill

The `template.json` file contains default values that can:
- Pre-fill the editor when you click "Load Template Defaults"
- Provide starting values (icons, screenshots, comments, etc.)

**You can still edit everything** after loading defaults.

## How Editor Fields Connect to Template

### ✅ Confirmed Connections

| Editor Field | Maps To | Template Files | Status |
|-------------|---------|----------------|--------|
| `config[store][name]` | App Name | `index.html`, `home.php`, `<title>`, `manifest.json` | ✅ Working |
| `config[store][developer]` | Developer Name | `index.html`, `home.php` | ✅ Working |
| `config[store][rating]` | Rating | `index.html`, `home.php` | ✅ Working |
| `config[description]` | Description | `index.html`, `home.php`, `manifest.json` | ✅ Working |
| `config[images][icon]` | App Icon | `static/icons/*.png`, `manifest.json` | ✅ Working |
| `config[images][screenshots]` | Screenshots | `static/home/images/screenshot*.jpg` | ✅ Working |
| `config[push][oneSignalAppId]` | OneSignal ID | `index.html`, `home.php` (JavaScript) | ✅ Working |
| `config[reviewsCount]` | Reviews Count | `index.html`, `home.php` | ✅ Working |

### Processing Flow

1. **Editor Fields** → Saved to `data/pwas.json`
2. **Generate Button** → Calls `api/generate-pwa.php`
3. **Template Engine** → Reads `templates/{template}/` files
4. **Variable Preparation** → `prepareTemplateVariables()` extracts editor values
5. **File Processing** →
   - `processHTMLTemplate()` replaces content in HTML files
   - `generateManifest()` creates manifest.json
   - `processAssets()` copies icons/screenshots
6. **Output** → Files written to `generated/{pwa_id}/`

## Current Implementation

### What's Working ✅

1. **Template Structure**: Always uses `template_bigbasssplashplaygame` structure
2. **Basic Substitution**: App name, developer, description are replaced
3. **Asset Copying**: Icons and screenshots are copied
4. **Manifest Generation**: manifest.json is generated with editor values

### What Could Be Enhanced 🔧

1. **More Comprehensive Replacement**: 
   - Currently replaces some hardcoded values, but could be more systematic
   - Should replace ALL instances of template defaults

2. **Better Content Mapping**:
   - Subtitle/tagline replacement could be improved
   - Rating display replacement could be enhanced
   - Comments could be integrated into template if needed

## Testing the Connection

### Test 1: Manual Entry with Template Structure

1. Create new PWA
2. **Don't load defaults** (template still selected for structure)
3. Fill in manually:
   - App Name: "My Custom App"
   - Developer: "My Company"
   - Description: "My custom description"
4. Generate PWA
5. **Verify**: Generated `home.php` contains "My Custom App", "My Company", "My custom description"

### Test 2: Template Defaults + Edits

1. Create new PWA
2. **Load Template Defaults** (pre-fills all fields)
3. Edit some values:
   - Change App Name to "Modified App"
   - Change Description
4. Generate PWA
5. **Verify**: Generated files use "Modified App" and edited description

### Test 3: Multiple Variations

1. Create PWA #1: "App A" with icon A
2. Create PWA #2: "App B" with icon B
3. Generate both
4. **Verify**: Each has unique values, but same structure

## Conclusion

**The editor IS correctly connected to the template generation system.**

- ✅ Template provides structure (always required)
- ✅ Editor values replace template defaults
- ✅ Generated PWAs reflect editor values
- ✅ Same template structure, different content = variations

The system works as intended: the template provides the structure, and editor fields customize the content to create variations.

