#!/usr/bin/env python3
"""
Meta Custom Events Discovery Script
Fetches custom conversions and pixel events from Meta/Facebook Ad Account
"""

import requests
import json
from typing import Dict, List, Optional

# ========================================
# CONFIGURATION - UPDATE THESE VALUES
# ========================================
ACCESS_TOKEN = input("Enter Meta Access Token for FRM-SPAIN: ").strip()
AD_ACCOUNT_ID = input("Enter Ad Account ID (with or without 'act_' prefix): ").strip()
PIXEL_ID = input("Enter Pixel ID (optional, press Enter to skip): ").strip() or None

# Ensure ad_account_id has act_ prefix
if not AD_ACCOUNT_ID.startswith("act_"):
    AD_ACCOUNT_ID = f"act_{AD_ACCOUNT_ID}"

API_VERSION = "v23.0"
BASE_URL = f"https://graph.facebook.com/{API_VERSION}"


def make_api_call(endpoint: str, params: Dict = None) -> Dict:
    """Make a Facebook Graph API call."""
    if params is None:
        params = {}
    
    params['access_token'] = ACCESS_TOKEN
    url = f"{BASE_URL}/{endpoint}"
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"API Error: {e}")
        if hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")
        return {}


def get_custom_conversions(ad_account_id: str) -> List[Dict]:
    """Get custom conversions from ad account."""
    print(f"\n{'='*80}")
    print(f"Fetching Custom Conversions from Ad Account: {ad_account_id}")
    print(f"{'='*80}")
    
    endpoint = f"{ad_account_id}/customconversions"
    params = {
        "fields": "name,rule,custom_event_type,event_source_id",
        "limit": 1000
    }
    
    data = make_api_call(endpoint, params)
    conversions = data.get('data', [])
    
    print(f"Found {len(conversions)} custom conversions")
    return conversions


def get_pixel_stats(pixel_id: str) -> Dict:
    """Get pixel statistics and event names."""
    print(f"\n{'='*80}")
    print(f"Fetching Pixel Stats: {pixel_id}")
    print(f"{'='*80}")
    
    endpoint = f"{pixel_id}"
    params = {
        "fields": "id,name,is_unavailable,last_fired_time,event_stats"
    }
    
    data = make_api_call(endpoint, params)
    
    if data:
        print(f"Pixel: {data.get('name', 'N/A')} (ID: {data.get('id', 'N/A')})")
        print(f"Last Fired: {data.get('last_fired_time', 'N/A')}")
        
        # Extract event names from event_stats
        event_stats = data.get('event_stats', [])
        if event_stats:
            print(f"\nFound {len(event_stats)} events tracked by this pixel:")
            for stat in event_stats:
                if isinstance(stat, dict):
                    event_name = stat.get('name', 'N/A')
                    count = stat.get('count', 0)
                    print(f"  - {event_name} (Count: {count})")
                elif isinstance(stat, str):
                    print(f"  - {stat}")
    
    return data


def get_standard_events_from_pixel(pixel_id: str) -> List[str]:
    """Get list of standard and custom events fired by pixel."""
    print(f"\n{'='*80}")
    print(f"Fetching Event Names from Pixel: {pixel_id}")
    print(f"{'='*80}")
    
    endpoint = f"{pixel_id}"
    params = {
        "fields": "id,name,event_stats"
    }
    
    data = make_api_call(endpoint, params)
    event_names = []
    
    if data and 'event_stats' in data:
        event_stats = data.get('event_stats', [])
        # event_stats can be a list of dicts or a list of strings
        for stat in event_stats:
            if isinstance(stat, dict):
                name = stat.get('name')
                if name:
                    event_names.append(name)
            elif isinstance(stat, str):
                event_names.append(stat)
        
        if event_names:
            print(f"Found {len(event_names)} events: {', '.join(event_names)}")
        else:
            print("No events found in event_stats")
    else:
        print("No event_stats field returned")
    
    return event_names


def get_pixels(ad_account_id: str) -> List[Dict]:
    """Get pixels associated with ad account."""
    print(f"\n{'='*80}")
    print(f"Fetching Pixels from Ad Account: {ad_account_id}")
    print(f"{'='*80}")
    
    endpoint = f"{ad_account_id}/adspixels"
    params = {
        "fields": "id,name",
        "limit": 100
    }
    
    data = make_api_call(endpoint, params)
    pixels = data.get('data', [])
    
    print(f"Found {len(pixels)} pixels")
    return pixels


