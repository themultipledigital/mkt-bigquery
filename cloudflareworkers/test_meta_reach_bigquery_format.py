#!/usr/bin/env python3
"""
Meta Reach API Test Script - BigQuery Format Output
Shows how data would be structured in BigQuery for Looker Studio
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any
import csv

# API Configuration
ACCESS_TOKEN = "EAAG8t9JTvzMBP6xDsXiOxnA6Vtdrj3LsOp6gi0an7dkRL9J67wTGWmLI6e6C2YoZCS6dZALjhBdNFWAJW5lPhPqPDzkXMfgbWD6S2vtvQhVgsZBJ5NewRWbYkpeuny4X9FeE670gNfKRZBCtcobJ63m21Ua03vf6Bq6ftfsJNVXDXLlqLxCAtOEBS1l3RcLAX3sYeFI1jxgaLJdT"
API_VERSION = "v23.0"
BASE_URL = f"https://graph.facebook.com/{API_VERSION}"

# Calculate date range (last 7 days)
end_date = datetime.now().date()
start_date = end_date - timedelta(days=7)
DATE_RANGE = {
    "since": start_date.strftime("%Y-%m-%d"),
    "until": end_date.strftime("%Y-%m-%d")
}

BREAKDOWNS = "publisher_platform,platform_position,impression_device"
METRICS = "reach,impressions,frequency,spend"


def make_api_call(url: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
    """Make a Facebook Graph API call with error handling."""
    if params is None:
        params = {}
    
    params['access_token'] = ACCESS_TOKEN
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"API Error: {e}")
        return {}


def get_insights(object_id: str, with_breakdowns: bool = False) -> List[Dict[str, Any]]:
    """Get insights for a specific object."""
    url = f"{BASE_URL}/{object_id}/insights"
    
    params = {
        "fields": METRICS,
        "time_range": json.dumps(DATE_RANGE)
    }
    
    if with_breakdowns:
        params["breakdowns"] = BREAKDOWNS
    
    data = make_api_call(url, params)
    return data.get('data', [])


def main():
    """Main execution function."""
    print("=" * 100)
    print("META INSIGHTS - BIGQUERY TABLE STRUCTURE EXAMPLE")
    print("=" * 100)
    print(f"Date range: {DATE_RANGE['since']} to {DATE_RANGE['until']}\n")
    
    # Get account structure
    url = f"{BASE_URL}/me"
    params = {
        "fields": "adaccounts{id,name,campaigns{id,name,adsets{id,name,ads{id,name}}}}"
    }
    
    data = make_api_call(url, params)
    accounts = data.get('adaccounts', {}).get('data', [])
    
    if not accounts:
        print("No accounts found")
        return
    
    account = accounts[0]
    campaigns = account.get('campaigns', {}).get('data', [])
    
    if not campaigns:
        print("No campaigns found")
        return
    
    campaign = campaigns[0]
    adsets = campaign.get('adsets', {}).get('data', [])
    
    if not adsets:
        print("No adsets found")
        return
    
    adset = adsets[0]
    ads = adset.get('ads', {}).get('data', [])
    
    if not ads:
        print("No ads found")
        return
    
    ad = ads[0]
    
    print(f"Account: {account.get('name')} ({account.get('id')})")
    print(f"Campaign: {campaign.get('name')} ({campaign.get('id')})")
    print(f"Adset: {adset.get('name')} ({adset.get('id')})")
    print(f"Ad: {ad.get('name')} ({ad.get('id')})")
    print("\n" + "=" * 100)
    
    # Fetch both total and breakdown data
    print("\nFetching insights...")
    total_insights = get_insights(ad.get('id'), with_breakdowns=False)
    breakdown_insights = get_insights(ad.get('id'), with_breakdowns=True)
    
    retrieved_at = datetime.now().isoformat()
    
    # Build table rows
    all_rows = []
    
    # Add total row (no breakdowns)
    if total_insights:
        for insight in total_insights:
            row = {
                'account_id': 'FRM-154742',  # From your config
                'referrer_domain': 'uswheeltech.com',
                'ad_account_id': account.get('id'),
                'campaign_id': campaign.get('id'),
                'campaign_name': campaign.get('name'),
                'adset_id': adset.get('id'),
                'adset_name': adset.get('name'),
                'ad_id': ad.get('id'),
                'ad_name': ad.get('name'),
                'date_start': insight.get('date_start'),
                'date_stop': insight.get('date_stop'),
                'retrieved_at': retrieved_at,
                'publisher_platform': None,  # NULL for total
                'platform_position': None,   # NULL for total
                'impression_device': None,   # NULL for total
                'reach': int(insight.get('reach', 0)),
                'impressions': int(insight.get('impressions', 0)),
                'frequency': float(insight.get('frequency', 0)) if insight.get('frequency') else 0,
                'spend': float(insight.get('spend', 0)) if insight.get('spend') else 0,
                'is_breakdown': False
            }
            all_rows.append(row)
    
    # Add breakdown rows
    if breakdown_insights:
        for insight in breakdown_insights:
            row = {
                'account_id': 'FRM-154742',
                'referrer_domain': 'uswheeltech.com',
                'ad_account_id': account.get('id'),
                'campaign_id': campaign.get('id'),
                'campaign_name': campaign.get('name'),
                'adset_id': adset.get('id'),
                'adset_name': adset.get('name'),
                'ad_id': ad.get('id'),
                'ad_name': ad.get('name'),
                'date_start': insight.get('date_start'),
                'date_stop': insight.get('date_stop'),
                'retrieved_at': retrieved_at,
                'publisher_platform': insight.get('publisher_platform'),
                'platform_position': insight.get('platform_position'),
                'impression_device': insight.get('impression_device'),
                'reach': int(insight.get('reach', 0)),
                'impressions': int(insight.get('impressions', 0)),
                'frequency': float(insight.get('frequency', 0)) if insight.get('frequency') else 0,
                'spend': float(insight.get('spend', 0)) if insight.get('spend') else 0,
                'is_breakdown': True
            }
            all_rows.append(row)
    
    # Display sample rows
    print("\n" + "=" * 100)
    print("BIGQUERY TABLE STRUCTURE - SAMPLE ROWS")
    print("=" * 100)
    print(f"\nTotal rows to insert: {len(all_rows)}")
    print(f"  - Total/aggregated rows (is_breakdown=FALSE): {sum(1 for r in all_rows if not r['is_breakdown'])}")
    print(f"  - Breakdown rows (is_breakdown=TRUE): {sum(1 for r in all_rows if r['is_breakdown'])}")
    
    # Show the total row
    print("\n" + "-" * 100)
    print("ROW 1: TOTAL REACH (No Breakdowns) - is_breakdown = FALSE")
    print("-" * 100)
    total_row = [r for r in all_rows if not r['is_breakdown']][0]
    print(json.dumps(total_row, indent=2, default=str))
    
    # Show first 5 breakdown rows
    print("\n" + "-" * 100)
    print("ROWS 2-6: BREAKDOWN REACH (With Platform/Position/Device) - is_breakdown = TRUE")
    print("-" * 100)
    breakdown_rows = [r for r in all_rows if r['is_breakdown']][:5]
    for i, row in enumerate(breakdown_rows, 2):
        print(f"\n--- Row {i} ---")
        print(f"Platform: {row['publisher_platform']} | Position: {row['platform_position']} | Device: {row['impression_device']}")
        print(f"Reach: {row['reach']:,} | Impressions: {row['impressions']:,} | Spend: ${row['spend']:.2f}")
    
    # Calculate statistics
    total_reach_value = total_row['reach']
    sum_breakdown_reach = sum(r['reach'] for r in all_rows if r['is_breakdown'])
    
    print("\n" + "=" * 100)
    print("REACH ANALYSIS")
    print("=" * 100)
    print(f"Total Reach (deduplicated):          {total_reach_value:,}")
    print(f"Sum of Breakdown Reaches:            {sum_breakdown_reach:,}")
    print(f"Difference (duplicated users):       {sum_breakdown_reach - total_reach_value:,}")
    print(f"Overcounting if summed:              {((sum_breakdown_reach / total_reach_value - 1) * 100):.1f}%")
    
    # Show Looker Studio query examples
    print("\n" + "=" * 100)
    print("LOOKER STUDIO USAGE EXAMPLES")
    print("=" * 100)
    
    print("""
