#!/usr/bin/env python3
"""
Download and resize PWA icons to multiple sizes.
"""

import requests
from PIL import Image
import io
from pathlib import Path
import sys

def download_and_resize_icons():
    """Download icon and create multiple sizes."""
    base_url = "https://bigbasssplashplaygame.com/icon.png"
    sizes = [192, 384, 512]  # Standard PWA icon sizes
    
    print("Downloading icon from original site...")
    try:
        response = requests.get(base_url, timeout=30)
        response.raise_for_status()
        img = Image.open(io.BytesIO(response.content))
        print(f"✓ Downloaded icon ({img.size[0]}x{img.size[1]})")
    except Exception as e:
        print(f"✗ Failed to download icon: {e}")
        return False
    
    output_dir = Path("template_bigbasssplashplaygame/static/icons")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("\nCreating icon sizes...")
    for size in sizes:
        try:
            resized = img.resize((size, size), Image.Resampling.LANCZOS)
            output_path = output_dir / f"icon-{size}x{size}.png"
            resized.save(output_path, "PNG")
            print(f"✓ Created {output_path.name}")
        except Exception as e:
            print(f"✗ Failed to create {size}x{size}: {e}")
    
    # Also save as icon.png (512x512) for backward compatibility
    try:
        img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
        img_512.save(output_dir / "icon.png", "PNG")
        print(f"✓ Updated icon.png (512x512)")
    except Exception as e:
        print(f"✗ Failed to update icon.png: {e}")
    
    print("\n✓ Icon generation complete!")
    return True

if __name__ == "__main__":
    success = download_and_resize_icons()
    sys.exit(0 if success else 1)

