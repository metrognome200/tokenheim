import os

# Define the base directory
base_dir = r"assets"

# Define the file structure
structure = {
    "characters": {
        "Vplayer.png": "Crypto the Clueless - Main character sprite",
    },
    "enemies": {
        "shill_goblin.png": "Shill Goblin enemy sprite",
        "hodl_yeti.png": "HODL Yeti enemy sprite",
        "nft_mancer.png": "NFTomancer enemy sprite",
    },
    "items": {
        "tokens": {
            "token_normal.png": "Basic token sprite",
            "token_special.png": "Special token sprite",
        },
        "equipment": {
            "hodl_hammer.png": "HODL Hammer weapon",
            "meme_armor.png": "Meme Armor",
            "moon_cannon.png": "Moon Cannon",
            "rugpull_boots.png": "Rugpull Boots",
        },
    },
    "effects": {
        "attack_effect.png": "Attack visual effect",
        "block_effect.png": "Block visual effect",
        "special_effect.png": "Special visual effect",
    },
}

# Function to create directories and files
def create_structure(base_path, structure):
    for name, content in structure.items():
        path = os.path.join(base_path, name)
        if isinstance(content, dict):
            os.makedirs(path, exist_ok=True)
            create_structure(path, content)
        else:
            with open(path, 'w') as file:
                file.write(f"Placeholder for {content}")

# Create the directory structure
create_structure(base_dir, structure)

print(f"Assets directory structure created at {base_dir}")
