#!/usr/bin/env python3
"""
Meta Reach API Test Script
Tests Facebook Graph API insights endpoint to determine most accurate reach metrics
with device, platform, and position breakdowns.
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any

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

# Breakdown parameters
BREAKDOWNS = "publisher_platform,platform_position,impression_device"

# Metrics to retrieve
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
        if hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")
        return {}


def discover_account_structure() -> Dict[str, Any]:
    """Discover ad account structure (accounts, campaigns, adsets, ads)."""
    print("=" * 80)
    print("PHASE 1: DISCOVERING AD ACCOUNT STRUCTURE")
    print("=" * 80)
    
    # Get ad accounts
    url = f"{BASE_URL}/me"
    params = {
        "fields": "adaccounts{id,name,campaigns{id,name,adsets{id,name,ads{id,name}}}}"
    }
    
    print(f"\nFetching account structure from {url}")
    print(f"Date range: {DATE_RANGE['since']} to {DATE_RANGE['until']}")
    
    data = make_api_call(url, params)
    
    if not data or 'adaccounts' not in data:
        print("ERROR: Could not retrieve ad accounts")
        return {}
    
    accounts = data.get('adaccounts', {}).get('data', [])
    
    if not accounts:
        print("No ad accounts found")
        return {}
    
    # Use first account for testing
    account = accounts[0]
    account_id = account.get('id')
    account_name = account.get('name')
    
    print(f"\n✓ Found account: {account_name} ({account_id})")
    
    campaigns = account.get('campaigns', {}).get('data', [])
    print(f"✓ Found {len(campaigns)} campaign(s)")
    
    total_adsets = 0
    total_ads = 0
    
    for campaign in campaigns:
        adsets = campaign.get('adsets', {}).get('data', [])
        total_adsets += len(adsets)
        for adset in adsets:
            ads = adset.get('ads', {}).get('data', [])
            total_ads += len(ads)
    
    print(f"✓ Found {total_adsets} adset(s)")
    print(f"✓ Found {total_ads} ad(s)")
    
    return {
        'account': account,
        'campaigns': campaigns
    }


def get_insights(object_id: str, object_type: str, with_breakdowns: bool = False) -> List[Dict[str, Any]]:
    """Get insights for a specific object (campaign, adset, or ad)."""
    url = f"{BASE_URL}/{object_id}/insights"
    
    params = {
        "fields": METRICS,
        "time_range": json.dumps(DATE_RANGE)
    }
    
    if with_breakdowns:
        params["breakdowns"] = BREAKDOWNS
    
    data = make_api_call(url, params)
    
    return data.get('data', [])


def test_reach_metrics(structure: Dict[str, Any]):
    """Test reach metrics at different levels and with/without breakdowns."""
    print("\n" + "=" * 80)
    print("PHASE 2: TESTING REACH METRICS")
    print("=" * 80)
    
    campaigns = structure.get('campaigns', [])
    
    if not campaigns:
        print("No campaigns to test")
        return
    
    # Limit testing to first campaign to avoid rate limits
    campaign = campaigns[0]
    campaign_id = campaign.get('id')
    campaign_name = campaign.get('name')
    
    print(f"\n{'='*80}")
    print(f"CAMPAIGN: {campaign_name} ({campaign_id})")
    print(f"{'='*80}")
    
    # Test 1: Campaign-level insights without breakdowns
    print(f"\n[TEST 1] Campaign-level insights (NO breakdowns - Total Reach)")
    print("-" * 80)
    campaign_insights = get_insights(campaign_id, "campaign", with_breakdowns=False)
    
    if campaign_insights:
        for insight in campaign_insights:
            reach = int(insight.get('reach', 0))
            impressions = int(insight.get('impressions', 0))
            frequency = float(insight.get('frequency', 0)) if insight.get('frequency') else 0
            spend = float(insight.get('spend', 0)) if insight.get('spend') else 0
            print(f"  Total Reach: {reach:,}")
            print(f"  Total Impressions: {impressions:,}")
            print(f"  Frequency: {frequency:.2f}")
            print(f"  Spend: ${spend:.2f}")
    else:
        print("  No data available")
    
    # Test 2: Campaign-level insights with breakdowns
    print(f"\n[TEST 2] Campaign-level insights (WITH breakdowns)")
    print("-" * 80)
    campaign_breakdown = get_insights(campaign_id, "campaign", with_breakdowns=True)
    
    if campaign_breakdown:
        total_reach_breakdown = 0
        total_impressions_breakdown = 0
        
        print(f"  Found {len(campaign_breakdown)} breakdown combination(s):\n")
        
        for i, insight in enumerate(campaign_breakdown, 1):
            platform = insight.get('publisher_platform', 'N/A')
            position = insight.get('platform_position', 'N/A')
            device = insight.get('impression_device', 'N/A')
            reach = int(insight.get('reach', 0))
            impressions = int(insight.get('impressions', 0))
            
            total_reach_breakdown += reach
            total_impressions_breakdown += impressions
            
            print(f"  [{i}] Platform: {platform} | Position: {position} | Device: {device}")
            print(f"      Reach: {reach:,} | Impressions: {impressions:,}")
        
        if campaign_insights and len(campaign_insights) > 0:
            actual_reach = int(campaign_insights[0].get('reach', 0))
            print(f"\n  ⚠️  IMPORTANT REACH COMPARISON:")
            print(f"      Actual Total Reach (deduplicated): {actual_reach:,}")
            print(f"      Sum of Breakdown Reaches: {total_reach_breakdown:,}")
            print(f"      Difference: {total_reach_breakdown - actual_reach:,}")
            print(f"      Overcounting: {((total_reach_breakdown / actual_reach - 1) * 100):.1f}%")
            print(f"\n  ✓ Impressions CAN be summed: {total_impressions_breakdown:,}")
    else:
        print("  No data available")
    
    # Test adsets
    adsets = campaign.get('adsets', {}).get('data', [])
    
    if adsets:
        # Test first adset
        adset = adsets[0]
        adset_id = adset.get('id')
        adset_name = adset.get('name')
        
        print(f"\n{'='*80}")
        print(f"ADSET: {adset_name} ({adset_id})")
        print(f"{'='*80}")
        
        # Test 3: Adset-level insights without breakdowns
        print(f"\n[TEST 3] Adset-level insights (NO breakdowns - Total Reach)")
        print("-" * 80)
        adset_insights = get_insights(adset_id, "adset", with_breakdowns=False)
        
        if adset_insights:
            for insight in adset_insights:
                reach = int(insight.get('reach', 0))
                impressions = int(insight.get('impressions', 0))
                frequency = float(insight.get('frequency', 0)) if insight.get('frequency') else 0
                spend = float(insight.get('spend', 0)) if insight.get('spend') else 0
                print(f"  Total Reach: {reach:,}")
                print(f"  Total Impressions: {impressions:,}")
                print(f"  Frequency: {frequency:.2f}")
                print(f"  Spend: ${spend:.2f}")
        else:
            print("  No data available")
        
        # Test 4: Adset-level insights with breakdowns
        print(f"\n[TEST 4] Adset-level insights (WITH breakdowns)")
        print("-" * 80)
        adset_breakdown = get_insights(adset_id, "adset", with_breakdowns=True)
        
        if adset_breakdown:
            print(f"  Found {len(adset_breakdown)} breakdown combination(s):\n")
            
            for i, insight in enumerate(adset_breakdown, 1):
                platform = insight.get('publisher_platform', 'N/A')
                position = insight.get('platform_position', 'N/A')
                device = insight.get('impression_device', 'N/A')
                reach = int(insight.get('reach', 0))
                impressions = int(insight.get('impressions', 0))
                
                print(f"  [{i}] Platform: {platform} | Position: {position} | Device: {device}")
                print(f"      Reach: {reach:,} | Impressions: {impressions:,}")
        else:
            print("  No data available")
        
        # Test ads (most granular level)
        ads = adset.get('ads', {}).get('data', [])
        
        if ads:
            # Test first ad only
            ad = ads[0]
            ad_id = ad.get('id')
            ad_name = ad.get('name')
            
            print(f"\n{'='*80}")
            print(f"AD: {ad_name} ({ad_id})")
            print(f"{'='*80}")
            
            # Test 5: Ad-level insights without breakdowns
            print(f"\n[TEST 5] Ad-level insights (NO breakdowns - Total Reach) ⭐ MOST GRANULAR")
            print("-" * 80)
            ad_insights = get_insights(ad_id, "ad", with_breakdowns=False)
            
            if ad_insights:
                for insight in ad_insights:
                    reach = int(insight.get('reach', 0))
                    impressions = int(insight.get('impressions', 0))
                    frequency = float(insight.get('frequency', 0)) if insight.get('frequency') else 0
                    spend = float(insight.get('spend', 0)) if insight.get('spend') else 0
                    print(f"  Total Reach: {reach:,}")
                    print(f"  Total Impressions: {impressions:,}")
                    print(f"  Frequency: {frequency:.2f}")
                    print(f"  Spend: ${spend:.2f}")
            else:
                print("  No data available")
            
            # Test 6: Ad-level insights with breakdowns (most granular breakdown)
            print(f"\n[TEST 6] Ad-level insights (WITH breakdowns) ⭐ MOST GRANULAR + DETAILED")
            print("-" * 80)
            ad_breakdown = get_insights(ad_id, "ad", with_breakdowns=True)
            
            if ad_breakdown:
                total_reach_breakdown = 0
                total_impressions_breakdown = 0
                
                print(f"  Found {len(ad_breakdown)} breakdown combination(s):\n")
                
                for i, insight in enumerate(ad_breakdown, 1):
                    platform = insight.get('publisher_platform', 'N/A')
                    position = insight.get('platform_position', 'N/A')
                    device = insight.get('impression_device', 'N/A')
                    reach = int(insight.get('reach', 0))
                    impressions = int(insight.get('impressions', 0))
                    frequency = insight.get('frequency', 'N/A')
                    spend = float(insight.get('spend', 0)) if insight.get('spend') else 0
                    
                    total_reach_breakdown += reach
                    total_impressions_breakdown += impressions
                    
                    print(f"  [{i}] Platform: {platform} | Position: {position} | Device: {device}")
                    print(f"      Reach: {reach:,} | Impressions: {impressions:,} | Spend: ${spend:.2f}")
                
                if ad_insights and len(ad_insights) > 0:
                    actual_reach = int(ad_insights[0].get('reach', 0))
                    print(f"\n  ⚠️  REACH DEDUPLICATION ANALYSIS:")
                    print(f"      Actual Total Reach (deduplicated): {actual_reach:,}")
                    print(f"      Sum of Breakdown Reaches: {total_reach_breakdown:,}")
                    
                    if actual_reach > 0:
                        print(f"      Difference: {total_reach_breakdown - actual_reach:,}")
                        print(f"      Overcounting if summed: {((total_reach_breakdown / actual_reach - 1) * 100):.1f}%")
                    
                    print(f"\n  ✓ Impressions CAN be summed: {total_impressions_breakdown:,}")
            else:
                print("  No data available")


def print_summary():
    """Print summary and recommendations."""
    print("\n" + "=" * 80)
    print("SUMMARY & RECOMMENDATIONS")
    print("=" * 80)
    
    print("""
