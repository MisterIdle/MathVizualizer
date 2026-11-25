#!/usr/bin/env python3
"""
Math Vizualizer — Auto-Release, SemVer & Git Push CLI
Usage interactif :
    python release.py

Usage rapide en une ligne :
    python release.py -m "Ajout du concept Ray-Triangle et amélioration SAT" --yes
    python release.py -m "fix: correction du responsive sur la barre de filtres" --yes
    python release.py --dry-run -m "Refonte du moteur 3D WebGL"
"""

from __future__ import annotations

import argparse
import datetime
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VERSION_FILE = ROOT / "version.json"
CHANGELOG_FILE = ROOT / "CHANGELOG.md"

sys.path.insert(0, str(ROOT / "scripts"))
from generate_pages import generate_all  # noqa: E402

# Règles d'analyse sémantique (FR + EN + Conventional Commits)
MAJOR_PATTERNS = [
    r"\bbreaking\b",
    r"\brefonte\b",
    r"\bmajeur(?:e|s)?\b",
    r"\bmajor\b",
    r"\bincompatible\b",
    r"\bmigration\b",
    r"\barchitecture\b",
    r"\bv\d+\.0\b",
    r"!:",
]

MINOR_PATTERNS = [
    r"\bajout(?:e|er|é|s)?\b",
    r"\bnouvea(?:u|ux)\b",
    r"\bnouvelle(?:s)?\b",
    r"\bfeat(?:ure)?\b",
    r"\bconcept(?:s)?\b",
    r"\bsandbox(?:es)?\b",
    r"\bplayground(?:s)?\b",
    r"\bam[eé]lior(?:ation|e|er|é)\b",
    r"\bpage(?:s)?\b",
    r"\bparcours\b",
    r"\bsupport\b",
    r"\bblueprint\b",
    r"\bgamif",
]

PATCH_PATTERNS = [
    r"\bfix(?:es|ed)?\b",
    r"\bbug(?:s)?\b",
    r"\bcorrig(?:e|er|é|e[rs]?)\b",
    r"\bcorrection(?:s)?\b",
    r"\btypo(?:s)?\b",
    r"\bhotfix\b",
    r"\bcss\b",
    r"\bstyle\b",
    r"\boptimis",
    r"\bperf\b",
    r"\brefactor\b",
    r"\bdoc(?:s)?\b",
    r"\bajust",
]


def run_git(args: list[str], capture: bool = True, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=ROOT,
        text=True,
        capture_output=capture,
        check=check,
        encoding="utf-8",
        errors="replace",
    )


def parse_semver(ver: str) -> tuple[int, int, int]:
    m = re.match(r"^v?(\d+)\.(\d+)\.(\d+)$", ver.strip())
    if not m:
        raise ValueError(f"Version SemVer invalide : {ver}")
    return int(m.group(1)), int(m.group(2)), int(m.group(3))


def bump_semver(current: str, bump_type: str) -> str:
    major, minor, patch = parse_semver(current)
    if bump_type == "major":
        return f"{major + 1}.0.0"
    if bump_type == "minor":
        return f"{major}.{minor + 1}.0"
    if bump_type == "patch":
        return f"{major}.{minor}.{patch + 1}"
    # Sinon, version explicite (ex: "2.3.0")
    parse_semver(bump_type)
    return bump_type.lstrip("v")


def detect_bump_from_notes(notes: str) -> tuple[str, list[str]]:
    lower = notes.lower()
    major_hits = [p for p in MAJOR_PATTERNS if re.search(p, lower)]
    if major_hits:
        return "major", major_hits

    minor_hits = [p for p in MINOR_PATTERNS if re.search(p, lower)]
    if minor_hits:
        return "minor", minor_hits

    patch_hits = [p for p in PATCH_PATTERNS if re.search(p, lower)]
    return "patch", patch_hits


def conventional_prefix(bump_type: str, notes: str) -> str:
    lower = notes.lower()
    if bump_type == "major":
        return "feat!"
    if bump_type == "minor":
        return "feat"
    if any(k in lower for k in ("fix", "bug", "corrig", "correction")):
        return "fix"
    if any(k in lower for k in ("css", "style", "ui")):
        return "style"
    if any(k in lower for k in ("perf", "optim")):
        return "perf"
    if any(k in lower for k in ("doc", "readme", "changelog")):
        return "docs"
    return "chore"


