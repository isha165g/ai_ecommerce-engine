import random
from database import SessionLocal
import models
import schemas
import crud

categories = ["Electronics", "Home & Kitchen", "Fashion", "Automotive", "Sports", "Gaming", "Books"]
adjectives = ["Premium", "Wireless", "Ergonomic", "Smart", "Eco-friendly", "Portable", "Durable", "Advanced", "Professional", "Compact", "Luxury", "Heavy-Duty", "Minimalist"]
nouns = {
    "Electronics": ["Headphones", "Microphone", "Keyboard", "Monitor", "Speaker", "Charger", "Tablet", "Camera", "Drone"],
    "Home & Kitchen": ["Blender", "Coffee Maker", "Toaster", "Vacuum", "Purifier", "Heater", "Pan", "Knife Set", "Oven"],
    "Fashion": ["Jacket", "Sneakers", "Watch", "Backpack", "Sunglasses", "Boots", "Belt", "Shirt", "Wallet"],
    "Automotive": ["Dash Cam", "Jump Starter", "Air Compressor", "Car Cover", "Floor Mats"],
    "Sports": ["Treadmill", "Dumbbells", "Yoga Mat", "Tennis Racket", "Protein Shaker", "Tent"],
    "Gaming": ["Controller", "Headset", "Console", "Mechanical Keyboard", "Gaming Mouse", "Capture Card"],
    "Books": ["Notebook", "Planner", "Sketchbook", "Journal", "Binder"]
}

db = SessionLocal()

for i in range(1000):
    cat = random.choice(categories)
    adj = random.choice(adjectives)
    noun = random.choice(nouns[cat])
    
    name = f"{adj} {noun} {random.randint(1000, 9999)}"
    price = round(random.uniform(500, 50000), 2)
    desc = f"A high-quality {name.lower()} seamlessly blending modern performance with sleek aesthetics. Category: {cat}."
    tags = f"{cat.lower().replace(' & ', ',')},{noun.lower()},{adj.lower()}"
    
    p = schemas.ProductCreate(
        name=name,
        description=desc,
        price=price,
        category=cat,
        tags=tags
    )
    crud.create_product(db, p)

db.close()
print("1000 products randomly generated and inserted successfully!")