def extract_events_from_rules(conversions: List[Dict]) -> List[str]:
    """Extract event names from custom conversion rules."""
    import re
    event_names = set()
    
    for conv in conversions:
        rule = conv.get('rule', {})
        
        # Convert to string if it's a dict to make parsing easier
        if isinstance(rule, dict):
            rule_str = str(rule)
        else:
            rule_str = rule
        
        # Look for patterns like "event": {"eq": "eventName"}
        # Try multiple patterns
        patterns = [
            r'"event":\s*\{\s*"eq":\s*"([^"]+)"',  # Standard pattern
            r"'event':\s*\{\s*'eq':\s*'([^']+)'",  # Single quotes
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, rule_str)
            for match in matches:
                event_names.add(match)
    
    return sorted(list(event_names))


def analyze_conversion_patterns(conversions: List[Dict]) -> Dict:
    """Analyze conversion naming patterns."""
    patterns = {
        'prefixes': set(),
        'suffixes': set(),
        'base_names': set(),
        'full_names': [],
        'custom_events': []
    }
    
    # Extract custom events from rules
    patterns['custom_events'] = extract_events_from_rules(conversions)
    
    for conv in conversions:
        name = conv.get('name', '')
        patterns['full_names'].append(name)
        
        # Try to detect S2S pattern
        if '-S2S-' in name:
            parts = name.split('-S2S-')
            if len(parts) == 2:
                patterns['base_names'].add(parts[0])
                patterns['suffixes'].add(parts[1])
        
        # Detect common prefixes
        if name.startswith('offsite_conversion.fb_pixel_custom.'):
            clean_name = name.replace('offsite_conversion.fb_pixel_custom.', '')
            patterns['prefixes'].add('offsite_conversion.fb_pixel_custom.')
            if '-S2S-' in clean_name:
                parts = clean_name.split('-S2S-')
                if len(parts) == 2:
                    patterns['base_names'].add(parts[0])
                    patterns['suffixes'].add(parts[1])
    
    return patterns


def display_results(conversions: List[Dict], pixel_events: List[str] = None):
    """Display results in a readable format."""
    print("\n" + "="*80)
    print("CUSTOM CONVERSIONS FOUND")
    print("="*80)
    
    if not conversions:
        print("No custom conversions found.")
    else:
        for i, conv in enumerate(conversions, 1):
            name = conv.get('name', 'N/A')
            conv_id = conv.get('id', 'N/A')
            custom_event_type = conv.get('custom_event_type', 'N/A')
            
            print(f"\n[{i}] {name}")
            print(f"    ID: {conv_id}")
            print(f"    Type: {custom_event_type}")
            
            if conv.get('rule'):
                rule = conv.get('rule', {})
                if isinstance(rule, dict):
                    url_rule = rule.get('url', {})
                    if isinstance(url_rule, dict):
                        print(f"    Rule URL: {url_rule.get('i_contains', 'N/A')}")
                    else:
                        print(f"    Rule: {rule}")
                else:
                    print(f"    Rule: {rule}")
    
    if pixel_events:
        print("\n" + "="*80)
        print("CUSTOM/STANDARD EVENTS FROM PIXEL")
        print("="*80)
        
        if not pixel_events:
            print("No pixel events found.")
        else:
            print(f"\nFound {len(pixel_events)} events being tracked:")
            for i, event_name in enumerate(pixel_events, 1):
                print(f"  [{i}] {event_name}")
    
    # Analyze patterns
    print("\n" + "="*80)
    print("PATTERN ANALYSIS")
    print("="*80)
    
    patterns = analyze_conversion_patterns(conversions)
    
    # Show custom events extracted from conversion rules
    if patterns['custom_events']:
        print("\nCustom Events (extracted from conversion rules):")
        for event in patterns['custom_events']:
            print(f"  - {event}")
        print(f"\nThese are the actual Meta Pixel events being tracked:")
        print(f"Total: {len(patterns['custom_events'])} unique events")
    
    if patterns['base_names']:
        print("\nDetected Base Action Names:")
        for name in sorted(patterns['base_names']):
            print(f"  - {name}")
    
    if patterns['suffixes']:
        print("\nDetected Brand/Suffix Codes:")
        for suffix in sorted(patterns['suffixes']):
            print(f"  - {suffix}")
    
    if patterns['prefixes']:
        print("\nDetected Prefixes:")
        for prefix in patterns['prefixes']:
            print(f"  - {prefix}")
    
    print("\n" + "="*80)
    print("JAVASCRIPT CODE GENERATION SUGGESTION")
    print("="*80)
    
    if patterns['base_names'] and patterns['suffixes']:
        print("\nBased on detected patterns, consider using:")
        print("\n```javascript")
        print("// Base action types")
        print(f"const BASE_ACTIONS = {json.dumps(sorted(list(patterns['base_names'])), indent=2)};")
        print("\n// Brand/suffix codes")
        print(f"const BRANDS = {json.dumps(sorted(list(patterns['suffixes'])), indent=2)};")
        print("\n// Generate full action types")
        print("const ACTION_TYPES = BASE_ACTIONS.flatMap(action => ")
        print("  BRANDS.map(brand => `offsite_conversion.fb_pixel_custom.${action}-S2S-${brand}`)")
        print(");")
        print("```")
    else:
        print("\nCouldn't detect clear S2S pattern. Manual configuration needed.")
        print("\nAll conversion names:")
        for name in sorted(patterns['full_names']):
            print(f"  - {name}")
    
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    print(f"Total Custom Conversions: {len(conversions)}")
    
    # Use custom events from rules as the primary source
    events_to_display = patterns['custom_events'] if patterns['custom_events'] else (pixel_events or [])
    
    if events_to_display:
        print(f"Total Custom Events: {len(events_to_display)}")
        print(f"Event Names: {', '.join(events_to_display)}")
    
    print(f"Unique Base Actions: {len(patterns['base_names'])}")
    print(f"Unique Brand Codes: {len(patterns['suffixes'])}")
    print("="*80)
    
    # Additional recommendations for custom events
    if events_to_display:
        print("\n" + "="*80)
        print("CUSTOM EVENTS RECOMMENDATION")
        print("="*80)
        print("\nTo track these events directly in Meta Ads, you can use:")
        print("\nStandard Events (if any):")
        standard_events = ['PageView', 'ViewContent', 'Search', 'AddToCart', 'AddToWishlist', 
                          'InitiateCheckout', 'AddPaymentInfo', 'Purchase', 'Lead', 'CompleteRegistration']
        
        has_standard = False
        for event in events_to_display:
            if event in standard_events:
                print(f"  - {event} (Standard Event)")
                has_standard = True
        if not has_standard:
            print("  (None found)")
        
        print("\nCustom Events:")
        for event in events_to_display:
            if event not in standard_events:
                print(f"  - {event} (Custom Event)")
        
        print("\n" + "-"*80)
        print("IMPORTANT: These custom events are being tracked by your Meta Pixel.")
        print("Your custom conversions apply business logic (like deduplication) on top of these events.")
        print(f"\nEvents found: {', '.join(events_to_display)}")
        print("\nThe worker is already configured to track the custom conversions (not the raw events).")
    print("="*80)


