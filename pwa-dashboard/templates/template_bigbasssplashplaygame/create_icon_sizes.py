#!/usr/bin/env python3
"""
Create multiple icon sizes from existing icon.png
"""

from PIL import Image
from pathlib import Path

def create_icon_sizes():
    """Create multiple icon sizes from icon.png"""
    icons_dir = Path("static/icons")
    icon_path = icons_dir / "icon.png"
    
    if not icon_path.exists():
        print(f"✗ Error: {icon_path} not found!")
        return False
    
    print(f"Loading {icon_path}...")
    try:
        img = Image.open(icon_path)
        print(f"✓ Loaded icon ({img.size[0]}x{img.size[1]})")
    except Exception as e:
        print(f"✗ Failed to load icon: {e}")
        return False
    
    sizes = [192, 384, 512]
    
    print("\nCreating icon sizes...")
    for size in sizes:
        try:
            resized = img.resize((size, size), Image.Resampling.LANCZOS)
            output_path = icons_dir / f"icon-{size}x{size}.png"
            resized.save(output_path, "PNG")
            print(f"✓ Created {output_path.name}")
        except Exception as e:
            print(f"✗ Failed to create {size}x{size}: {e}")
    
    print("\n✓ Icon generation complete!")
    return True

if __name__ == "__main__":
    create_icon_sizes()

