#!/usr/bin/env python3
# v1.000 — Générateur index_global.json (multilingue) — défaut âge: 6+
import os, json
from bs4 import BeautifulSoup

EXCLUDE_FILES = {"index.html", "sommaire.html"}
IMAGE_EXT = (".png", ".jpg", ".jpeg", ".webp")
DEFAULT_AGE = "6+"

def rel(p): return os.path.relpath(p, ".")

def extract_meta(html_text):
    soup = BeautifulSoup(html_text, "html.parser")
    # Titres
    title = (soup.title.string or "").strip() if soup.title else ""
    t_fr = (soup.find("meta", attrs={"name":"title-fr"}) or {}).get("content", "") or title
    t_en = (soup.find("meta", attrs={"name":"title-en"}) or {}).get("content", "") or title
    t_ar = (soup.find("meta", attrs={"name":"title-ar"}) or {}).get("content", "") or title
    # Descriptions
    d_def = (soup.find("meta", attrs={"name":"description"}) or {}).get("content", "")
    d_fr = (soup.find("meta", attrs={"name":"description-fr"}) or {}).get("content", "") or d_def
    d_en = (soup.find("meta", attrs={"name":"description-en"}) or {}).get("content", "") or d_def
    d_ar = (soup.find("meta", attrs={"name":"description-ar"}) or {}).get("content", "") or d_def
    # Catégorie / âge
    category = (soup.find("meta", attrs={"name":"content-category"}) or {}).get("content", "Autre").strip() or "Autre"
    age = (soup.find("meta", attrs={"name":"content-age"}) or {}).get("content", DEFAULT_AGE).strip() or DEFAULT_AGE
    # Normalisation âge (ex: "6+" -> "6+")
    if age.endswith("+"):
        pass
    else:
        # si c'est "6" etc.
        try:
            age = f"{int(age)}+"
        except:
            age = DEFAULT_AGE
    return {
        "title_fr": t_fr, "title_en": t_en, "title_ar": t_ar,
        "description_fr": d_fr, "description_en": d_en, "description_ar": d_ar,
        "category": category, "age": age
    }

def find_thumbnail(dir_path, html_file):
    base = os.path.splitext(os.path.basename(html_file))[0]
    # même dossier, même base
    for ext in IMAGE_EXT:
        cand = os.path.join(dir_path, f"{base}{ext}")
        if os.path.exists(cand):
            return rel(cand)
    return None

entries = []
for root, _, files in os.walk("."):
    for f in files:
        if not f.lower().endswith(".html"): 
            continue
        if f in EXCLUDE_FILES:
            continue
        full = os.path.join(root, f)
        try:
            with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                html = fh.read()
            meta = extract_meta(html)
            thumb = find_thumbnail(root, f)
            entries.append({
                "file": rel(full).replace("\\", "/"),
                "title_fr": meta["title_fr"],
                "title_en": meta["title_en"],
                "title_ar": meta["title_ar"],
                "category": meta["category"],
                "age": meta["age"],
                "thumbnail": thumb,
                "description_fr": meta["description_fr"],
                "description_en": meta["description_en"],
                "description_ar": meta["description_ar"]
            })
        except Exception as e:
            # entrée minimale en cas d'erreur
            entries.append({
                "file": rel(full).replace("\\", "/"),
                "title_fr": os.path.splitext(f)[0],
                "title_en": os.path.splitext(f)[0],
                "title_ar": os.path.splitext(f)[0],
                "category": "Autre",
                "age": DEFAULT_AGE,
                "thumbnail": None,
                "description_fr": "",
                "description_en": "",
                "description_ar": ""
            })

# tri par titre FR
entries.sort(key=lambda x: x["title_fr"].lower())

with open("index_global.json", "w", encoding="utf-8") as out:
    json.dump(entries, out, ensure_ascii=False, indent=2)

print(f"✅ index_global.json généré ({len(entries)} éléments).")
