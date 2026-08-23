import React from "react";

// ═══════════════════════════════════════════════════════════
// Programmatic recreation of the reference triangle-mosaic mark.
// Every shape below is an explicit polygon (no image/SVG asset is
// used). Coordinates are built on a single consistent triangular
// grid (columns every ~55.5px, rows every 32px) measured against
// the original 507 × 625 reference canvas, so adjacent shapes
// share exact vertices with no gaps or overlaps.
//
// NOTE: this file is unchanged from the original GeometricPattern.tsx
// except for the outer wrapper's sizing classes (see bottom of file),
// which were adapted so the mark fills whatever box it's embedded in
// (the poly-bg-left slot in Portfolio.tsx) instead of forcing
// `min-h-screen`. No polygon coordinates or colors were touched.
// ═══════════════════════════════════════════════════════════

type Point = {
  x: number;
  y: number;
};

type Polygon = {
  points: Point[];
  fill: string;
  stroke?: string;
  strokeWidth?: number;
};

const pt = (x: number, y: number): Point => ({ x, y });

/** Serializes a Point[] into the SVG `points` attribute format. */
function toPointsAttr(points: Point[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

/** Darkens a hex color by `amount` (0–1) — used for each polygon's
 *  hairline edge, so facets read as distinct even when two adjacent
 *  triangles share the exact same fill. */
function darken(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.round(((n >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round((n & 0xff) * (1 - amount)));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

// ── Palette — sampled directly from the reference image ──
const BACKGROUND = "#08090B";
const PALETTE = {
  maroon: "#A4151B",
  red: "#ED3138",
  orangeDeep: "#F77211", // saturated top-peak orange
  orangeBurnt: "#F36B33", // muted mid-column orange
  orange: "#F59629", // main bright orange
  teal: "#01C2C7",
  blue: "#0D77A2",
  peach: "#FBCA84",
} as const;

// Source canvas the coordinates below were measured against.
const CANVAS_W = 507;
const CANVAS_H = 625;

// ── Shared grid ──
// Columns (x): C0..C4 are the main vertical grid lines; the two
// C_FAR* values are only used by the small detached orange chip.
const C0 = 0;
const C1 = 56;
const C2 = 111;
const C3 = 167;
const C4 = 222;
const C_FAR1 = 241;
const C_FAR2 = 259;

// Rows (y): consistent 32px step from the top apex down.
const R0 = 2;
const R1 = 34;
const R2 = 66;
const R3 = 98;
const R4 = 130;
const R5 = 162;
const R6 = 194;
const R7 = 226;
const R8 = 258;
const R9 = 290;

// ── The mosaic, piece by piece ──
// Grouped top-to-bottom, matching how the shapes stack in the reference.
const TRIANGLES: Polygon[] = [
  // Small maroon triangle capping the very top of the mark.
  { points: [pt(C2, R0), pt(C1, R1), pt(C2, R2)], fill: PALETTE.maroon },

  // Saturated orange peak, right of the maroon cap.
  { points: [pt(C2, R0), pt(C2, R2), pt(C3, R1)], fill: PALETTE.orangeDeep },

  // Large red piece, clipped by the left edge of the canvas —
  // shares its top-right vertex with the maroon/orange peak and
  // its upper-left vertex with the maroon cap.
  { points: [pt(C2, R2), pt(C1, R1), pt(C0, R2), pt(C0, R4)], fill: PALETTE.red },

  // Big bright-orange field — the widest piece in the composition.
  { points: [pt(C4, R2), pt(C3, R1), pt(C1, R3), pt(C2, R4)], fill: PALETTE.orange },

  // Small detached orange triangle, floating free to the right.
  { points: [pt(C_FAR2, R2), pt(C_FAR1, 55), pt(C_FAR1 - 1, 78)], fill: PALETTE.orange },

  // Burnt-orange vertical band running down the middle of the mark.
  { points: [pt(C3, R3), pt(C2, R4), pt(C2, R6), pt(C3, R5)], fill: PALETTE.orangeBurnt },

  // Blue parallelogram, middle-left of the composition.
  { points: [pt(C1, R3), pt(C1, R5), pt(C2, R6), pt(C2, R4)], fill: PALETTE.blue },

  // Tiny detached blue triangle, just below-right of the blue field.
  { points: [pt(91, 225), pt(76, 234), pt(90, 244)], fill: PALETTE.blue },

  // Teal triangle touching the left edge, upper-middle height.
  { points: [pt(C0, R4), pt(C1, R5), pt(C1, R3)], fill: PALETTE.teal },

  // Teal triangle pointing right, beside the blue field.
  { points: [pt(C1, R5), pt(C1, R7), pt(C2, R6)], fill: PALETTE.teal },

  // Small detached teal triangle, lower-left, touching the canvas edge.
  { points: [pt(C1, R7), pt(C0, R8), pt(C1, R9)], fill: PALETTE.teal },

  // Orange triangle beside the peach piece, lower portion of the mark.
  { points: [pt(C2, R6), pt(C3, R7), pt(C3, R5)], fill: PALETTE.orange },

  // Light peach triangle — the lightest tone, bottom-right of the mosaic.
  { points: [pt(C3, R5), pt(C3, R7), pt(C4, R6)], fill: PALETTE.peach },
];

type GeometricPatternAProps = {
  /** Extra classes for the outer container. */
  className?: string;
};

/**
 * The triangle mosaic mark, sized to fill whatever container it's
 * placed in (e.g. the fixed-size `.poly-bg-left` corner box in
 * Portfolio.tsx) rather than forcing full-viewport height.
 */
export default function GeometricPatternA({ className }: GeometricPatternAProps) {
  return (
    <div
      className={`absolute inset-0 h-full w-full overflow-hidden ${className ?? ""}`}
      style={{ backgroundColor: BACKGROUND }}
    >
      <svg
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        preserveAspectRatio="xMinYMin meet"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {TRIANGLES.map((polygon, i) => (
          <polygon
            key={i}
            points={toPointsAttr(polygon.points)}
            fill={polygon.fill}
            stroke={polygon.stroke ?? darken(polygon.fill, 0.22)}
            strokeWidth={polygon.strokeWidth ?? 1}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}
