#!/usr/bin/env python3
"""
Générateur de pages statiques (concepts/<id>.html) pour Math Vizualizer (style GitBook).
Zéro dépendance externe : lit directement les fichiers du catalogue JS et version.json.
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


def load_version_info() -> tuple[str, str]:
    if VERSION_FILE.exists():
        data = json.loads(VERSION_FILE.read_text(encoding="utf-8"))
        ver = data.get("version", "2.0.0")
        date = data.get("date", "")
        return f"v{ver} ({date})" if date else f"v{ver}", ver
    return "v2.0.0", "2.0.0"


def load_version_string() -> str:
    return load_version_info()[0]


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
                concepts.append({"id": cid, "glyph": glyph, "name": name, "subtitle": subtitle})
    return concepts


def render_concept_html(concept: dict[str, str], version_str: str, ver_num: str) -> str:
    cid = html.escape(concept["id"], quote=True)
    name = html.escape(concept["name"])
    subtitle = html.escape(concept["subtitle"])
    title = f"{name} — Math Vizualizer"
    desc = html.escape(
        f"{concept['name']} : {concept['subtitle']} — Playground interactif et code temps réel Unity, Godot, Unreal (C++ & Blueprint), C# et C++.",
        quote=True,
    )

    return f"""<!DOCTYPE html>
<html lang="fr" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{desc}">
  <link rel="icon" href="../icon/pie.png" type="image/png">
  <title>{title}</title>
  <link rel="stylesheet" href="../css/tokens.css?v={ver_num}">
  <link rel="stylesheet" href="../css/base.css?v={ver_num}">
  <link rel="stylesheet" href="../css/concept.css?v={ver_num}">
</head>
<body data-concept-id="{cid}">
  <header class="gb-header">
    <div class="gb-header-inner">
      <a href="../index.html" class="gb-brand">
        <span class="gb-brand-logo">π</span>
        <span class="gb-brand-name">Math Vizualizer</span>
        <span class="gb-brand-meta">Game &amp; Gameplay Programming</span>
      </a>

      <div class="gb-header-actions">
        <button type="button" id="gb-search-trigger" class="gb-search-btn" aria-label="Rechercher">
          <span id="gb-search-icon"></span>
          <span>Rechercher...</span>
          <kbd class="gb-kbd">Ctrl K</kbd>
        </button>
        <button type="button" id="gb-theme-toggle" class="gb-btn gb-btn-icon" aria-label="Changer de thème"></button>
      </div>
    </div>
  </header>

  <div class="gb-shell has-toc">
    <aside class="gb-sidebar" aria-label="Sommaire de la bible">
      <div class="gb-sidebar-head">
        <a href="../index.html" class="gb-sidebar-home-link">← Tous les concepts (76)</a>
        <input type="search" id="gb-sidebar-filter" class="gb-sidebar-filter" placeholder="Filtrer le sommaire...">
      </div>
      <nav id="gb-sidebar-tree" class="gb-sidebar-tree"></nav>
    </aside>

    <main class="gb-doc-main">
      <article id="gb-article-root" class="gb-article">
        <noscript>
          <h1>{name}</h1>
          <p>{subtitle}</p>
          <p>Activez JavaScript pour utiliser le playground interactif et le code temps réel.</p>
        </noscript>
      </article>
    </main>

    <aside class="gb-toc" aria-label="Sur cette page">
      <div class="gb-toc-inner">
        <div class="gb-toc-title">Sur cette page</div>
        <ul class="gb-toc-list">
          <li><a href="#sec-def">Définition &amp; Formule</a></li>
          <li><a href="#sec-sandbox">Playground Interactif</a></li>
          <li><a href="#sec-code">Code Multi-Moteurs</a></li>
          <li><a href="#sec-live">Valeurs en Direct</a></li>
          <li><a href="#sec-examples">Cas d'Usage</a></li>
          <li><a href="#sec-pitfalls">Pièges Classiques</a></li>
          <li><a href="#sec-related">Concepts Liés</a></li>
        </ul>
      </div>
    </aside>
  </div>

  <footer class="gb-footer">
    <div class="gb-footer-inner">
      <div class="gb-footer-group">
        <span>&copy; 2026 <strong>Alexy Houbloup</strong> (MisterIdle)</span>
        <span class="gb-version-pill"><!-- MV_VERSION -->{version_str}<!-- /MV_VERSION --></span>
      </div>
      <div class="gb-footer-group">
        <a href="../index.html">Tous les concepts</a>
        <a href="https://github.com/MisterIdle/MathVizualizer" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://misteridle.itch.io/" target="_blank" rel="noopener noreferrer">Itch.io</a>
      </div>
    </div>
  </footer>

  <script type="module" src="../js/conceptPage.js?v={ver_num}"></script>
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
    version_str, ver_num = load_version_info()
    concepts = extract_concepts()
    valid_files: set[str] = set()

    for concept in concepts:
        fname = f"{concept['id']}.html"
        valid_files.add(fname)
        target = CONCEPTS_DIR / fname
        target.write_text(render_concept_html(concept, version_str, ver_num), encoding="utf-8")

    for existing in CONCEPTS_DIR.glob("*.html"):
        if existing.name not in valid_files:
            existing.unlink()

    sync_index_version(version_str)
    return len(concepts)


if __name__ == "__main__":
    total = generate_all()
    print(f"[Math Vizualizer] {total} pages GitBook générées dans ./concepts/ ({load_version_string()})")