📊 KEY FINDINGS:

1. MOST GRANULAR LEVEL: Ad-level with breakdowns
   - Provides reach data for each ad at the most detailed level
   - Breakdowns show: publisher_platform, platform_position, impression_device

2. REACH ACCURACY:
   ✓ For TOTAL unique reach: Query WITHOUT breakdowns
   ✓ For DISTRIBUTION analysis: Query WITH breakdowns
   ✗ NEVER sum reach values across breakdowns (double-counts users)
   
3. WHY REACH CAN'T BE SUMMED:
   - A user who sees your ad on mobile AND desktop appears in both breakdowns
   - But they're only ONE unique person in the total reach
   - Each breakdown row shows reach for that specific combination independently

4. METRICS THAT CAN BE SUMMED:
   ✓ Impressions - every view counts
   ✓ Spend - all costs add up
   ✓ Clicks - every click counts
   ✓ Conversions - all actions add up
   
5. METRICS THAT CANNOT BE SUMMED:
   ✗ Reach - unique users (deduplicated)
   ✗ Frequency - calculated metric (impressions/reach)

RECOMMENDED APPROACH:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For accurate reporting, fetch TWO types of data:

A) OVERALL REACH (deduplicated):
   GET /{ad_id}/insights?fields=reach,impressions,spend
   → Use this for "total unique users reached"

