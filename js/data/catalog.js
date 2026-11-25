import { CATEGORIES, DIMENSIONS, DIMENSION_META, DIFFICULTY_META } from "./categories.js";
import { CATALOG_SCALARS_CURVES } from "./catalogScalarsCurves.js";
import { CATALOG_TRIG_VECTORS } from "./catalogTrigVectors.js";
import { CATALOG_3D_MATRICES } from "./catalog3DMatrices.js";
import { CATALOG_COLLISIONS_PHYS } from "./catalogCollisionsPhys.js";
import { CATALOG_PROC_PROB } from "./catalogProcProb.js";

// Assemble in exact category order (01 -> 11)
const RAW_CATALOG = [
  ...CATALOG_SCALARS_CURVES.filter((c) => c.categoryId === "scalars"),
  ...CATALOG_SCALARS_CURVES.filter((c) => c.categoryId === "interpolation"),
  ...CATALOG_TRIG_VECTORS.filter((c) => c.categoryId === "trigonometry"),
  ...CATALOG_TRIG_VECTORS.filter((c) => c.categoryId === "vectors"),
  ...CATALOG_3D_MATRICES.filter((c) => c.categoryId === "quaternions"),
  ...CATALOG_3D_MATRICES.filter((c) => c.categoryId === "spaces"),
  ...CATALOG_COLLISIONS_PHYS.filter((c) => c.categoryId === "collisions"),
  ...CATALOG_COLLISIONS_PHYS.filter((c) => c.categoryId === "physics"),
  ...CATALOG_SCALARS_CURVES.filter((c) => c.categoryId === "curves"),
  ...CATALOG_PROC_PROB.filter((c) => c.categoryId === "procedural"),
  ...CATALOG_PROC_PROB.filter((c) => c.categoryId === "probability")
];

const CAT_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

export const MATH_CATALOG = RAW_CATALOG.map((item, idx) => {
  const cat = CAT_BY_ID.get(item.categoryId);
  return {
    ...item,
    order: idx,
    categoryName: cat ? cat.name : item.categoryId,
    categoryShort: cat ? cat.shortName : item.categoryId,
    categoryIndex: cat ? cat.index : "00",
    dimensionMeta: DIMENSION_META[item.dimension] || DIMENSION_META.general,
    difficultyMeta: DIFFICULTY_META[item.difficulty] || DIFFICULTY_META[1]
  };
});

export const CONCEPT_BY_ID = new Map(MATH_CATALOG.map((c) => [c.id, c]));

// Backwards compatibility map for v1.x hash URLs (#cos, #dot, #perlinnoise, etc.)
export const LEGACY_ID_MAP = {
  direction: "direction",
  normalized: "normalized",
  magnitude: "magnitude-sqrmagnitude",
  pythagore: "pythagore",
  thales: "thales",
  euclide: "euclide-modulo",
  abs: "abs-sign",
  repeat: "repeat-wrap",
  round: "floor-ceil-round",
  cos: "cos",
  sin: "sin",
  tan: "tan",
  sincos: "sincos-polar",
  acos: "acos",
  asin: "asin",
  atan: "atan-vs-atan2",
  atan2: "atan-vs-atan2",
  deltaangle: "deltaangle",
  lerpangle: "lerpangle-movetowardsangle",
  euler: "euler-gimbal-lock",
  qeuler: "euler-gimbal-lock",
  qangleaxis: "quaternion-angleaxis",
  qlookrotation: "quaternion-lookrotation",
  qslerp: "quaternion-slerp-nlerp",
  quatmult: "quaternion-multiply",
  quatinverse: "quaternion-inverse-fromtorotation",
  coord3d: "spherical-cylindrical",
  project: "project-projectonplane",
  projectonplane: "project-projectonplane",
  reflect: "reflect-rebound",
  alkashi: "ik-alkashi-fabrik",
  transformpoint: "transform-local-world",
  aabb: "aabb-collision",
  rayplane: "ray-plane",
  dot: "dot-product",
  cross: "cross-product",
  matrix: "determinant-2d",
  barycentre: "point-in-triangle-barycentric",
  ballistic: "ballistic-trajectory",
  vectorfield: "boids-flocking",
  lerp: "lerp",
  smoothstep: "smoothstep",
  smoothdamp: "smoothdamp-spring",
  inverselerp: "inverselerp-remap",
  clamp: "clamp",
  pingpong: "pingpong",
  pow: "pow-sqrt-log",
  catmullrom: "catmull-rom-spline",
  perlinnoise: "perlin-noise",
  colortemp: "color-spaces-kelvin",
  gaussian: "gaussian-normal"
};

export function resolveConceptId(rawId) {
  if (!rawId) return null;
  const clean = rawId.toLowerCase().trim();
  if (CONCEPT_BY_ID.has(clean)) return clean;
  if (LEGACY_ID_MAP[clean]) return LEGACY_ID_MAP[clean];
  return null;
}

export function getConceptById(id) {
  const resolved = resolveConceptId(id);
  return resolved ? CONCEPT_BY_ID.get(resolved) : null;
}

export function getNeighbors(id) {
  const item = CONCEPT_BY_ID.get(id);
  if (!item) return { prev: null, next: null };
  return {
    prev: item.order > 0 ? MATH_CATALOG[item.order - 1] : null,
    next: item.order < MATH_CATALOG.length - 1 ? MATH_CATALOG[item.order + 1] : null
  };
}

export { CATEGORIES, DIMENSIONS, DIMENSION_META, DIFFICULTY_META };
