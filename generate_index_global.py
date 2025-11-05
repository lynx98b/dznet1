#!/usr/bin/env python3
import os, json
from bs4 import BeautifulSoup

# Extensions d'images possibles
IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp"]

entries = []

def extract_meta(html):
    soup = BeautifulSoup(html, "html.parser")

    title = soup.title.string.strip() if soup.title else "Sans titre"
    
    desc = soup.find("meta", attrs={"name": "description"})
    desc = desc["content"] if desc else ""

    category = soup.find("meta", attrs={"name": "content-category"})
    category = category["content"] if category else "Autre"

    age = soup.find("meta", attrs={"name": "content-age"})
    age = age["content"] if age else "N/A"

    return title, desc, category, age


def find_thumbnail(base_path, base_file):
    base_name = base_file.replace(".html", "")
    for ext in IMAGE_EXT:
        candidate = os.path.join(base_path, base_name + ext)
        if os.path.exists(candidate):
            return os.path.relpath(candidate, ".")
    return None


for root, dirs, files in os.walk("."):
    for file in files:
        if not file.endswith(".html"):
            continue

        # Exclusions (index / sommaire)
        if file in ["index.html", "sommaire.html"]:
            continue

        path = os.path.join(root, file)

        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            html = f.read()

        title, desc, cat, age = extract_meta(html)
        thumbnail = find_thumbnail(root, file)

        entries.append({
            "file": os.path.relpath(path, "."),
            "title": title,
            "category": cat,
            "age": age,
            "description": desc,
            "thumbnail": thumbnail
        })

entries.sort(key=lambda x: x["title"].lower())

with open("index_global.json", "w", encoding="utf-8") as f:
    json.dump(entries, f, ensure_ascii=False, indent=2)

print(f"✅ Généré : {len(entries)} éléments → index_global.json")
