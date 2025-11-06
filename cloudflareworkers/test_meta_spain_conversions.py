#!/usr/bin/env python3
"""
Test Meta API for Spain account conversions
Checks if conversion data is being returned for specific date range
"""

import requests
import json
from datetime import datetime

# Configuration
ACCESS_TOKEN = input("Enter Meta Access Token: ").strip()
AD_ACCOUNT_ID = "act_267879991917703"  # Spain account
API_VERSION = "v23.0"

# Date range to test
SINCE = "2025-11-01"
UNTIL = "2025-11-05"

# Custom conversion IDs from meta-reportV1-spain.js
CONVERSIONS = {
    "3941559526166758": "login_unique",
    "588881190337418": "deposit_unique",
    "1121763705965512": "deposit_count",
    "1501720963876950": "login_count",
    "2594828540712125": "deposit"
}

# Attribution windows to test
WINDOWS = ["value", "1d_view", "7d_view", "1d_click", "7d_click"]
ACTION_WINDOWS = ["1d_click", "7d_click", "1d_view", "7d_view"]

print("\n" + "="*80)
print("META SPAIN CONVERSIONS TEST")
print("="*80)
print(f"Account: {AD_ACCOUNT_ID}")
print(f"Date Range: {SINCE} to {UNTIL}")
print(f"Conversions to check: {len(CONVERSIONS)}")
print("="*80)

# Build API URL
base_url = f"https://graph.facebook.com/{API_VERSION}/{AD_ACCOUNT_ID}/insights"

# Fields to fetch
fields = [
    "date_start",
    "campaign_name",
    "spend",
    "impressions",
    "clicks",
    "conversions",
    "conversion_values"
]

params = {
    "fields": ",".join(fields),
    "time_range": json.dumps({"since": SINCE, "until": UNTIL}),
    "time_increment": "1",  # Daily breakdown
    "level": "account",  # Account level to see totals
    "action_attribution_windows": json.dumps(ACTION_WINDOWS),
    "access_token": ACCESS_TOKEN,
    "limit": 1000
}

print(f"\nFetching data from Meta API...")
print(f"URL: {base_url}")
print(f"Time Range: {SINCE} to {UNTIL}")

try:
    response = requests.get(base_url, params=params)
    response.raise_for_status()
    data = response.json()
    
    if "error" in data:
        print(f"\n❌ API Error: {data['error']['message']}")
        print(f"Error details: {json.dumps(data['error'], indent=2)}")
        exit(1)
    
    insights = data.get("data", [])
    print(f"\n✓ Successfully fetched {len(insights)} daily records")
    
    if not insights:
        print("\n⚠️ WARNING: No data returned from API for this date range!")
        print("This could mean:")
        print("  1. No ads were running during this period")
        print("  2. No conversions occurred")
        print("  3. The account has no active campaigns")
        exit(0)
    
    # Analyze conversion data
    print("\n" + "="*80)
    print("CONVERSION DATA ANALYSIS")
    print("="*80)
    
    conversion_totals = {}
    for conv_id in CONVERSIONS.keys():
        conversion_totals[conv_id] = {
            "name": CONVERSIONS[conv_id],
            "total": 0,
            "1d_click": 0,
            "7d_click": 0,
            "1d_view": 0,
            "7d_view": 0,
            "by_date": {}
        }
    
    # Process each daily record
    for insight in insights:
        date = insight.get("date_start")
        spend = float(insight.get("spend", 0))
        impressions = int(insight.get("impressions", 0))
        clicks = int(insight.get("clicks", 0))
        
        print(f"\nDate: {date}")
        print(f"  Spend: ${spend:.2f}")
        print(f"  Impressions: {impressions:,}")
        print(f"  Clicks: {clicks:,}")
        
        # Check conversions
        conversions = insight.get("conversions", [])
        conversion_values = insight.get("conversion_values", [])
        
        if not conversions:
            print(f"  ⚠️ No conversions data in response")
        else:
            print(f"  Conversions array has {len(conversions)} items")
            
            # Look for our specific custom conversions
            for conv in conversions:
                action_type = conv.get("action_type", "")
                
                # Check if this is one of our custom conversions
                for conv_id, conv_name in CONVERSIONS.items():
                    expected_type = f"offsite_conversion.custom.{conv_id}"
                    
                    if action_type == expected_type:
                        # Found our conversion!
                        value_total = float(conv.get("value", 0))
                        value_1d_click = float(conv.get("1d_click", 0))
                        value_7d_click = float(conv.get("7d_click", 0))
                        value_1d_view = float(conv.get("1d_view", 0))
                        value_7d_view = float(conv.get("7d_view", 0))
                        
                        print(f"  ✓ {conv_name}:")
                        print(f"    Total: {value_total}")
                        print(f"    1d_click: {value_1d_click}")
                        print(f"    7d_click: {value_7d_click}")
                        print(f"    1d_view: {value_1d_view}")
                        print(f"    7d_view: {value_7d_view}")
                        
                        # Add to totals
                        conversion_totals[conv_id]["total"] += value_total
                        conversion_totals[conv_id]["1d_click"] += value_1d_click
                        conversion_totals[conv_id]["7d_click"] += value_7d_click
                        conversion_totals[conv_id]["1d_view"] += value_1d_view
                        conversion_totals[conv_id]["7d_view"] += value_7d_view
                        
                        if date not in conversion_totals[conv_id]["by_date"]:
                            conversion_totals[conv_id]["by_date"][date] = 0
                        conversion_totals[conv_id]["by_date"][date] += value_total
    
    # Display summary
    print("\n" + "="*80)
    print("SUMMARY - TOTALS FOR DATE RANGE")
    print("="*80)
    
    has_any_data = False
    for conv_id, data in conversion_totals.items():
        if data["total"] > 0 or data["7d_click"] > 0 or data["1d_click"] > 0:
            has_any_data = True
            print(f"\n{data['name']} (ID: {conv_id}):")
            print(f"  Total (value): {data['total']:.2f}")
            print(f"  7d_click: {data['7d_click']:.2f}")
            print(f"  1d_click: {data['1d_click']:.2f}")
            print(f"  7d_view: {data['7d_view']:.2f}")
            print(f"  1d_view: {data['1d_view']:.2f}")
            print(f"  Days with data: {len(data['by_date'])}")
            if data['by_date']:
                print(f"  Breakdown by date:")
                for date, value in sorted(data['by_date'].items()):
                    print(f"    {date}: {value:.2f}")
    
    if not has_any_data:
        print("\n⚠️ WARNING: No conversion data found!")
        print("\nPossible reasons:")
        print("  1. The custom conversions haven't fired during this period")
        print("  2. No users completed the tracked events (login, secondDeposit)")
        print("  3. Pixel is not properly installed or not firing")
        print("  4. Custom conversion rules are not matching any events")
        print("\nRecommendations:")
        print("  1. Check Meta Events Manager to see if events are being received")
        print("  2. Test with a wider date range")
        print("  3. Verify pixel is active and firing on your website")
    else:
        print("\n✓ Conversion data found! If Looker Studio shows zeros, check:")
        print("  1. BigQuery table has this data")
        print("  2. Looker Studio date filter settings")
        print("  3. View/table connections in Looker Studio")
    
    print("\n" + "="*80)
    print("RAW API RESPONSE (first record):")
    print("="*80)
    if insights:
        print(json.dumps(insights[0], indent=2))
    
except requests.exceptions.RequestException as e:
    print(f"\n❌ Request Error: {e}")
    if hasattr(e.response, 'text'):
        print(f"Response: {e.response.text}")
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()

