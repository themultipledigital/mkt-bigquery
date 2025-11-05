# Spain Meta Conversions - Issue Resolution Summary

**Date:** November 5, 2025  
**Issue:** Looker Studio showing zeros for all conversion data  
**Account:** FRM-SPAIN (act_267879991917703)

## 🔍 Problem Discovery

The user reported that their Looker Studio dashboard was showing **zero conversions** for all metrics from Nov 1-5, 2025, despite the Meta ads running and generating spend/impressions/clicks.

## 🧪 Testing Process

Created three Python test scripts to diagnose the issue:

1. **`test_meta_spain_conversions.py`**: 
   - Tested basic insights endpoint
   - Found: API returning raw custom events (`offsite_conversion.fb_pixel_custom.*`)
   - Found: NO custom conversions (`offsite_conversion.custom.<ID>`) in response

2. **`test_meta_spain_custom_conversions.py`**:
   - Verified custom conversion objects exist and are accessible
   - Checked their status (active vs archived)
   - Found: All 5 custom conversions configured, but 1 was ARCHIVED

3. **`test_meta_filtering.py`**:
   - **BREAKTHROUGH**: Used `filtering` parameter with `actions` field
   - **Result**: Custom conversions ARE available when using the correct field!

## ✅ Root Cause

**PRIMARY ISSUE:** The worker was requesting the **WRONG API FIELD**:
- ❌ Worker was requesting: `conversions` and `conversion_values` fields
- ✅ Custom conversions are in: `actions` and `action_values` fields

This is why the API was returning data (we could see it in tests) but the worker wasn't capturing it!

**SECONDARY ISSUE:** One archived custom conversion was also removed:
```
❌ ARCHIVED - deposit (ID: 2594828540712125)
```

## 📊 Test Results (Nov 1-5, 2025)

**Working Custom Conversions with Data:**
- ✅ login_unique (ID: 3941559526166758): ~30-50 conversions/day
- ✅ deposit_unique (ID: 588881190337418): ~7 conversions/day  
- ✅ deposit_count (ID: 1121763705965512): ~22-45 conversions/day
- ✅ login_count (ID: 1501720963876950): ~240-726 conversions/day

**Archived (Removed):**
- ❌ deposit (ID: 2594828540712125): ARCHIVED in Meta

## 🔧 Changes Made

### 1. `cloudflareworkers/meta-reportV1-spain.js`

**CRITICAL FIX - Changed API fields:**

**Before:**
```javascript
const FIELDS = [
  ...BASE_FIELDS,
  "conversions",        // ❌ Wrong field!
  "conversion_values"   // ❌ Wrong field!
];

// Later in code:
const convArr = Array.isArray(r.conversions) ? r.conversions : [];
const convValArr = Array.isArray(r.conversion_values) ? r.conversion_values : [];
```

**After:**
```javascript
const FIELDS = [
  ...BASE_FIELDS,
  "actions",        // ✅ Correct field for custom conversions!
  "action_values"   // ✅ Correct field for values!
];

// Later in code:
const convArr = Array.isArray(r.actions) ? r.actions : [];
const convValArr = Array.isArray(r.action_values) ? r.action_values : [];
```

**Also removed archived conversion:**

**Before:**
```javascript
const ACTION_TYPES = [
  "offsite_conversion.custom.3941559526166758",  // login_unique
  "offsite_conversion.custom.588881190337418",   // deposit_unique
  "offsite_conversion.custom.1121763705965512",  // deposit_count
  "offsite_conversion.custom.1501720963876950",  // login_count
  "offsite_conversion.custom.2594828540712125"   // deposit (ARCHIVED!)
];
```

**After:**
```javascript
const ACTION_TYPES = [
  "offsite_conversion.custom.3941559526166758",  // login_unique
  "offsite_conversion.custom.588881190337418",   // deposit_unique
  "offsite_conversion.custom.1121763705965512",  // deposit_count
  "offsite_conversion.custom.1501720963876950"   // login_count
];
```

Updated version from `1.0.0-SPAIN` to `1.0.2-SPAIN`.

### 2. `bigqueryviews/meta_stats_es_custom.sql`

- Removed all `deposit` conversion columns (4 columns removed)
- Added note about archived conversion
- Updated version from `2.0.0` to `2.0.1`

Removed columns:
- `deposit_7d_click_1d_view`
- `deposit_val_7d_click_1d_view`
- `deposit_1d_click_1d_view`
- `deposit_val_1d_click_1d_view`

## 📝 Key Learnings

1. **CRITICAL: Custom Conversions vs Actions Field**
   - ❌ `conversions` field: Only contains standard FB events (Purchase, Lead, etc.)
   - ✅ `actions` field: Contains BOTH standard events AND custom conversions
   - Custom conversions format: `offsite_conversion.custom.<ID>`
   - **Always use `actions` and `action_values` fields for custom conversions!**

2. **Testing Revealed the Issue**
   - Test 1 with `actions` field: ✅ Got custom conversion data
   - Test 2 with `conversions` field: ❌ Got 0 records
   - This proved the field mismatch was the root cause

3. **Archived Conversions Can Break Requests**
   - Always verify conversion status before including in `ACTION_TYPES`
   - Check status via: `GET /{custom_conversion_id}?fields=is_archived`

4. **Filtering Parameter for Debugging**
   - The `filtering` parameter can be used to specifically request certain `action_type` values
   - Useful for debugging which conversions are returning data
   - Example: `filtering=[{"field":"action_type","operator":"IN","value":["offsite_conversion.custom.123"]}]`

## 🚀 Expected Outcome

After deploying these changes:
1. Worker will successfully fetch conversion data
2. BigQuery table `meta_stats_es` will populate with conversions
3. Looker Studio will display non-zero conversion metrics
4. Data will show:
   - login_unique: ~30-50/day
   - deposit_unique: ~7/day
   - deposit_count: ~22-45/day
   - login_count: ~240-726/day

## 🧹 Cleanup

Test scripts created (can be kept for future debugging):
- `test_meta_spain_conversions.py`
- `test_meta_spain_custom_conversions.py`
- `test_meta_filtering.py`

## ✨ Bonus Discovery

The test also found a third custom event being tracked:
- `offsite_conversion.fb_pixel_custom.registration_completed`

This wasn't in the custom conversions list, so it's a raw event. Could be added to future tracking if needed!

---

## Next Steps for User

1. **Deploy Updated Worker**
   ```bash
   cd cloudflareworkers
   wrangler deploy meta-reportV1-spain.js
   ```

2. **Update BigQuery View**
   - Run the updated SQL from `bigqueryviews/meta_stats_es_custom.sql`
   - This will remove the archived conversion columns

3. **Test the Worker**
   ```
   https://meta-reportv1-spain.digital-bcc.workers.dev/?account=FRM-SPAIN&dest=bq
   ```

4. **Verify in BigQuery**
   ```sql
   SELECT 
     date_start,
     SUM(JSON_EXTRACT_SCALAR(goal, '$.conversions')) as total_conversions
   FROM `level-hope-462409-a8.mkt_channels.meta_stats_es`,
        UNNEST(goals_breakdown) as goal
   WHERE date_start >= '2025-11-01'
   GROUP BY date_start
   ORDER BY date_start;
   ```

5. **Check Looker Studio**
   - Refresh your data source
   - Conversion metrics should now populate!