def update_version_file(new_version: str, bump_type: str, notes_lines: list[str], concepts_count: int) -> dict:
    today = datetime.date.today().strftime("%d.%m.%Y")
    data = {"version": "2.0.0", "date": today, "conceptsCount": concepts_count, "history": []}
    if VERSION_FILE.exists():
        data = json.loads(VERSION_FILE.read_text(encoding="utf-8"))

    summary = " ; ".join(notes_lines)
    data["version"] = new_version
    data["date"] = today
    data["conceptsCount"] = concepts_count
    history = data.get("history", [])
    history.insert(
        0,
        {
            "version": new_version,
            "date": today,
            "type": bump_type,
            "summary": summary,
        },
    )
    data["history"] = history[:50]
    VERSION_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    pkg_file = ROOT / "package.json"
    if pkg_file.exists():
        pkg = json.loads(pkg_file.read_text(encoding="utf-8"))
        pkg["version"] = new_version
        pkg_file.write_text(json.dumps(pkg, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    return data


def update_changelog(new_version: str, bump_type: str, notes_lines: list[str]) -> None:
    today = datetime.date.today().strftime("%d.%m.%Y")
    section_titles = {
        "major": "Refonte Majeure",
        "minor": "Nouveautés & Améliorations",
        "patch": "Corrections & Ajustements",
    }
    heading = section_titles.get(bump_type, "Modifications")
    bullets = "\n".join(f"- {line}" for line in notes_lines)
    entry = f"## [{new_version}] - {today}\n### {heading}\n{bullets}\n\n"

    if CHANGELOG_FILE.exists():
        existing = CHANGELOG_FILE.read_text(encoding="utf-8")
        marker = re.search(r"^## \[", existing, re.MULTILINE)
        if marker:
            updated = existing[: marker.start()] + entry + existing[marker.start() :]
        else:
            updated = existing.rstrip() + "\n\n" + entry
    else:
        updated = f"# Changelog — Math Vizualizer\n\n{entry}"

    CHANGELOG_FILE.write_text(updated, encoding="utf-8")


def collect_notes_interactive() -> list[str]:
    print("\nDécris les modifications réalisées (une par ligne, ligne vide pour terminer) :")
    lines: list[str] = []
    while True:
        try:
            line = input("  > ").strip()
        except EOFError:
            break
        if not line:
            if lines:
                break
            print("  (Saisis au moins une modification.)")
            continue
        lines.append(line.lstrip("-*• "))
    return lines


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Auto-versioning SemVer, synchronisation des pages statiques, Changelog et Git Push pour Math Vizualizer."
    )
    parser.add_argument("-m", "--message", action="append", help="Description d'une modification (répétable).")
    parser.add_argument(
        "-b",
        "--bump",
        choices=["auto", "major", "minor", "patch"],
        default="auto",
        help="Type d'incrément SemVer (défaut: auto selon vos modifications).",
    )
    parser.add_argument("--version", dest="exact_version", help="Forcer un numéro de version précis (ex: 2.3.0).")
    parser.add_argument("--no-tag", action="store_true", help="Ne pas créer/pousser de tag git vX.Y.Z.")
    parser.add_argument("--no-push", action="store_true", help="Commit local uniquement, sans git push.")
    parser.add_argument("--dry-run", action="store_true", help="Simuler sans modifier de fichiers ni pousser.")
    parser.add_argument("-y", "--yes", action="store_true", help="Valider sans confirmation interactive.")
    args = parser.parse_args()

    if not VERSION_FILE.exists():
        print("Erreur : version.json introuvable à la racine du dépôt.", file=sys.stderr)
        return 1

    current_data = json.loads(VERSION_FILE.read_text(encoding="utf-8"))
    current_version = current_data.get("version", "2.0.0")
    branch = run_git(["rev-parse", "--abbrev-ref", "HEAD"]).stdout.strip()
    status_out = run_git(["status", "--short"]).stdout.strip()

    print("=" * 64)
    print(f"  Math Vizualizer — Release Manager (actuel: v{current_version} | branche: {branch})")
    print("=" * 64)

    if status_out:
        print("\nFichiers modifiés détectés :")
        for line in status_out.splitlines()[:20]:
            print(f"  {line}")
        total_lines = len(status_out.splitlines())
        if total_lines > 20:
            print(f"  ... et {total_lines - 20} autre(s) fichier(s).")
    else:
        print("\nAucun changement en attente dans git status (les fichiers de version seront tout de même mis à jour si tu continues).")

    notes_lines = [m.strip() for m in (args.message or []) if m.strip()]
    if not notes_lines:
        if args.yes:
            print("Erreur : fournis au moins un message avec -m en mode --yes.", file=sys.stderr)
            return 1
        notes_lines = collect_notes_interactive()

    joined_notes = " ".join(notes_lines)
    detected_bump, matched = detect_bump_from_notes(joined_notes)

    if args.exact_version:
        bump_type = "custom"
        next_version = bump_semver(current_version, args.exact_version)
    elif args.bump != "auto":
        bump_type = args.bump
        next_version = bump_semver(current_version, bump_type)
    else:
        bump_type = detected_bump
        next_version = bump_semver(current_version, bump_type)

    print(f"\nAnalyse des modifications :")
    print(f"  Incrément détecté : {bump_type.upper()} ({'mots-clés: ' + str(len(matched)) if matched else 'défaut'})")
    print(f"  Version proposée  : v{current_version}  -->  v{next_version}")

    if not args.yes and not args.exact_version and args.bump == "auto":
        override = input("\nAppuie sur [Entrée] pour accepter, ou tape major / minor / patch / X.Y.Z : ").strip().lower()
        if override:
            if override in ("major", "minor", "patch"):
                bump_type = override
                next_version = bump_semver(current_version, bump_type)
            else:
                bump_type = "custom"
                next_version = bump_semver(current_version, override)

    prefix = conventional_prefix(bump_type, joined_notes)
    clean_first = re.sub(r"^(?:feat|fix|docs|style|perf|refactor|chore|build|ci)(?:\([^)]*\))?!?\s*:\s*", "", notes_lines[0], flags=re.IGNORECASE)
    commit_subject = f"{prefix}(v{next_version}): {clean_first or notes_lines[0]}"
    commit_body = "\n".join(f"- {l}" for l in notes_lines)
    full_commit_msg = f"{commit_subject}\n\n{commit_body}"

    print("\nRécapitulatif de la release :")
    print(f"  Nouvelle version : v{next_version}")
    print(f"  Commit           : {commit_subject}")
    print(f"  Tag Git          : {'désactivé' if args.no_tag else f'v{next_version}'}")
    print(f"  Git Push         : {'désactivé (--no-push)' if args.no_push else f'origin {branch}'}")

    if args.dry_run:
        print("\n[DRY-RUN] Simulation terminée — aucun fichier modifié, aucun commit ni push effectué.")
        return 0

    if not args.yes:
        confirm = input("\nLancer la mise à jour, le commit et le push ? [O/n] : ").strip().lower()
        if confirm in ("n", "non", "no"):
            print("Annulé.")
            return 0

    # 1. Mise à jour version.json, CHANGELOG.md et génération/synchro des pages concepts/*.html
    concepts_count = generate_all()
    update_version_file(next_version, bump_type, notes_lines, concepts_count)
    concepts_count = generate_all()  # injecte le nouveau numéro de version dans index.html + concepts/*.html
    update_changelog(next_version, bump_type, notes_lines)
    print(f"\n[1/4] version.json, CHANGELOG.md et {concepts_count} pages HTML synchronisés sur v{next_version}.")

    # 2. Git add & commit
    run_git(["add", "-A"], capture=False)
    run_git(["commit", "-m", full_commit_msg], capture=False)
    print(f"[2/4] Commit créé : {commit_subject}")

    # 3. Tag annoté
    if not args.no_tag:
        tag_name = f"v{next_version}"
        existing_tags = run_git(["tag", "-l", tag_name]).stdout.strip()
        if not existing_tags:
            run_git(["tag", "-a", tag_name, "-m", f"Release {tag_name}\n\n{commit_body}"], capture=False)
            print(f"[3/4] Tag annoté {tag_name} créé.")
        else:
            print(f"[3/4] Tag {tag_name} déjà présent, ignoré.")
    else:
        print("[3/4] Création de tag ignorée.")

    # 4. Push automatique
    if not args.no_push:
        push_args = ["push", "origin", branch]
        if not args.no_tag:
            push_args.append("--follow-tags")
        run_git(push_args, capture=False)
        print(f"[4/4] Push réussi vers origin/{branch} ! GitHub Pages va se déployer automatiquement.")
    else:
        print("[4/4] Push ignoré (--no-push).")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
