# Template System Guide

## Overview

The PWA Dashboard now includes a **Template Selection System** that allows you to:

1. **Select from available templates** - Choose a template that serves as a starting point
2. **Auto-populate fields** - Load default values from templates (icons, screenshots, descriptions, comments, etc.)
3. **Edit and customize** - Modify the template defaults to create your own version
4. **Generate multiple PWAs** - Use the same template to create different variations

## How It Works

### Template Structure

Each template in `templates/` folder can include a `template.json` file with:

```json
{
  "name": "template_name",
  "displayName": "Template Display Name",
  "description": "Template description",
  "version": "1.0.0",
  "category": "gambling",
  "defaults": {
    "store": { ... },
    "description": "...",
    "images": { ... },
    "comments": { ... },
    ...
  }
}
```

### Template Selection UI

When you create a new PWA or edit an existing one:

1. **Template cards appear at the top** - Showing all available templates
2. **Click a template card** - Selects that template
3. **Click "Load Template Defaults"** - Populates all fields from template

### What Gets Loaded

When you load template defaults, the following fields are populated:

- ✅ **App Name** - From `defaults.store.name`
- ✅ **Developer** - From `defaults.store.developer`
- ✅ **Rating** - From `defaults.store.rating`
- ✅ **Size, Age, Installs** - From `defaults.store.*`
- ✅ **Description** - From `defaults.description`
- ✅ **Language & Category** - From `defaults.design.*`
- ✅ **Rating Distribution** - From `defaults.ratings`
- ✅ **Reviews Count** - From `defaults.reviewsCount`
- ✅ **App Icon** - From `defaults.images.icon` (as base64 data URL)
- ✅ **Screenshots** - From `defaults.images.screenshots` (as base64 data URLs)
- ✅ **Comments/Reviews** - From `defaults.comments.list`
- ✅ **Tags** - From `defaults.tags`

## Creating a Template

### Step 1: Add Your Template Files

1. Create a folder in `templates/` (e.g., `templates/my_template/`)
2. Add your PWA files (index.html, home.php, manifest.json, etc.)
3. Add your static assets (CSS, JS, images, icons)

### Step 2: Create Template Config File

Create `templates/my_template/template.json`:

```json
{
  "name": "my_template",
  "displayName": "My Awesome Template",
  "description": "A beautiful template for casino games",
  "version": "1.0.0",
  "category": "gambling",
  "defaults": {
    "store": {
      "name": "Default App Name",
      "developer": "Default Developer",
      "rating": 5.0,
      "size": "10MB",
      "age": "17+",
      "installs": "10K"
    },
    "description": "This is a default description for apps created with this template.",
    "design": {
      "language": "en",
      "category": "gambling"
    },
    "ratings": {
      "5": 80,
      "4": 15,
      "3": 3,
      "2": 1,
      "1": 1
    },
    "reviewsCount": "1M",
    "images": {
      "icon": "static/icons/icon.png",
      "screenshots": [
        "static/images/screenshot1.jpg",
        "static/images/screenshot2.jpg",
        "static/images/screenshot3.jpg"
      ]
    },
    "comments": {
      "list": [
        {
          "username": "User1",
          "rating": 5,
          "text": "Great app!"
        }
      ]
    },
    "tags": ["game", "casino", "entertainment"]
  }
}
```

**Important Paths:**
- Icon and screenshot paths are **relative to template folder**
- Example: `static/icons/icon.png` refers to `templates/my_template/static/icons/icon.png`

### Step 3: Use Your Template

1. Refresh the dashboard
2. Create a new PWA
3. Your template will appear in the template selection
4. Select it and click "Load Template Defaults"

## Example: Big Bass Splash Template

The existing `template_bigbasssplashplaygame` template includes:

- ✅ Complete template.json with all defaults
- ✅ Pre-configured app name, developer, rating
- ✅ Default description
- ✅ 6 screenshots
- ✅ 5 default comments
- ✅ Rating distribution
- ✅ Category: gambling

**To use it:**
1. Create a new PWA
2. Click the "Big Bass Splash Play Game" template card
3. Click "Load Template Defaults"
4. All fields are populated!
5. Edit any fields you want to change
6. Save and generate

## Best Practices

### 1. Template Structure
- Keep templates organized in their own folders
- Include all necessary assets (CSS, JS, images)
- Use relative paths in template.json

### 2. Default Values
- Provide realistic default values
- Include varied content (screenshots, comments)
- Set appropriate categories and languages

### 3. Customization
- Templates are starting points - users can edit everything
- Don't worry about being too specific with defaults
- Users can override any template value

## API Endpoints

### Get Template Defaults

```
GET /api/get-template-defaults.php?template=template_name
```

Returns:
```json
{
  "success": true,
  "defaults": { ... },
  "templateName": "template_name",
  "displayName": "Template Display Name"
}
```

### Template Functions

- `getAvailableTemplates()` - Get list of all templates
- `getTemplateConfig($templateName)` - Get template config JSON
- `getTemplateInfo($templateName)` - Get template metadata (name, description, etc.)

## Troubleshooting

### Template not appearing
- Check that template folder exists in `templates/`
- Verify template has `index.html` or `home.php`
- Refresh the page

### Defaults not loading
- Check `template.json` exists and is valid JSON
- Verify file paths in template.json are correct
- Check PHP error logs

### Icons/screenshots not showing
- Verify image files exist at specified paths
- Check file permissions
- Paths in template.json should be relative to template folder

## Future Enhancements

Potential features:
- Template preview
- Template marketplace
- Template versioning
- Template categories/filtering
- Export templates as packages

