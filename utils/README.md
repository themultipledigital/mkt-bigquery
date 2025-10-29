# Project Utilities

This folder contains utility scripts for managing the mkt-bigquery project.

## Scripts

### add_version_comments.py

Adds version comments to Cloudflare Workers and BigQuery Views that don't already have them.

**Usage:**

Run from the project root directory:

```bash
python utils/add_version_comments.py
```

**What it does:**

- Scans all `.js` files in `cloudflareworkers/` directory
- Scans all `.sql` files in `bigqueryviews/` directory
- Adds `// Version: 1.0.0` to JavaScript files (or inside existing comment blocks)
- Adds `-- Version: 1.0.0` to SQL files
- Skips files that already have version comments

**Example output:**

```
Adding Version Comments to Workers and Views
==================================================

Cloudflare Workers (.js files):
  ✓ Added version: meta-capi.js
  - Already has version: meta-report.js
  
BigQuery Views (.sql files):
  ✓ Added version: overview_affilka.sql
  - Already has version: meta_stats_custom.sql

==================================================
Summary:
  Workers: 1 modified, 1 already had versions
  Views:   1 modified, 1 already had versions
  Total:   2 files updated
```

## Other Utilities

See also:
- `cloudflareworkers/utils/` - Contains Cloudflare-specific utilities like the worker download script

