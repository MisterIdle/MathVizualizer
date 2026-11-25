#!/usr/bin/env python3
"""
Générateur de pages statiques (concepts/<id>.html) pour Math Vizualizer.
Zéro dépendance externe : lit directement les fichiers du catalogue JS et version.json.
Garantit un hébergement 100% natif sur GitHub Pages (1 fichier HTML par concept).
"""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "js" / "data"
CONCEPTS_DIR = ROOT / "concepts"
VERSION_FILE = ROOT / "version.json"

CATALOG_FILES = [
    "catalogScalarsCurves.js",
    "catalogTrigVectors.js",
    "catalog3DMatrices.js",
    "catalogCollisionsPhys.js",
    "catalogProcProb.js",
]

CONCEPT_RE = re.compile(
    r'\{\s*id:\s*"([^"]+)",\s*glyph:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*subtitle:\s*"([^"]+)"',
    re.MULTILINE,
)

VERSION_MARKER_RE = re.compile(r"<!-- MV_VERSION -->.*?<!-- /MV_VERSION -->", re.DOTALL)


def load_version_string() -> str:
    if VERSION_FILE.exists():
        data = json.loads(VERSION_FILE.read_text(encoding="utf-8"))
        return f"v{data['version']} ({data['date']})"
    return "v2.0.0"


def extract_concepts() -> list[dict[str, str]]:
    concepts: list[dict[str, str]] = []
    seen: set[str] = set()
    for fname in CATALOG_FILES:
        fpath = DATA_DIR / fname
        if not fpath.exists():
            continue
        text = fpath.read_text(encoding="utf-8")
        for match in CONCEPT_RE.finditer(text):
            cid, glyph, name, subtitle = match.groups()
            if cid not in seen:
                seen.add(cid)
                concepts.append(
                    {"id": cid, "glyph": glyph, "name": name, "subtitle": subtitle}
                )
    return concepts


def render_concept_html(concept: dict[str, str], version_str: str) -> str:
    cid = html.escape(concept["id"], quote=True)
    name = html.escape(concept["name"])
    subtitle = html.escape(concept["subtitle"])
    title = f"{name} — Math Vizualizer"
    desc = html.escape(f"{concept['name']} : {concept['subtitle']} — Playground interactif et code temps réel Unity, Godot, Unreal (C++ & Blueprint), C# et C++.", quote=True)

    return f"""<!DOCTYPE html>
<html lang="fr" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{desc}">
  <link rel="icon" href="../icon/pie.png" type="image/png">
  <title>{title}</title>
  <link rel="stylesheet" href="../css/tokens.css">
  <link rel="stylesheet" href="../css/base.css">
  <link rel="stylesheet" href="../css/concept.css">
</head>
<body data-concept-id="{cid}">
  <header class="mv-header">
    <div class="mv-header-inner">
      <div class="mv-header-left">
        <a href="../index.html" class="mv-brand">
          <span class="mv-brand-mark">π</span>
          <div class="mv-brand-info">
            <span class="mv-brand-title">Math Vizualizer</span>
            <span class="mv-brand-sub">Bible Game &amp; Gameplay Math</span>
          </div>
        </a>
        <nav class="mv-header-nav" aria-label="Navigation principale">
          <a href="../index.html" class="mv-nav-item">Tous les concepts</a>
          <a href="../index.html#paths" class="mv-nav-item">Parcours</a>
        </nav>
      </div>

      <div class="mv-header-right">
        <button type="button" id="mv-search-trigger" class="mv-search-trigger" aria-label="Rechercher">
          <span id="mv-search-icon-slot"></span>
          <span>Rechercher un concept...</span>
          <kbd class="mv-kbd">Ctrl K</kbd>
        </button>
        <button type="button" id="mv-xp-pill" class="mv-xp-pill" title="Voir votre progression"></button>
        <button type="button" id="mv-theme-toggle" class="mv-btn mv-btn-icon" aria-label="Changer de thème"></button>
      </div>
    </div>
  </header>

  <div class="mv-doc-shell">
    <aside class="mv-sidebar" aria-label="Catalogue des concepts">
      <div class="mv-sidebar-top">
        <a href="../index.html" class="mv-back-hub">← Retour à la Bible</a>
        <input type="search" id="mv-sidebar-filter" class="mv-sidebar-input" placeholder="Filtrer le menu...">
      </div>
      <nav id="mv-sidebar-tree" class="mv-sidebar-tree"></nav>
    </aside>

    <main class="mv-doc-main">
      <article id="mv-article-root" class="mv-article">
        <noscript>
          <h1>{name}</h1>
          <p>{subtitle}</p>
          <p>Activez JavaScript pour utiliser le playground interactif et le générateur de code temps réel.</p>
        </noscript>
      </article>
    </main>

    <aside class="mv-toc" aria-label="Sommaire de l'article">
      <div class="mv-toc-sticky">
        <h2 class="mv-toc-title">Sur cette page</h2>
        <ul class="mv-toc-list">
          <li><a href="#sec-def">Définition &amp; Formule</a></li>
          <li><a href="#sec-sandbox">Playground Interactif</a></li>
          <li><a href="#sec-code">Code Multi-Moteurs</a></li>
          <li><a href="#sec-live">Valeurs en Direct</a></li>
          <li><a href="#sec-examples">Cas d'Usage Gameplay</a></li>
          <li><a href="#sec-pitfalls">Pièges &amp; Pro Tips</a></li>
          <li><a href="#sec-related">Concepts Liés</a></li>
        </ul>
      </div>
    </aside>
  </div>

  <footer class="mv-footer">
    <div class="mv-footer-inner">
      <div class="mv-footer-group">
        <span>&copy; 2026 <strong>Alexy Houbloup</strong> (MisterIdle)</span>
        <span class="mv-footer-sep"></span>
        <span class="mv-version-tag"><!-- MV_VERSION -->{version_str}<!-- /MV_VERSION --></span>
      </div>
      <div class="mv-footer-group">
        <a href="../index.html">Main Page</a>
        <a href="https://github.com/MisterIdle/MathVizualizer" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://misteridle.itch.io/" target="_blank" rel="noopener noreferrer">Itch.io</a>
      </div>
    </div>
  </footer>

  <script type="module" src="../js/conceptPage.js"></script>
</body>
</html>
"""


def sync_index_version(version_str: str) -> None:
    index_path = ROOT / "index.html"
    if not index_path.exists():
        return
    content = index_path.read_text(encoding="utf-8")
    updated = VERSION_MARKER_RE.sub(
        f"<!-- MV_VERSION -->{version_str}<!-- /MV_VERSION -->",
        content,
    )
    if updated != content:
        index_path.write_text(updated, encoding="utf-8")


def generate_all() -> int:
    CONCEPTS_DIR.mkdir(parents=True, exist_ok=True)
    version_str = load_version_string()
    concepts = extract_concepts()
    valid_files: set[str] = set()

    for concept in concepts:
        fname = f"{concept['id']}.html"
        valid_files.add(fname)
        target = CONCEPTS_DIR / fname
        target.write_text(render_concept_html(concept, version_str), encoding="utf-8")

    # Clean stale HTML pages if a concept was removed/renamed
    for existing in CONCEPTS_DIR.glob("*.html"):
        if existing.name not in valid_files:
            existing.unlink()

    sync_index_version(version_str)
    return len(concepts)


if __name__ == "__main__":
    total = generate_all()
    print(f"[Math Vizualizer] {total} pages statiques générées dans ./concepts/ ({load_version_string()})")