B) DISTRIBUTION BREAKDOWN:
   GET /{ad_id}/insights?fields=reach,impressions,spend
       &breakdowns=publisher_platform,platform_position,impression_device
   → Use this to show WHERE your reach comes from
   → Calculate percentages: (breakdown_reach / total_reach) * 100
   → NEVER sum these reach values

Example:
  Total reach: 10,000 (query without breakdowns)
  Mobile reach: 8,000 (80% of users saw ad on mobile)
  Desktop reach: 4,000 (40% of users saw ad on desktop)
  Note: 8,000 + 4,000 = 12,000 ≠ 10,000 (2,000 users saw ad on both devices)
""")


def main():
    """Main execution function."""
    print("\n" + "=" * 80)
    print("META REACH API TEST SCRIPT")
    print("=" * 80)
    print(f"Testing reach metrics with and without breakdowns")
    print(f"Date range: {DATE_RANGE['since']} to {DATE_RANGE['until']}")
    
    # Phase 1: Discover account structure
    structure = discover_account_structure()
    
    if not structure:
        print("\nERROR: Could not discover account structure. Exiting.")
        return
    
    # Phase 2: Test reach metrics
    test_reach_metrics(structure)
    
    # Phase 3: Print summary
    print_summary()
    
    print("\n" + "=" * 80)
    print("TEST COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()