def main():
    """Main execution."""
    print("\n" + "="*80)
    print("META CUSTOM EVENTS DISCOVERY SCRIPT")
    print("="*80)
    print(f"Ad Account: {AD_ACCOUNT_ID}")
    if PIXEL_ID:
        print(f"Pixel ID: {PIXEL_ID}")
    print("="*80)
    
    # Get custom conversions from ad account
    conversions = get_custom_conversions(AD_ACCOUNT_ID)
    
    # Get pixels if not provided
    pixels = []
    pixel_events = []
    pixel_id_to_use = PIXEL_ID
    
    if not PIXEL_ID:
        pixels = get_pixels(AD_ACCOUNT_ID)
        if pixels:
            print("\nAvailable Pixels:")
            for pixel in pixels:
                print(f"  - {pixel.get('name')} (ID: {pixel.get('id')})")
            
            # Use the first pixel to fetch events
            if pixels:
                pixel_id_to_use = pixels[0].get('id')
                print(f"\nUsing first pixel for event discovery: {pixel_id_to_use}")
    
    # Fetch events from pixel
    if pixel_id_to_use:
        pixel_events = get_standard_events_from_pixel(pixel_id_to_use)
        # Also get detailed pixel stats
        get_pixel_stats(pixel_id_to_use)
    
    # Display all results
    display_results(conversions, pixel_events)
    
    print("\n✓ Discovery complete!")
    print("\nNext steps:")
    print("1. Review the custom conversions (these are what you'll track in the worker)")
    print("2. Custom events (login, secondDeposit) are the underlying events")
    print("3. The custom conversions already configured in meta-reportV1-spain.js should work")
    print("4. If you want to track events directly instead of conversions, update ACTION_TYPES")
    print("\nFor meta-reportV1-spain.js, the current configuration tracks:")
    if conversions:
        print("Custom Conversions (IDs already in worker):")
        for conv in conversions:
            print(f"  - {conv.get('name')} (ID: {conv.get('id')})")
    print("\n5. Update environment variables for FRM-SPAIN account if not already done")


if __name__ == "__main__":
    main()