1. TOTAL REACH CHART (Correct - uses is_breakdown = FALSE):
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SELECT 
     date_start,
     campaign_name,
     ad_name,
     SUM(reach) as total_unique_reach,      ← Safe to SUM (only 1 row per ad)
     SUM(impressions) as total_impressions,
     SUM(spend) as total_spend
   FROM `project.dataset.meta_insights`
   WHERE is_breakdown = FALSE
   GROUP BY date_start, campaign_name, ad_name
   
   Result for this ad:
""")
    print(f"   - Total Unique Reach: {total_reach_value:,}")
    print(f"   - Total Impressions: {total_row['impressions']:,}")
    print(f"   - Total Spend: ${total_row['spend']:.2f}")
    
    print("""
2. REACH DISTRIBUTION BY PLATFORM (Show breakdown, don't sum):
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SELECT 
     publisher_platform,
     platform_position,
     impression_device,
     reach,                    ← Don't SUM! Just display
     impressions,              ← Can SUM across time periods
     spend                     ← Can SUM across time periods
   FROM `project.dataset.meta_insights`
   WHERE is_breakdown = TRUE
     AND ad_id = '...'
   
   Top 3 breakdown combinations for this ad:
""")
    top_3 = sorted([r for r in all_rows if r['is_breakdown']], 
                   key=lambda x: x['reach'], reverse=True)[:3]
    for i, row in enumerate(top_3, 1):
        print(f"   {i}. {row['publisher_platform']:20s} | {row['platform_position']:25s} | {row['impression_device']:20s} | Reach: {row['reach']:,}")
    
    print("""
3. REACH DISTRIBUTION PERCENTAGE (Calculated field in Looker Studio):
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Reach % = CASE 
     WHEN is_breakdown = TRUE THEN 
       reach / MAX(CASE WHEN is_breakdown = FALSE THEN reach END) * 100
     ELSE NULL
   END
   
   Distribution for this ad:
""")
    for i, row in enumerate(top_3, 1):
        pct = (row['reach'] / total_reach_value * 100)
        print(f"   {i}. {row['publisher_platform']:20s} | {row['platform_position']:25s} | {pct:5.1f}% of total reach")
    
    print("\n" + "=" * 100)
    print("KEY TAKEAWAYS FOR LOOKER STUDIO")
    print("=" * 100)
    print("""
✅ DO:
   - Use is_breakdown = FALSE for total/unique reach metrics
   - SUM reach only when is_breakdown = FALSE (1 row per ad/date)
   - SUM impressions and spend across any rows (always additive)
   - Use breakdown rows to show distribution (platforms, positions, devices)
   - Calculate percentages by dividing breakdown reach by total reach
   
❌ DON'T:
   - Sum reach across breakdown rows (double counts users)
   - Sum frequency (it's a calculated metric: impressions/reach)
   - Mix breakdown and non-breakdown rows in same aggregation
   
💡 BEST PRACTICE:
   - Create separate charts for "Total Reach" and "Reach Distribution"
   - Total Reach chart: Filter WHERE is_breakdown = FALSE
   - Distribution chart: Filter WHERE is_breakdown = TRUE
   - Always use calculated fields for reach percentages
""")
    
    # Export sample CSV
    print("\n" + "=" * 100)
    print("EXPORTING SAMPLE CSV")
    print("=" * 100)
    
    csv_filename = "sample_meta_insights_bigquery.csv"
    with open(csv_filename, 'w', newline='', encoding='utf-8') as f:
        if all_rows:
            fieldnames = list(all_rows[0].keys())
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_rows)
    
    print(f"✓ Exported {len(all_rows)} rows to: {csv_filename}")
    print(f"  You can import this CSV to examine the exact structure")
    
    print("\n" + "=" * 100)
    print("COMPLETE")
    print("=" * 100)


if __name__ == "__main__":
    main()

