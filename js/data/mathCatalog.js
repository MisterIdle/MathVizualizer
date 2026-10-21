export const MATH_CATALOG = [
  {
    id: "cos",
    name: "Cos",
    category: "1. Trigonométrie",
    sandbox: "trig",
    unitySig: "Mathf.Cos(f)",
    dotnetSig: "MathF.Cos(x)",
    godotCsSig: "Mathf.Cos(x)",
    cppSig: "std::cos(x)",
    unrealSig: "FMath::Cos(x)",
    bpSig: "Cos (Radians)",
    summary: "Donne la position horizontale (Gauche / Droite sur l'axe X) d'un point situé à un angle donné sur un cercle.",
    tldr: "À retenir : Cosinus = Axe Horizontal (X). À 0° il vaut 1 (tout à droite), à 90° il vaut 0 (au milieu), à 180° il vaut -1 (tout à gauche).",
    formula: "x = r · cos(θ)",
    examples: [
      { title: "1. Mouvement en cercle (Orbite)", desc: "Pour faire tourner une boule de feu autour du joueur à une distance de 3m : posX = player.x + Mathf.Cos(Time.time) * 3f;" },
      { title: "2. Balancement de caméra (Headbob)", desc: "Pendant que le joueur marche, osciller légèrement la caméra de gauche à droite avec offsetX = Mathf.Cos(walkTime * 5f) * 0.1f;" },
      { title: "3. Convertir un angle de tir en vecteur", desc: "Si un canon est incliné de 45°, la vitesse horizontale du boulet sera vitesse * Mathf.Cos(45f * Mathf.Deg2Rad)." }
    ]
  },
  {
    id: "sin",
    name: "Sin",
    category: "1. Trigonométrie",
    sandbox: "trig",
    unitySig: "Mathf.Sin(f)",
    dotnetSig: "MathF.Sin(x)",
    godotCsSig: "Mathf.Sin(x)",
    cppSig: "std::sin(x)",
    unrealSig: "FMath::Sin(x)",
    bpSig: "Sin (Radians)",
    summary: "Donne la hauteur verticale (Haut / Bas sur l'axe Y) d'un point situé à un angle donné sur un cercle.",
    tldr: "À retenir : Sinus = Axe Vertical (Y). À 0° il vaut 0, à 90° il vaut 1 (tout en haut), à 270° il vaut -1 (tout en bas).",
    formula: "y = r · sin(θ)",
    examples: [
      { title: "1. Objet de loot qui flotte en l'air", desc: "Pour faire monter et descendre une pièce d'or en douceur : posY = baseHeight + Mathf.Sin(Time.time * 3f) * 0.25f;" },
      { title: "2. Clignotement d'alerte (UI / Shader)", desc: "Faire pulser l'opacité d'une icône de danger entre 0 et 1 : alpha = (Mathf.Sin(Time.time * 6f) + 1f) * 0.5f;" },
      { title: "3. Vagues d'eau en 2D/3D", desc: "Déformer la hauteur Y des sommets d'un maillage d'eau selon leur position X : vertex.y = Mathf.Sin(vertex.x + Time.time);" }
    ]
  },
  {
    id: "tan",
    name: "Tan",
    category: "1. Trigonométrie",
    sandbox: "trig",
    unitySig: "Mathf.Tan(f)",
    dotnetSig: "MathF.Tan(x)",
    godotCsSig: "Mathf.Tan(x)",
    cppSig: "std::tan(x)",
    unrealSig: "FMath::Tan(x)",
    bpSig: "Tan (Radians)",
    summary: "Donne la pente (Hauteur divisée par Largeur) d'un angle. Si vous êtes à 1 mètre d'un mur et regardez en haut avec un angle θ, Tan(θ) est la hauteur sur le mur.",
    tldr: "À retenir : Tangente = Hauteur / Distance. Très utilisée pour calculer la largeur de l'écran de caméra (FOV) à une distance donnée.",
    formula: "tan(θ) = sin(θ) / cos(θ)",
    examples: [
      { title: "1. Calculer le cône de dispersion d'un fusil", desc: "À 20 mètres de distance, avec un angle de dispersion de 5°, le rayon du cercle d'impact vaut : rayon = 20f * Mathf.Tan(5f * Mathf.Deg2Rad);" },
      { title: "2. Taille du champ de vision Caméra (Frustum)", desc: "La hauteur visible par une caméra à une distance D avec un FOV de 60° vaut : hauteur = 2f * D * Mathf.Tan(30f * Mathf.Deg2Rad);" },
      { title: "3. Pente maximale d'un terrain", desc: "Une pente de 45° a une tangente de Tan(45°) = 1 (on monte de 1m quand on avance de 1m)." }
    ]
  },
  {
    id: "sincos",
    name: "SinCos",
    category: "1. Trigonométrie",
    sandbox: "trig",
    unitySig: "(Mathf.Sin(f), Mathf.Cos(f))",
    dotnetSig: "MathF.SinCos(x)",
    godotCsSig: "Mathf.SinCos(x)",
    cppSig: "sincos(x, &s, &c)",
    unrealSig: "FMath::SinCos(&s, &c, x)",
    bpSig: "Sin & Cos",
    summary: "Calcule en une seule fois la largeur X (Cos) et la hauteur Y (Sin) pour placer un point sur un cercle.",
    tldr: "À retenir : Dès que vous devez placer un objet en cercle (X et Y ensemble), utilisez SinCos pour calculer les deux coordonnées d'un coup.",
    formula: "P = (r · cos(θ), r · sin(θ))",
    examples: [
      { title: "1. Spawner 8 ennemis en cercle autour du boss", desc: "Pour i de 0 à 7 : angle = i * (2*PI / 8); spawnPos = bossPos + new Vector3(Cos(angle), 0, Sin(angle)) * rayon;" },
      { title: "2. Radar / Minimap circulaire", desc: "Placer une icône sur le bord de la minimap à partir de l'angle de la quête : iconPos = new Vector2(Cos(a), Sin(a)) * mapRadius;" },
      { title: "3. Rotation d'un point 2D", desc: "Tourner un vecteur (x,y) d'un angle θ utilise à la fois Cos(θ) et Sin(θ) dans la matrice de rotation." }
    ]
  },
  {
    id: "acos",
    name: "Acos",
    category: "1. Trigonométrie",
    sandbox: "trig",
    unitySig: "Mathf.Acos(f)",
    dotnetSig: "MathF.Acos(x)",
    godotCsSig: "Mathf.Acos(x)",
    cppSig: "std::acos(x)",
    unrealSig: "FMath::Acos(x)",
    bpSig: "Acos (Radians)",
    summary: "Fait l'inverse de Cos : vous lui donnez une coordonnée X (entre -1 et 1) et elle vous rend l'angle en radians (entre 0° et 180°).",
    tldr: "À retenir : Acos sert surtout à convertir le résultat d'un Dot Product (entre -1 et 1) en un angle réel en degrés !",
    formula: "θ = arccos(x) ∈ [0°, 180°]",
    examples: [
      { title: "1. Obtenir l'angle exact entre deux vecteurs", desc: "float dot = Vector3.Dot(dirA, dirB); float angleDeg = Mathf.Acos(Mathf.Clamp(dot, -1f, 1f)) * Mathf.Rad2Deg;" },
      { title: "2. Calculer l'angle d'une pente de terrain", desc: "En faisant Acos(Vector3.Dot(groundNormal, Vector3.up)), vous obtenez l'angle exact d'inclinaison du sol (ex: 32°)." },
      { title: "3. Plier un coude ou genou (Inverse Kinematics)", desc: "Dans le théorème d'Al-Kashi, Acos donne l'angle exact de pliure de l'articulation selon la distance de la main." }
    ]
  },
  {
    id: "asin",
    name: "Asin",
    category: "1. Trigonométrie",
    sandbox: "trig",
    unitySig: "Mathf.Asin(f)",
    dotnetSig: "MathF.Asin(x)",
    godotCsSig: "Mathf.Asin(x)",
    cppSig: "std::asin(x)",
    unrealSig: "FMath::Asin(x)",
    bpSig: "Asin (Radians)",
    summary: "Fait l'inverse de Sin : vous lui donnez une hauteur Y (entre -1 et 1) et elle vous rend l'angle correspondant (entre -90° en bas et +90° en haut).",
    tldr: "À retenir : Permet de trouver l'angle d'inclinaison verticale (Pitch) d'un avion ou d'une caméra à partir de la hauteur Y de son vecteur Forward.",
    formula: "θ = arcsin(y) ∈ [-90°, +90°]",
    examples: [
      { title: "1. Horizon artificiel d'un avion (Pitch)", desc: "Si le nez de l'avion pointe vers dir (normalisé), son angle de cabrage vertical vaut : pitchDeg = Mathf.Asin(dir.y) * Mathf.Rad2Deg;" },
      { title: "2. Visée verticale d'une tourelle", desc: "Pour viser une cible située à une hauteur dy et une distance totale d : elevationAngle = Mathf.Asin(dy / d);" },
      { title: "3. Latitude sur une sphère 3D", desc: "Convertir la hauteur Y d'un point sur un globe unitaire en sa latitude nord/sud (-90° à +90°)." }
    ]
  },
  {
    id: "atan",
    name: "Atan (Avec démonstration de son bug à gauche)",
    category: "1. Trigonométrie",
    sandbox: "trig",
    unitySig: "Mathf.Atan(y / x)",
    dotnetSig: "MathF.Atan(y / x)",
    godotCsSig: "Mathf.Atan(y / x)",
    cppSig: "std::atan(y / x)",
    unrealSig: "FMath::Atan(y / x)",
    bpSig: "Atan (Radians)",
    summary: "Calcule l'angle à partir de la division (y / x). PROBLÈME : si l'ennemi est à gauche (x = -2, y = -1), la division (-1 / -2) donne +0.5, exactement comme s'il était à droite (x = +2, y = +1) !",
    tldr: "Regardez le Playground ci-dessous : glissez l'ennemi jaune dans la zone rouge à gauche (x < 0), la tourelle tire à l'envers ! C'est pour cela qu'on utilise Atan2.",
    formula: "θ = arctan(y / x) ∈ [-90°, +90°]",
    examples: [
      { title: "1. Pourquoi Atan se trompe à gauche ?", desc: "En maths, (-y) / (-x) = +y / +x. Les signes moins s'annulent ! Atan ne peut donc jamais savoir si la cible est devant-droite ou derrière-gauche." },
      { title: "2. Risque de division par zéro", desc: "Si la cible est exactement au-dessus du joueur (x = 0), calculer y / x provoque une division par zéro." },
      { title: "3. Quand utiliser Atan alors ?", desc: "Uniquement quand vous avez juste un ratio de pente (ex: pente de route = 0.15) et non une position (x, y)." }
    ]
  },
  {
    id: "atan2",
    name: "Atan2 (Visée 360° parfaite)",
    category: "1. Trigonométrie",
    sandbox: "trig",
    unitySig: "Mathf.Atan2(y, x)",
    dotnetSig: "MathF.Atan2(y, x)",
    godotCsSig: "Mathf.Atan2(y, x)",
    cppSig: "std::atan2(y, x)",
    unrealSig: "FMath::Atan2(y, x)",
    bpSig: "Atan2 (Radians)",
    summary: "Prend Y et X séparément (avec une virgule, sans les diviser) pour connaître le signe de chacun. Résultat : la tourelle vise juste sur 360° sans jamais tirer à l'envers !",
    tldr: "Regardez le Playground ci-dessous : glissez l'ennemi jaune tout autour de la tourelle (même à gauche), le canon reste verrouillé à 100%.",
    formula: "θ = atan2(y, x) ∈ [-180°, +180°]",
    examples: [
      { title: "1. Orienter un joueur 2D vers la souris", desc: "Vector2 dir = mousePos - playerPos; float angleDeg = Mathf.Atan2(dir.y, dir.x) * Mathf.Rad2Deg;" },
      { title: "2. Boussole / Indicateur de dégâts FPS", desc: "Afficher d'où vient un tir sur l'écran en calculant Atan2(hitDir.x, hitDir.z) autour du joueur." },
      { title: "3. Angle d'un stick analogique de manette", desc: "Convertir l'inclinaison (joyX, joyY) d'une manette en angle de direction 360°." }
    ]
  },
  {
    id: "deltaangle",
    name: "DeltaAngle",
    category: "1. Trigonométrie",
    sandbox: "trig",
    unitySig: "Mathf.DeltaAngle(a, b)",
    dotnetSig: "MathF.IEEERemainder(b - a, 360f)",
    godotCsSig: "Mathf.AngleDifference(a, b)",
    cppSig: "std::remainder(b - a, 360.0f)",
    unrealSig: "FMath::FindDeltaAngleDegrees(a, b)",
    bpSig: "Find Delta Angle Degrees",
    summary: "Calcule le chemin le plus court (en degrés entre -180° et +180°) pour tourner de l'angle A vers l'angle B.",
    tldr: "Problème résolu : Si A = 350° et B = 10°, une soustraction normale (10 - 350) donne -340° (presque un tour complet à l'envers). DeltaAngle renvoie +20° !",
    formula: "Δθ ∈ [-180°, +180°]",
    examples: [
      { title: "1. Rotation de tourelle intelligente", desc: "Savoir si la tourelle doit tourner à gauche (DeltaAngle < 0) ou à droite (DeltaAngle > 0) pour rejoindre la cible au plus vite." },
      { title: "2. Limiter la torsion du cou d'un personnage", desc: "Vérifier si l'écart entre la direction du corps et la cible dépasse 70° : if (Mathf.Abs(Mathf.DeltaAngle(bodyYaw, targetYaw)) > 70f)." },
      { title: "3. Alignement de vaisseau spatial", desc: "Ralentir les propulseurs de rotation quand DeltaAngle approche de 0°." }
    ]
  },
  {
    id: "lerpangle",
    name: "LerpAngle",
    category: "1. Trigonométrie",
    sandbox: "trig",
    unitySig: "Mathf.LerpAngle(a, b, t)",
    dotnetSig: "a + DeltaAngle(a, b) * t",
    godotCsSig: "Mathf.LerpAngle(a, b, t)",
    cppSig: "a + std::remainder(b - a, 360.0f) * t",
    unrealSig: "FMath::LerpRange(a, b, t)",
    bpSig: "Lerp (Rotator)",
    summary: "Interpole progressivement entre l'angle A et l'angle B en passant toujours par le chemin le plus court (sans bugger quand on traverse 0° / 360°).",
    tldr: "À retenir : Ne faites jamais Mathf.Lerp sur des angles en degrés (à cause du passage 359° -> 0°), utilisez toujours Mathf.LerpAngle !",
    formula: "θ(t) = a + DeltaAngle(a, b) · t",
    examples: [
      { title: "1. Tourner doucement un personnage vers sa direction", desc: "currentYaw = Mathf.LerpAngle(currentYaw, targetYaw, Time.deltaTime * 8f);" },
      { title: "2. Aiguille de boussole fluide", desc: "Faire tourner l'aiguille du Nord sans qu'elle fasse un tour complet quand le joueur passe de 359° à 1°." },
      { title: "3. Caméra de voiture en virage", desc: "Aligner progressivement l'angle de la caméra derrière la voiture." }
    ]
  },
  {
    id: "qeuler",
    name: "Quaternion.Euler (3D)",
    category: "2. Quaternions & Rotations 3D",
    sandbox: "space3d",
    unitySig: "Quaternion.Euler(x, y, z)",
    dotnetSig: "Quaternion.CreateFromYawPitchRoll(y, x, z)",
    godotCsSig: "Quaternion.FromEuler(new Vector3(x, y, z))",
    cppSig: "glm::quat(glm::vec3(x, y, z))",
    unrealSig: "FRotator(Pitch, Yaw, Roll).Quaternion()",
    bpSig: "Rotator to Quat",
    summary: "Transforme 3 angles faciles à lire pour un humain (Pitch X = Haut/Bas, Yaw Y = Gauche/Droite, Roll Z = Pencher la tête) en un Quaternion 3D.",
    tldr: "Repère 3D : La face VERTE du cube est son toit (HAUT), la face BLEUE est son devant (AVANT). Bougez les 3 curseurs pour voir comment chaque angle agit.",
    formula: "q = q_y(Yaw) · q_x(Pitch) · q_z(Roll)",
    examples: [
      { title: "1. Orienter un objet à un angle précis en C#", desc: "transform.rotation = Quaternion.Euler(0f, 90f, 0f); // Tourne l'objet de 90° vers la droite." },
      { title: "2. Caméra FPS (Souris Haut/Bas et Gauche/Droite)", desc: "camTransform.localRotation = Quaternion.Euler(pitchX, yawY, 0f);" },
      { title: "3. Incliner une porte qui s'ouvre", desc: "door.localRotation = Quaternion.Euler(0f, currentOpenAngle, 0f);" }
    ]
  },
  {
    id: "qangleaxis",
    name: "Quaternion.AngleAxis (3D)",
    category: "2. Quaternions & Rotations 3D",
    sandbox: "space3d",
    unitySig: "Quaternion.AngleAxis(angle, axis)",
    dotnetSig: "Quaternion.CreateFromAxisAngle(axis, rad)",
    godotCsSig: "new Quaternion(axis.Normalized(), rad)",
    cppSig: "glm::angleAxis(rad, axis)",
    unrealSig: "FQuat(Axis, AngleRad)",
    bpSig: "Rotator from Axis and Angle",
    summary: "Plante une broche imaginaire (l'axe jaune en pointillés) à travers l'objet 3D et fait tourner le cube autour de cette broche.",
    tldr: "À retenir : Très utile quand l'axe de rotation est penché en diagonale (ex: une planète inclinée à 23.5° qui tourne sur elle-même).",
    formula: "q = (u · sin(θ/2), cos(θ/2))",
    examples: [
      { title: "1. Faire tourner une roue ou une hélice autour de son essieu", desc: "wheel.rotation = Quaternion.AngleAxis(spinAngle, wheelAxleDir);" },
      { title: "2. Planète inclinée qui tourne sur son axe", desc: "planet.rotation = Quaternion.AngleAxis(dayTime * 360f, tiltedAxis);" },
      { title: "3. Recul d'arme autour de la poignée", desc: "Tourner l'arme de 12° autour du vecteur latéral Right du joueur." }
    ]
  },
  {
    id: "qlookrotation",
    name: "Quaternion.LookRotation (3D)",
    category: "2. Quaternions & Rotations 3D",
    sandbox: "space3d",
    unitySig: "Quaternion.LookRotation(forward, up)",
    dotnetSig: "Matrix4x4.CreateLookAt(...)",
    godotCsSig: "Basis.LookingAt(target).GetRotationQuaternion()",
    cppSig: "glm::quatLookAt(dir, up)",
    unrealSig: "FRotationMatrix::MakeFromXZ(Fwd, Up).ToQuat()",
    bpSig: "Find Look at Rotation",
    summary: "Calcule automatiquement la rotation 3D pour que la face avant bleue (+Z) du cube regarde droit vers la cible jaune, tout en gardant le toit vert (+Y) vers le ciel.",
    tldr: "À retenir : C'est l'équivalent 3D de Atan2 ! Indispensable pour orienter un boss, un projecteur ou une roquette vers une cible 3D.",
    formula: "+Z_local = normalize(Target - Origin)",
    examples: [
      { title: "1. Faire regarder un ennemi vers le joueur", desc: "Vector3 dir = player.position - enemy.position; enemy.rotation = Quaternion.LookRotation(dir, Vector3.up);" },
      { title: "2. Aligner une flèche sur sa trajectoire de vol", desc: "arrow.rotation = Quaternion.LookRotation(rigidbody.velocity);" },
      { title: "3. Orienter des étincelles d'impact sur un mur", desc: "Instantiate(sparksPrefab, hit.point, Quaternion.LookRotation(hit.normal));" }
    ]
  },
  {
    id: "qslerp",
    name: "Quaternion.Slerp (3D)",
    category: "2. Quaternions & Rotations 3D",
    sandbox: "space3d",
    unitySig: "Quaternion.Slerp(qA, qB, t)",
    dotnetSig: "Quaternion.Slerp(qA, qB, t)",
    godotCsSig: "qA.Slerp(qB, t)",
    cppSig: "glm::slerp(qA, qB, t)",
    unrealSig: "FQuat::Slerp(qA, qB, t)",
    bpSig: "Lerp (Quat)",
    summary: "Tourne un objet 3D de façon fluide entre sa rotation de départ (cube gris) et sa rotation d'arrivée (cube jaune) à vitesse constante.",
    tldr: "À retenir : Combinez LookRotation (pour trouver la rotation cible) et Slerp (pour y tourner progressivement sans mouvement brusque).",
    formula: "Slerp(q1, q2, t)",
    examples: [
      { title: "1. Tourelle 3D qui tourne à vitesse réaliste", desc: "Quaternion targetRot = Quaternion.LookRotation(dir); transform.rotation = Quaternion.Slerp(transform.rotation, targetRot, Time.deltaTime * 5f);" },
      { title: "2. Transition de caméra entre deux plans", desc: "Passer doucement de la vue épaule à la vue cinématique entre t = 0 et t = 1." },
      { title: "3. Animation procédurale de coffre ou levier", desc: "Interpoler entre la rotation fermée et la rotation ouverte." }
    ]
  },
  {
    id: "coord3d",
    name: "Coordonnées Sphériques (Caméra Orbitale 3D)",
    category: "3. Repères & Géométrie (notes-maths-tex)",
    sandbox: "space3d",
    unitySig: "SphericalToCartesian(rho, theta, phi)",
    dotnetSig: "new Vector3(r*Sin(phi)*Cos(th), r*Cos(phi), r*Sin(phi)*Sin(th))",
    godotCsSig: "Vector3(r*Sin(phi)*Cos(th), r*Cos(phi), r*Sin(phi)*Sin(th))",
    cppSig: "vec3(r*sin(phi)*cos(th), r*cos(phi), r*sin(phi)*sin(th))",
    unrealSig: "FVector2D(Phi, Theta).SphericalToUnitCartesian() * Rho",
    bpSig: "Spherical to Unit Cartesian",
    summary: "Permet de placer un point en 3D avec 1 distance (Rayon ρ) et 2 angles (θ gauche/droite, φ haut/bas). L'ombre au sol montre où se trouve le point verticalement.",
    tldr: "À retenir : C'est exactement comme ça que fonctionne une caméra à la 3ème personne (type Dark Souls / GTA) qui tourne autour du joueur !",
    formula: "x = ρ·sin(φ)cos(θ), y = ρ·cos(φ), z = ρ·sin(φ)sin(θ)",
    examples: [
      { title: "1. Caméra 3ème personne (TPS) autour du personnage", desc: "La molette règle la distance ρ, la souris X règle l'angle horizontal θ, et la souris Y règle la hauteur φ." },
      { title: "2. Faire apparaître des météorites dans le ciel", desc: "Choisir un angle aléatoire sur le dôme céleste (φ < 90° pour rester au-dessus du sol) à une distance de 500m." },
      { title: "3. Coordonnées GPS sur une planète ronde", desc: "Convertir Latitude + Longitude + Altitude en position 3D (X, Y, Z)." }
    ]
  },
  {
    id: "dot",
    name: "Dot (Produit Scalaire — Vision & Alignement)",
    category: "3. Repères & Géométrie (notes-maths-tex)",
    sandbox: "dot",
    unitySig: "Vector3.Dot(a, b)",
    dotnetSig: "Vector3.Dot(a, b)",
    godotCsSig: "a.Dot(b)",
    cppSig: "glm::dot(a, b)",
    unrealSig: "FVector::DotProduct(a, b)",
    bpSig: "Dot Product",
    summary: "Compare deux directions normalisées et renvoie un score entre -1 et +1 : +1 = exactement dans la même direction, 0 = à 90° sur le côté, -1 = pile dans le dos.",
    tldr: "Testez dans le Playground : déplacez la flèche rouge (Joueur A) dans le cône vert du Garde B pour voir le score Dot changer en direct !",
    formula: "A · B = |A|·|B|·cos(θ) ∈ [-1, +1]",
    examples: [
      { title: "1. Cône de vision d'un Garde (Infiltration)", desc: "Vector3 toPlayer = (player.pos - guard.pos).normalized; if (Vector3.Dot(guard.forward, toPlayer) > 0.7f) { /* Le joueur est dans le cône de 45° devant le garde : ALERTE ! */ }" },
      { title: "2. Dégâts critiques dans le dos (Backstab RPG)", desc: "Si Vector3.Dot(enemy.forward, attacker.forward) > 0.8f, l'attaquant regarde dans le même sens que le dos de l'ennemi -> Dégâts x3 !" },
      { title: "3. Vérifier si un sol est praticable ou trop raide", desc: "if (Vector3.Dot(hit.normal, Vector3.up) > 0.7f) { /* Le sol est assez plat pour marcher dessus */ }" }
    ]
  },
  {
    id: "project",
    name: "Projeté Orthogonal & Glissement sur Mur",
    category: "3. Repères & Géométrie (notes-maths-tex)",
    sandbox: "project",
    unitySig: "Vector3.Project(a, b)",
    dotnetSig: "b * (Vector3.Dot(a, b) / b.LengthSquared())",
    godotCsSig: "a.Project(b)",
    cppSig: "b * (glm::dot(a, b) / glm::dot(b, b))",
    unrealSig: "A.ProjectOnTo(B)",
    bpSig: "Project Vector on to Vector",
    summary: "Écrase le vecteur A perpendiculairement sur la ligne du vecteur B (comme l'ombre d'un bâton sur un mur ou un rail).",
    tldr: "À retenir : La flèche jaune est la vitesse conservée le long du rail B, et la ligne pointillée verte est la distance la plus courte entre A et la droite B.",
    formula: "H = ((A · B) / ||B||²) · B",
    examples: [
      { title: "1. Glisser le long d'un mur sans rester bloqué", desc: "Quand le joueur fonce en diagonale contre un mur, on projette son vecteur vitesse le long du mur pour qu'il glisse fluidement." },
      { title: "2. Chariot de mine sur un rail", desc: "Projeter la force poussée par le joueur sur la direction du rail pour faire avancer le wagon." },
      { title: "3. Détection de tir frôlé (Near-miss)", desc: "Calculer la distance perpendiculaire (ligne verte) entre la trajectoire d'une balle et la tête du joueur pour jouer un son de sifflement." }
    ]
  },
  {
    id: "alkashi",
    name: "Al-Kashi (Plier un bras en Inverse Kinematics)",
    category: "3. Repères & Géométrie (notes-maths-tex)",
    sandbox: "alkashi",
    unitySig: "Mathf.Acos((a*a + b*b - c*c) / (2*a*b))",
    dotnetSig: "MathF.Acos((a*a + b*b - c*c) / (2*a*b))",
    godotCsSig: "Mathf.Acos((a*a + b*b - c*c) / (2*a*b))",
    cppSig: "std::acos((a*a + b*b - c*c) / (2*a*b))",
    unrealSig: "FMath::Acos((a*a + b*b - c*c) / (2*a*b))",
    bpSig: "Law of Cosines (Al-Kashi)",
    summary: "Si vous connaissez la longueur des 3 côtés d'un triangle (avant-bras, bras, et distance épaule-main), Al-Kashi calcule l'angle exact de pliure du coude !",
    tldr: "Testez dans le Playground : déplacez la Main B pour voir l'angle du Coude C se recalculer automatiquement.",
    formula: "c² = a² + b² - 2ab · cos(γ)",
    examples: [
      { title: "1. Poser les pieds d'un personnage sur des escaliers (Foot IK)", desc: "Connaissant la longueur de la cuisse (a), du tibia (b) et la distance hanche-marche (c), Al-Kashi donne l'angle exact de pliure du genou." },
      { title: "2. Bras robotique ou grappin articulé", desc: "Plier les deux segments d'une grue pour que la pince touche exactement l'objet à ramasser." },
      { title: "3. Calculer la distance entre deux ennemis vus au radar", desc: "Si vous connaissez la distance de deux ennemis et l'angle entre eux, Al-Kashi donne la distance qui les sépare." }
    ]
  },
  {
    id: "cross",
    name: "Cross (Produit Vectoriel)",
    category: "4. Algèbre Linéaire, Barycentres & Physique",
    sandbox: "cross",
    unitySig: "Vector3.Cross(a, b)",
    dotnetSig: "Vector3.Cross(a, b)",
    godotCsSig: "a.Cross(b)",
    cppSig: "glm::cross(a, b)",
    unrealSig: "FVector::CrossProduct(a, b)",
    bpSig: "Cross Product",
    summary: "À partir de deux vecteurs A et B posés à plat, génère un 3ème vecteur qui pointe à 90° vers le haut (perpendiculaire aux deux premiers).",
    tldr: "À retenir : Cross sert à trouver la direction perpendiculaire (ex: trouver la droite d'un personnage à partir de son axe Avant et de son axe Haut).",
    formula: "A × B = Vecteur perpendiculaire",
    examples: [
      { title: "1. Trouver la direction d'esquive latérale (Strafe)", desc: "Vector3 rightDir = Vector3.Cross(Vector3.up, player.forward); // Donne le vecteur pointant exactement à droite du joueur." },
      { title: "2. Calculer la normale d'un triangle de terrain 3D", desc: "Vector3 normal = Vector3.Cross(sommetB - sommetA, sommetC - sommetA).normalized;" },
      { title: "3. Effet Magnus (Balle de foot brossée)", desc: "La force qui fait courber une balle en rotation vaut Cross(axeDeRotation, vitesseDeLaBalle)." }
    ]
  },
  {
    id: "matrix",
    name: "Matrices 2D & Déterminant (Gauche ou Droite ?)",
    category: "4. Algèbre Linéaire, Barycentres & Physique",
    sandbox: "matrix",
    unitySig: "a.x * b.y - a.y * b.x",
    dotnetSig: "Matrix3x2.GetDeterminant()",
    godotCsSig: "new Transform2D(a, b, Vector2.Zero).Determinant()",
    cppSig: "glm::determinant(mat2(a, b))",
    unrealSig: "FVector2D::CrossProduct(A, B)",
    bpSig: "Cross Product 2D (Determinant)",
    summary: "Le déterminant de deux vecteurs 2D donne l'aire du parallélogramme entre eux. S'il est positif (vert), B est à gauche de A ; s'il est négatif (rouge), B est à droite de A !",
    tldr: "Testez dans le Playground : faites passer la flèche B de l'autre côté de la flèche A pour voir la zone passer du vert (+) au rouge (-).",
    formula: "det(A, B) = Ax·By - Ay·Bx",
    examples: [
      { title: "1. Savoir si une voiture IA doit tourner le volant à gauche ou à droite", desc: "float det = forward.x * toWaypoint.y - forward.y * toWaypoint.x; // Si det > 0 tourner à gauche, si det < 0 tourner à droite." },
      { title: "2. Calculer l'aire d'une zone de capture au sol", desc: "L'aire du triangle formé par A et B vaut exactement 0.5 * Mathf.Abs(det)." },
      { title: "3. Savoir si une matrice écrase l'objet (det = 0)", desc: "Si le déterminant vaut 0, l'objet est totalement aplati en 2D et la transformation ne peut plus être inversée." }
    ]
  },
  {
    id: "barycentre",
    name: "Barycentres & Courbe de Bézier (Bernstein)",
    category: "4. Algèbre Linéaire, Barycentres & Physique",
    sandbox: "barycentre",
    unitySig: "(wA*A + wB*B + wC*C) / (wA + wB + wC)",
    dotnetSig: "Barycentric(A, B, C, wA, wB, wC)",
    godotCsSig: "QuadraticBezier(A, B, C, t)",
    cppSig: "(1-t)*(1-t)*A + 2*(1-t)*t*B + t*t*C",
    unrealSig: "FMath::ComputeBaryCentric2D(...)",
    bpSig: "Get Barycentric Coords",
    summary: "Le barycentre G (point vert) est la moyenne des positions A, B, C attirée par leurs poids (α, β, γ). La courbe violette est une courbe de Bézier qui relie A à C en étant attirée par B.",
    tldr: "À retenir : Utilisé pour placer une caméra au centre d'un groupe de joueurs (Smash Bros) ou tracer des rails courbes et des trajectoires de sorts.",
    formula: "B(t) = (1-t)²·A + 2t(1-t)·B + t²·C",
    examples: [
      { title: "1. Caméra multijoueur qui suit plusieurs joueurs", desc: "On calcule le barycentre des positions des 4 joueurs (avec un poids double sur le porteur du ballon) pour centrer la caméra." },
      { title: "2. Missile magique à trajectoire courbe (Bézier)", desc: "Faire partir le projectile de A (joueur), l'attirer vers un point haut B, et le faire retomber sur C (ennemi)." },
      { title: "3. Mélanger 3 textures de terrain sur un triangle", desc: "Les poids barycentriques (wA, wB, wC) servent à doser le mélange entre Herbe, Roche et Neige sur un maillage." }
    ]
  },
  {
    id: "ballistic",
    name: "Tir à l'arc (Parabole Balistique)",
    category: "4. Algèbre Linéaire, Barycentres & Physique",
    sandbox: "ballistic",
    unitySig: "pos = p0 + v0 * t + 0.5f * Physics.gravity * t * t",
    dotnetSig: "p0 + v0 * t + 0.5f * g * t * t",
    godotCsSig: "p0 + v0 * t + 0.5f * gravity * t * t",
    cppSig: "p0 + v0 * t + 0.5f * g * t * t",
    unrealSig: "UGameplayStatics::PredictProjectilePath(...)",
    bpSig: "Predict Projectile Path",
    summary: "Trace la courbe exacte d'une flèche ou d'une grenade soumise à la gravité g avant même de la lancer.",
    tldr: "Testez dans le Playground : tirez la flèche rouge (Vitesse initiale V0) et changez la gravité (Lune = 1.6, Terre = 9.8) pour prévisualiser l'arc de tir !",
    formula: "P(t) = P₀ + V₀ · t + ½ · g · t²",
    examples: [
      { title: "1. Afficher la ligne de visée d'une grenade (LineRenderer)", desc: "Dans une boucle de t = 0 à 3 secondes par pas de 0.1s, calculez chaque point P(t) pour dessiner l'arc de prévisualisation." },
      { title: "2. Saut de plateforme prédictif", desc: "Connaître à l'avance où le joueur va atterrir selon sa vitesse de saut." },
      { title: "3. Tir de catapulte ou d'arc", desc: "Plus vous tirez la corde de l'arc, plus la longueur du vecteur V0 augmente, allongeant la parabole." }
    ]
  },
  {
    id: "vectorfield",
    name: "Champs Vectoriels & Opérateur Nabla (∇)",
    category: "4. Algèbre Linéaire, Barycentres & Physique",
    sandbox: "vectorfield",
    unitySig: "Vector2(-y, x) + grad",
    dotnetSig: "CurlAndGradient(x, y)",
    godotCsSig: "SampleVectorField(pos)",
    cppSig: "nabla_field(x, y)",
    unrealSig: "EvaluateVectorField(Pos)",
    bpSig: "Vector Field Sample",
    summary: "Chaque point de l'espace possède une petite flèche de force (vent, courant marin, trou noir). Déplacez le point rouge pour attirer le tourbillon.",
    tldr: "À retenir : Très utilisé dans les effets de particules (VFX Graph / Niagara) et le Pathfinding de foule (Flow Fields) pour guider 1000 unités sans lag.",
    formula: "F(x, y) = Rotationnel + Gradient",
    examples: [
      { title: "1. Tornade ou Trou noir qui aspire les objets", desc: "À chaque frame, on ajoute aux objets proches une force combinant une rotation tangente et une attraction vers le centre." },
      { title: "2. Courant d'une rivière sinueuse", desc: "Le bateau lit la flèche du champ vectoriel sous sa coque pour dériver avec l'eau." },
      { title: "3. Flow Field Pathfinding (RTS / Vampire Survivors)", desc: "Au lieu de calculer un chemin A* par monstre, on génère une grille de flèches pointant vers le joueur." }
    ]
  },
  {
    id: "lerp",
    name: "Lerp (Interpolation Linéaire)",
    category: "5. Interpolation, Bornes & Courbes",
    sandbox: "graph",
    unitySig: "Mathf.Lerp(a, b, t)",
    dotnetSig: "Single.Lerp(a, b, t)",
    godotCsSig: "Mathf.Lerp(a, b, t)",
    cppSig: "std::lerp(a, b, t)",
    unrealSig: "FMath::Lerp(a, b, t)",
    bpSig: "Lerp",
    summary: "Trouve une valeur intermédiaire entre Départ (a) et Arrivée (b) selon un curseur t compris entre 0 (0%) et 1 (100%).",
    tldr: "Exemple chiffré : Lerp(10, 20, 0.5) renvoie 15 (pile à 50% du chemin entre 10 et 20). Si t dépasse 1, Lerp bloque le résultat sur l'arrivée b.",
    formula: "f(t) = a + (b - a) · clamp01(t)",
    params: [{ key: "a", label: "Départ (a)", min: -4, max: 4, step: 0.5, value: -2 }, { key: "b", label: "Arrivée (b)", min: -4, max: 4, step: 0.5, value: 3 }],
    examples: [
      { title: "1. Ouvrir un tiroir ou une porte coulissante", desc: "posX = Mathf.Lerp(closedX, openX, openProgress); // Quand openProgress passe de 0 à 1, le tiroir glisse de closedX à openX." },
      { title: "2. Changer la couleur de la barre de vie", desc: "Color.Lerp(Color.red, Color.green, currentHP / maxHP); // Rouge à 0% de vie, Jaune à 50%, Vert à 100%." },
      { title: "3. Zoom de visée au sniper (FOV)", desc: "cam.fieldOfView = Mathf.Lerp(60f, 20f, aimProgress);" }
    ]
  },
  {
    id: "smoothstep",
    name: "SmoothStep (Courbe d'aisance en S)",
    category: "5. Interpolation, Bornes & Courbes",
    sandbox: "graph",
    unitySig: "Mathf.SmoothStep(a, b, t)",
    dotnetSig: "a + (b-a) * (t*t*(3-2t))",
    godotCsSig: "Mathf.SmoothStep(a, b, t)",
    cppSig: "t*t*(3-2t)",
    unrealSig: "FMath::SmoothStep(a, b, t)",
    bpSig: "Interp Ease In Out",
    summary: "Fait exactement comme Lerp entre t = 0 et t = 1, mais démarre doucement, accélère au milieu, et freine en douceur à l'arrivée (courbe en S).",
    tldr: "À retenir : Lerp donne un mouvement robotique qui s'arrête sec. SmoothStep donne un mouvement naturel et organique sans effort !",
    formula: "s(t) = 3t² - 2t³",
    params: [{ key: "a", label: "Départ (a)", min: -4, max: 4, step: 0.5, value: -2 }, { key: "b", label: "Arrivée (b)", min: -4, max: 4, step: 0.5, value: 2 }],
    examples: [
      { title: "1. Apparition de fenêtre UI ou Menu Pause", desc: "Faire glisser un panneau d'interface à l'écran avec un freinage élégant à la fin." },
      { title: "2. Ascenseur qui démarre et s'arrête sans à-coup", desc: "height = Mathf.SmoothStep(floor1Y, floor2Y, timer);" },
      { title: "3. Transition de caméra cinématique", desc: "Évite l'effet de secousse au début et à la fin du mouvement de caméra." }
    ]
  },
  {
    id: "clamp",
    name: "Clamp (Borner entre Min et Max)",
    category: "5. Interpolation, Bornes & Courbes",
    sandbox: "graph",
    unitySig: "Mathf.Clamp(v, min, max)",
    dotnetSig: "Math.Clamp(v, min, max)",
    godotCsSig: "Mathf.Clamp(v, min, max)",
    cppSig: "std::clamp(v, min, max)",
    unrealSig: "FMath::Clamp(v, min, max)",
    bpSig: "Clamp (float)",
    summary: "Empêche un nombre de descendre sous le Minimum ou de dépasser le Maximum. S'il dépasse, il est bloqué sur la limite.",
    tldr: "Exemple chiffré : Avec Min = 0 et Max = 100, Clamp(150, 0, 100) renvoie 100, et Clamp(-20, 0, 100) renvoie 0.",
    formula: "f(x) = max(min, min(max, x))",
    params: [{ key: "a", label: "Minimum", min: -4, max: 1, step: 0.5, value: -1.5 }, { key: "b", label: "Maximum", min: -1, max: 4, step: 0.5, value: 1.5 }],
    examples: [
      { title: "1. Points de vie (HP) du joueur", desc: "hp = Mathf.Clamp(hp - damage, 0f, maxHp); // Empêche la vie d'être négative ou de dépasser 100% après un soin." },
      { title: "2. Bloquer la caméra FPS en haut et en bas", desc: "pitchX = Mathf.Clamp(pitchX, -85f, 85f); // Empêche le joueur de faire un looping avec son cou." },
      { title: "3. Limiter la vitesse maximale d'une voiture", desc: "speed = Mathf.Clamp(speed, -20f, 120f);" }
    ]
  },
  {
    id: "pingpong",
    name: "PingPong (Aller-Retour automatique)",
    category: "5. Interpolation, Bornes & Courbes",
    sandbox: "graph",
    unitySig: "Mathf.PingPong(t, len)",
    dotnetSig: "len - Abs(Repeat(t, len*2) - len)",
    godotCsSig: "Mathf.PingPong(t, len)",
    cppSig: "len - std::abs(std::fmod(t, len*2) - len)",
    unrealSig: "FMath::PingPong(t, len)",
    bpSig: "Ping Pong",
    summary: "Quand la valeur d'entrée X augmente à l'infini (comme Time.time), la sortie monte jusqu'à Length puis redescend à 0 en boucle.",
    tldr: "À retenir : Idéal pour faire patrouiller une plateforme ou un piège de gauche à droite en une seule ligne de code sans if/else !",
    formula: "f(x) = L - |Repeat(x, 2L) - L|",
    params: [{ key: "a", label: "Longueur (L)", min: 0.5, max: 4, step: 0.5, value: 2.5 }],
    examples: [
      { title: "1. Plateforme mobile qui fait des allers-retours", desc: "transform.position = startPos + Vector3.right * Mathf.PingPong(Time.time * 2f, 5f); // Va de 0m à 5m puis revient à 0m." },
      { title: "2. Jauge de puissance de tir (Golf / Pêche)", desc: "Faire monter et descendre le curseur de force tant que le joueur maintient la touche Espace." },
      { title: "3. Laser de sécurité qui balaie un couloir", desc: "Osciller l'angle du laser entre 0° et 45° en continu." }
    ]
  },
  {
    id: "pow",
    name: "Pow (Puissances, Courbe d'XP & Crédit)",
    category: "5. Interpolation, Bornes & Courbes",
    sandbox: "graph",
    unitySig: "Mathf.Pow(f, p)",
    dotnetSig: "MathF.Pow(x, y)",
    godotCsSig: "Mathf.Pow(x, y)",
    cppSig: "std::pow(x, y)",
    unrealSig: "FMath::Pow(x, y)",
    bpSig: "Power",
    summary: "Multiplie x par lui-même p fois (x puissance p). Permet de créer des courbes qui grimpent de plus en plus vite.",
    tldr: "À retenir : Si l'exposant p = 2, la valeur double sa vitesse de croissance (parabole). Très utilisé pour l'XP des RPG et les intérêts bancaires.",
    formula: "f(x) = x^p",
    params: [{ key: "a", label: "Exposant (p)", min: 0.5, max: 4, step: 0.5, value: 2 }],
    examples: [
      { title: "1. Courbe d'XP nécessaire par niveau dans un RPG", desc: "xpRequis = 100f * Mathf.Pow(niveau, 2f); // Niv 1 = 100 XP, Niv 2 = 400 XP, Niv 10 = 10 000 XP." },
      { title: "2. Intérêts composés / Coût d'un crédit (notes-maths-tex)", desc: "Sur n années à 5% d'intérêt : capitalFinal = capitalInitial * Mathf.Pow(1.05f, n);" },
      { title: "3. Reflet brillant sur un matériau 3D (Specular Shader)", desc: "spec = Mathf.Pow(Mathf.Max(0f, dotRefl), 32f); // Concentre le reflet lumineux en un petit point brillant." }
    ]
  },
  {
    id: "perlinnoise",
    name: "PerlinNoise (Bruit Procédural 2D)",
    category: "6. Bruit Procédural & Couleurs",
    sandbox: "perlin",
    unitySig: "Mathf.PerlinNoise(x, y)",
    dotnetSig: "CustomPerlin2D(x, y)",
    godotCsSig: "noise.GetNoise2D(x, y)",
    cppSig: "perlin2D(x, y)",
    unrealSig: "FMath::PerlinNoise2D(FVector2D(x,y))",
    bpSig: "Make Perlin Noise 2D",
    summary: "Génère une carte de valeurs aléatoires douces et continues entre 0 (noir) et 1 (blanc) : pas de saut brutal entre deux voisins, ce qui crée des collines naturelles.",
    tldr: "À retenir : Random.value fait de la neige télévisée illisible ; PerlinNoise fait des montagnes, des nuages et des tremblements de caméra réalistes.",
    formula: "Perlin(x · freq, y · freq) ∈ [0, 1]",
    examples: [
      { title: "1. Générer un terrain de montagnes (Minecraft / Valheim)", desc: "height = Mathf.PerlinNoise(x * 0.05f, z * 0.05f) * 50f; // Donne la hauteur de chaque bloc." },
      { title: "2. Tremblement de caméra organique (Screen Shake)", desc: "shakeX = (Mathf.PerlinNoise(Time.time * 25f, 0f) - 0.5f) * intensity;" },
      { title: "3. Faire vaciller l'intensité d'une torche", desc: "light.intensity = 1f + Mathf.PerlinNoise(Time.time * 8f, 0f) * 0.4f;" }
    ]
  },
  {
    id: "colortemp",
    name: "CorrelatedColorTemperatureToRGB (Kelvin)",
    category: "6. Bruit Procédural & Couleurs",
    sandbox: "colortemp",
    unitySig: "Mathf.CorrelatedColorTemperatureToRGB(k)",
    dotnetSig: "KelvinToRgb(k)",
    godotCsSig: "ColorFromKelvin(k)",
    cppSig: "KelvinToRGB(k)",
    unrealSig: "FLinearColor::MakeFromColorTemperature(k)",
    bpSig: "Make Color From Temperature",
    summary: "Convertit une température en degrés Kelvin en couleur lumineuse réaliste : 1800K = flamme orange, 6500K = lumière blanche du midi, 12000K = ciel polaire bleuté.",
    tldr: "Testez dans le Playground : glissez le curseur Kelvin de 1000K à 20000K pour voir la couleur physique exacte !",
    formula: "T(K) ∈ [1000, 40000] → Color(R, G, B)",
    examples: [
      { title: "1. Cycle Jour / Nuit réaliste", desc: "Passer le soleil de 2000K (coucher de soleil orangé) à 6500K (zénith blanc) puis 12000K (crépuscule bleu)." },
      { title: "2. Chauffer du métal dans une forge", desc: "Plus l'épée chauffe dans la forge, plus sa température Kelvin monte du rouge sombre au blanc éblouissant." },
      { title: "3. Éclairage intérieur (Ampoules vs Néons)", desc: "2700K donne une ambiance salon chaleureuse, 4000K donne un néon de bureau." }
    ]
  },
  {
    id: "sandbox-live",
    title: "⚡ Page Blanche (C# Live)",
    category: "Laboratoire"
  }
];