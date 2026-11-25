# Changelog — Math Vizualizer

Toutes les évolutions notables de la Bible Mathématique sont documentées ici.
Ce fichier est mis à jour automatiquement par `release.py`.

## [2.0.1] - 25.11.2026
### Corrections & Ajustements
- global rework

## [2.0.0] - 25.11.2026
### Refonte Majeure
- Refonte complète du design sur une base épurée inspirée d'Apple HIG & GitHub Primer (thèmes Sombre & Clair).
- Architecture multi-pages native GitHub Pages : Main Hub (`index.html`) + 1 page dédiée par concept (`concepts/<id>.html`).
- Catalogue étendu à **76 concepts** couvrant Unity (C#), Godot 4 (C# & GDScript), Unreal Engine (C++ & Blueprint visuel), C# (.NET) et C++ (GLM/std).
- Classification multi-axes par dimension (`Généraliste`, `2D`, `3D`, `2D & 3D`), 11 domaines, 12 besoins gameplay et 6 parcours guidés.
- 7 moteurs de playgrounds interactifs haute résolution (Physique, Collisions SAT/Slabs/IK, Quaternions/Gimbal Lock, Boids/Steering, Courbes De Casteljau/LUT, Procédural fBm/Voronoï/SDF).
- Progression légère (XP, Rangs, Matrice de maîtrise style GitHub, Épinglés, Command Palette `Ctrl+K`).
- Ajout du script Python `release.py` pour auto-versioning SemVer, synchronisation des pages, changelog et git push automatique.

## [1.1.0] - 26.10.2026
- Version initiale de Math Vizualizer.
