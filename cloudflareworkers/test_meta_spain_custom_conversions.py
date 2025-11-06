#!/usr/bin/env python3
"""
Test Meta API for Spain custom conversions (by ID)
Check if custom conversions are accessible via API
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

# Custom conversion IDs
CUSTOM_CONVERSIONS = [
    "3941559526166758",  # login_unique
    "588881190337418",   # deposit_unique
    "1121763705965512",  # deposit_count
    "1501720963876950",  # login_count
    "2594828540712125"   # deposit
]

print("\n" + "="*80)
print("META CUSTOM CONVERSION API TEST")
print("="*80)
print(f"Testing if custom conversions are accessible via API")
print("="*80)

# First, try to get custom conversion details
print("\nStep 1: Checking custom conversion objects...")
for conv_id in CUSTOM_CONVERSIONS:
    url = f"https://graph.facebook.com/{API_VERSION}/{conv_id}"
    params = {
        "fields": "id,name,rule,custom_event_type",
        "access_token": ACCESS_TOKEN
    }
    
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            print(f"\n✓ {conv_id}: {data.get('name')}")
            print(f"  Type: {data.get('custom_event_type')}")
        else:
            print(f"\n✗ {conv_id}: {response.status_code} - {response.text[:100]}")
    except Exception as e:
        print(f"\n✗ {conv_id}: Error - {e}")

# Now test insights with action_breakdown
print("\n" + "="*80)
print("Step 2: Testing insights API with different approaches...")
print("="*80)

# Approach 1: Use action_breakdowns
print("\nApproach 1: Using action_breakdowns=['action_type']")
url = f"https://graph.facebook.com/{API_VERSION}/{AD_ACCOUNT_ID}/insights"
params = {
    "fields": "date_start,spend,actions,action_values",
    "time_range": json.dumps({"since": SINCE, "until": UNTIL}),
    "time_increment": "all_days",
    "level": "account",
    "action_breakdowns": json.dumps(["action_type"]),
    "access_token": ACCESS_TOKEN
}

try:
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    
    insights = data.get("data", [])
    if insights:
        print(f"✓ Got {len(insights)} records")
        print("\nActions found:")
        for insight in insights:
            actions = insight.get("actions", [])
            for action in actions[:10]:  # Show first 10
                action_type = action.get("action_type")
                value = action.get("value")
                print(f"  - {action_type}: {value}")
            if len(actions) > 10:
                print(f"  ... and {len(actions) - 10} more")
    else:
        print("✗ No data returned")
        
except Exception as e:
    print(f"✗ Error: {e}")

# Approach 2: Check what action types are available
print("\n" + "="*80)
print("Step 3: All action types from conversions field")
print("="*80)

url = f"https://graph.facebook.com/{API_VERSION}/{AD_ACCOUNT_ID}/insights"
params = {
    "fields": "conversions,conversion_values",
    "time_range": json.dumps({"since": SINCE, "until": UNTIL}),
    "time_increment": "1",
    "level": "account",
    "access_token": ACCESS_TOKEN
}

try:
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    
    insights = data.get("data", [])
    
    all_action_types = set()
    for insight in insights:
        conversions = insight.get("conversions", [])
        for conv in conversions:
            all_action_types.add(conv.get("action_type"))
    
    print(f"\nFound {len(all_action_types)} unique action types:")
    for action_type in sorted(all_action_types):
        print(f"  - {action_type}")
        
        # Check if this matches any custom conversion pattern
        for conv_id in CUSTOM_CONVERSIONS:
            expected = f"offsite_conversion.custom.{conv_id}"
            if action_type == expected:
                print(f"    ✓ MATCHES custom conversion {conv_id}!")
                
except Exception as e:
    print(f"✗ Error: {e}")

print("\n" + "="*80)
print("DIAGNOSIS")
print("="*80)
print("""
The API is returning custom EVENTS (offsite_conversion.fb_pixel_custom.*) 
but NOT custom CONVERSIONS (offsite_conversion.custom.<ID>).

This means:
1. Your pixel is firing events correctly (login, secondDeposit)
2. But the custom conversions (with deduplication rules) may not be active
3. OR the custom conversions need to be referenced differently in the API

SOLUTION OPTIONS:
A) Track the raw events instead (offsite_conversion.fb_pixel_custom.*)
   - You'll lose the deduplication logic
   
B) Check Meta Events Manager to verify custom conversions are active
   - Make sure they're enabled and have data
   
C) Use a different API endpoint to access custom conversion data
   - May need to query custom conversions directly
""")

