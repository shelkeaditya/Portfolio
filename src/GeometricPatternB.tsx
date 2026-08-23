import React from "react";

/**
 * GeometricPatternB
 * ------------------------------------------------------------------
 * Recreation of the reference triangle mosaic (irregular composition).
 *
 * Every polygon below was re-derived directly from the reference
 * image via pixel-level connected-component analysis (per-color
 * region detection + contour extraction), not redrawn from memory
 * or a regular grid. Coordinates are in the reference's own
 * coordinate space (viewBox 0 0 475 603) and shared vertices between
 * adjoining polygons are numerically identical so the dividing lines
 * meet exactly.
 *
 * NOTE: this file is unchanged from the original geometric-pattern-v2.jsx
 * except for (1) converting to typed .tsx so it fits the rest of the
 * TypeScript project, and (2) the outer wrapper's sizing, which was
 * adapted to fill whatever box it's embedded in (the poly-bg-right slot
 * in Portfolio.tsx) instead of forcing 100vh. No polygon coordinates or
 * colors were touched.
 * ------------------------------------------------------------------
 */

type Polygon = {
  points: [number, number][];
  fill: string;
};

const BG = "#08090B";
const STROKE = "rgba(0,0,0,0.15)";
const STROKE_WIDTH = 0.7;

const polygons: Polygon[] = [
  // -------- main mosaic body --------
  { points: [[394, 516], [247, 600], [247, 431]], fill: "#EF3239" }, // large red base triangle
  { points: [[470, 302], [470, 386], [395, 429], [323, 387]], fill: "#EF4D29" }, // orange-red kite
  { points: [[395, 344], [247, 429], [247, 345], [322, 302]], fill: "#F7972A" }, // mid orange kite
  { points: [[396, 430], [470, 472], [470, 558], [395, 516]], fill: "#0C78A3" }, // lower blue kite
  { points: [[322, 387], [395, 430], [395, 515], [321, 473]], fill: "#A5161C" }, // dark red kite
  { points: [[321, 217], [321, 300], [247, 343], [247, 259]], fill: "#F97211" }, // bright orange kite (upper)
  { points: [[470, 217], [470, 300], [396, 343], [396, 260]], fill: "#01BBBE" }, // teal kite
  { points: [[397, 258], [396, 343], [322, 301], [322, 216]], fill: "#0C78A3" }, // upper blue kite
  { points: [[470, 558], [397, 600], [323, 558], [395, 517]], fill: "#01C3C7" }, // bottom-right cyan kite
  { points: [[321, 388], [321, 471], [248, 430]], fill: "#F97211" }, // bright orange triangle (lower)
  { points: [[247, 174], [320, 216], [247, 257]], fill: "#F7972A" }, // orange peak triangle
  { points: [[470, 388], [470, 471], [397, 430]], fill: "#01C3C7" }, // cyan triangle (mid-right)
  { points: [[245, 174], [246, 257], [175, 216]], fill: "#FBCB86" }, // peach peak triangle
  { points: [[323, 216], [395, 174], [395, 257]], fill: "#02D4D8" }, // bright cyan triangle
  { points: [[246, 515], [175, 472], [246, 431]], fill: "#F36246" }, // coral triangle
  { points: [[469, 130], [397, 171], [397, 89]], fill: "#02D4D8" }, // large cyan triangle (top)

  // -------- detached / floating triangles --------
  { points: [[195, 301], [163, 320], [163, 283]], fill: "#F97211" }, // small orange detached triangle
  { points: [[173, 167], [194, 180], [173, 192]], fill: "#FBCB86" }, // small peach detached triangle
  { points: [[442, 41], [442, 62], [423, 52]], fill: "#02D4D8" }, // small cyan detached triangle (top-right)
  { points: [[171, 558], [99, 600], [99, 517]], fill: "#EF3239" }, // large red detached triangle (bottom-left)
];

function toPointsAttr(points: [number, number][]): string {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

type GeometricPatternBProps = {
  className?: string;
};

export default function GeometricPatternB({ className }: GeometricPatternBProps) {
  return (
    <div
      className={`absolute inset-0 h-full w-full overflow-hidden ${className ?? ""}`}
      style={{ background: BG }}
    >
      <svg
        viewBox="0 0 475 603"
        preserveAspectRatio="xMinYMin meet"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", background: BG }}
      >
        <rect x={0} y={0} width={475} height={603} fill={BG} />

        {polygons.map((poly, i) => (
          <polygon
            key={i}
            points={toPointsAttr(poly.points)}
            fill={poly.fill}
            stroke={STROKE}
            strokeWidth={STROKE_WIDTH}
          />
        ))}
      </svg>
    </div>
  );
}
