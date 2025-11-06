#!/usr/bin/env python3
"""
Test Meta API filtering parameter to request specific custom conversions
According to Facebook docs, filtering parameter can be used to request specific action_types
"""

import requests
import json

# Configuration
ACCESS_TOKEN = input("Enter Meta Access Token: ").strip()
AD_ACCOUNT_ID = "act_267879991917703"
API_VERSION = "v23.0"

# Date range
SINCE = "2025-11-01"
UNTIL = "2025-11-05"

# Custom conversion IDs we want to filter for
CUSTOM_CONVERSION_IDS = [
    "3941559526166758",  # login_unique
    "588881190337418",   # deposit_unique
    "1121763705965512",  # deposit_count
    "1501720963876950",  # login_count
    "2594828540712125"   # deposit
]

print("\n" + "="*80)
print("META API FILTERING PARAMETER TEST")
print("="*80)
print("Testing if we can use filtering to get custom conversion data")
print("="*80)

# Test 1: Try filtering parameter with custom conversion IDs
print("\nTest 1: Using filtering parameter for custom conversions")
print("-" * 80)

url = f"https://graph.facebook.com/{API_VERSION}/{AD_ACCOUNT_ID}/insights"

# Build filtering array for custom conversions
# Format: [{"field":"action_type","operator":"IN","value":["offsite_conversion.custom.ID1","offsite_conversion.custom.ID2"]}]
custom_conv_action_types = [f"offsite_conversion.custom.{conv_id}" for conv_id in CUSTOM_CONVERSION_IDS]

filtering = [
    {
        "field": "action_type",
        "operator": "IN",
        "value": custom_conv_action_types
    }
]

params = {
    "fields": "date_start,spend,actions,action_values",
    "time_range": json.dumps({"since": SINCE, "until": UNTIL}),
    "time_increment": "1",
    "level": "account",
    "filtering": json.dumps(filtering),
    "access_token": ACCESS_TOKEN
}

print(f"Filtering for action_types: {custom_conv_action_types[:2]}...")

try:
    response = requests.get(url, params=params)
    data = response.json()
    
    if "error" in data:
        print(f"❌ Error: {data['error']['message']}")
        print(f"Error code: {data['error'].get('code')}")
        print(f"Error type: {data['error'].get('type')}")
    else:
        insights = data.get("data", [])
        print(f"✓ Got {len(insights)} records")
        
        if insights:
            print("\nSample actions found:")
            for insight in insights[:3]:
                date = insight.get("date_start")
                actions = insight.get("actions", [])
                print(f"\n  Date: {date}")
                for action in actions[:5]:
                    print(f"    - {action.get('action_type')}: {action.get('value')}")
        else:
            print("⚠️ No data returned even with filtering")
            
except Exception as e:
    print(f"❌ Request failed: {e}")

# Test 2: Try with conversions field instead of actions
print("\n" + "="*80)
print("Test 2: Using conversions field with filtering")
print("-" * 80)

params = {
    "fields": "date_start,spend,conversions,conversion_values",
    "time_range": json.dumps({"since": SINCE, "until": UNTIL}),
    "time_increment": "1",
    "level": "account",
    "filtering": json.dumps(filtering),
    "access_token": ACCESS_TOKEN
}

try:
    response = requests.get(url, params=params)
    data = response.json()
    
    if "error" in data:
        print(f"❌ Error: {data['error']['message']}")
    else:
        insights = data.get("data", [])
        print(f"✓ Got {len(insights)} records")
        
        if insights:
            print("\nConversions found:")
            for insight in insights[:3]:
                date = insight.get("date_start")
                conversions = insight.get("conversions", [])
                print(f"\n  Date: {date}, Conversions: {len(conversions)}")
                for conv in conversions[:5]:
                    print(f"    - {conv.get('action_type')}: {conv.get('value')}")
        else:
            print("⚠️ No data returned")
            
except Exception as e:
    print(f"❌ Request failed: {e}")

# Test 3: Check if custom conversions need to be explicitly enabled/activated
print("\n" + "="*80)
print("Test 3: Verify custom conversion status")
print("-" * 80)

for conv_id in CUSTOM_CONVERSION_IDS:
    url = f"https://graph.facebook.com/{API_VERSION}/{conv_id}"
    params = {
        "fields": "id,name,rule,custom_event_type,is_archived,data_sources",
        "access_token": ACCESS_TOKEN
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if "error" not in data:
            name = data.get("name")
            is_archived = data.get("is_archived", False)
            data_sources = data.get("data_sources", [])
            
            status = "❌ ARCHIVED" if is_archived else "✓ Active"
            print(f"{status} - {name} (ID: {conv_id})")
            if data_sources:
                print(f"  Data sources: {len(data_sources)}")
        else:
            print(f"❌ {conv_id}: {data['error']['message']}")
            
    except Exception as e:
        print(f"❌ {conv_id}: {e}")

# Test 4: Try fetching at ad level instead of account level
print("\n" + "="*80)
print("Test 4: Ad-level insights (maybe custom conversions appear there?)")
print("-" * 80)

url = f"https://graph.facebook.com/{API_VERSION}/{AD_ACCOUNT_ID}/insights"
params = {
    "fields": "date_start,campaign_name,ad_name,actions,action_values",
    "time_range": json.dumps({"since": SINCE, "until": UNTIL}),
    "time_increment": "all_days",
    "level": "ad",  # Ad level instead of account
    "limit": 5,  # Just get a few to test
    "access_token": ACCESS_TOKEN
}

try:
    response = requests.get(url, params=params)
    data = response.json()
    
    if "error" in data:
        print(f"❌ Error: {data['error']['message']}")
    else:
        insights = data.get("data", [])
        print(f"✓ Got {len(insights)} ad records")
        
        if insights:
            # Check for custom conversion action types
            custom_conv_found = False
            for insight in insights:
                ad_name = insight.get("ad_name", "Unknown")
                actions = insight.get("actions", [])
                
                for action in actions:
                    action_type = action.get("action_type", "")
                    if "offsite_conversion.custom." in action_type:
                        print(f"✓ FOUND custom conversion in ad '{ad_name}':")
                        print(f"  {action_type}: {action.get('value')}")
                        custom_conv_found = True
                        
            if not custom_conv_found:
                print("⚠️ No custom conversions found at ad level either")
                print("\nSample action types from ad level:")
                for insight in insights[:2]:
                    actions = insight.get("actions", [])
                    for action in actions[:3]:
                        print(f"  - {action.get('action_type')}")
                        
except Exception as e:
    print(f"❌ Request failed: {e}")

print("\n" + "="*80)
print("CONCLUSION")
print("="*80)
print("""
If filtering didn't work, this means:

1. Custom conversions (offsite_conversion.custom.<ID>) may not be available
   in the standard insights endpoint

2. You have two options:
   A) Use raw custom events (offsite_conversion.fb_pixel_custom.*)
      - This is what's actually returning data
      - You lose the 14-day deduplication from custom conversions
      
   B) Check if custom conversions need special permissions/setup
      - Verify in Meta Events Manager they're active
      - Check if there's a different API endpoint for custom conversion insights

RECOMMENDATION: Use the raw custom events for now to get data flowing,
then investigate with Meta support why custom conversions aren't appearing.
""")

