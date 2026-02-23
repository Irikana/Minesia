from PIL import Image
import os

texture_dir = r"RP\textures\items"
scythe_files = [
    "wood_scythe.png",
    "stone_scythe.png",
    "iron_scythe.png",
    "diamond_scythe.png",
    "netherite_scythe.png",
    "steel_scythe.png"
]

target_size = 32

for filename in scythe_files:
    filepath = os.path.join(texture_dir, filename)
    
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    img = Image.open(filepath).convert("RGBA")
    original_size = img.size
    
    new_img = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
    
    offset_x = (target_size - original_size[0]) // 2
    offset_y = (target_size - original_size[1]) // 2
    
    new_img.paste(img, (offset_x, offset_y), img)
    
    new_img.save(filepath)
    print(f"Resized {filename}: {original_size} -> 32x32 (centered at {offset_x}, {offset_y})")

print("Done!")
