#!/usr/bin/env node
// Generates GlobeMark.tsx for the member badge: `pnpm render-globe-mark`.
//
// A small vector globe for the member badge (22-28px), in the colour scheme
// of the join page's hero globe as it renders on screen (Questura
// features/Payments/components/JoinHeroVisual.tsx and
// styles/global/membership.css: the photo darkened over #031522-#041a29 with
// a teal glow): night-dark navy ocean, slate land, soft cloud.
//
// Natural Earth 1:110m land (world-atlas) in an orthographic view of North
// America, projected with d3-geo into a 64-unit viewBox; islands too small
// to read are dropped and outlines simplified. Clouds are traced (d3-contour)
// from the same domain-warped noise atlantic-4's globe uses, so they swirl
// like weather rather than sit as blobs. Lighting, sheen and atmosphere are
// gradients, so the whole mark is a few KB and sharp at any size.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { geoOrthographic, geoPath } from "d3-geo";
import { contours } from "d3-contour";
import { feature } from "topojson-client";

const LON0 = -92, LAT0 = 28;     // North America, as on the join page
const MIN_AREA = 1.2;            // viewBox units^2; smaller islands are dropped
const TOLERANCE = 0.35;          // outline simplification, viewBox units
const CLOUD_GRID = 128;          // cloud field samples across the 64 units
// Cloud cover as quantiles of the field: the top 20% is cloud, with
// brighter cores in the top 10% and 4%. More hides the continents at 22px.
const CLOUD_COVER = [0.8, 0.9, 0.96];
// Every variant whose member badge shows the globe.
const VARIANTS = ["atlantic-100", "atlantic-150", "globe-badge"];
const outFor = (v) => join(import.meta.dirname, "..", "src", "navbars", v, "shared", "components", "icons", "GlobeMark.tsx");

const modules = join(import.meta.dirname, "..", "node_modules");
const topo = JSON.parse(readFileSync(join(modules, "world-atlas", "land-110m.json"), "utf8"));
const land = feature(topo, topo.objects.land);

const projection = geoOrthographic().rotate([-LON0, -LAT0]).scale(32).translate([32, 32]).clipAngle(90).precision(0.2);
const area = geoPath(projection);

// --- Outline helpers: Douglas-Peucker, and rings to path data.
const simplify = (ring, tol) => {
  // Contour rings repeat their first point at the end; with both ends equal
  // there is no baseline to measure from, so drop the duplicate first.
  const [fx, fy] = ring[0], [lx, ly] = ring[ring.length - 1];
  const pts = fx === lx && fy === ly ? ring.slice(0, -1) : ring;
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    let far = -1, dist = 0;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i];
      const dd = Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / len;
      if (dd > dist) { dist = dd; far = i; }
    }
    if (dist > tol) { keep[far] = 1; stack.push([a, far], [far, b]); }
  }
  return pts.filter((_, i) => keep[i]);
};
const f = (n) => String(Math.round(n * 10) / 10);
const toPath = (rings) =>
  rings
    .map((r) => simplify(r, TOLERANCE))
    .filter((r) => r.length >= 3)
    .map((r) => "M" + r.map(([x, y]) => `${f(x)} ${f(y)}`).join("L") + "Z")
    .join("");

// --- Land: split into single polygons so each can be kept or dropped, then
// drawn through a context that collects the projected rings.
const polygons = land.features.flatMap((ft) =>
  ft.geometry.type === "MultiPolygon"
    ? ft.geometry.coordinates.map((coordinates) => ({ type: "Polygon", coordinates }))
    : [ft.geometry],
);
const kept = polygons.filter((p) => area.area(p) >= MIN_AREA);
const landRings = [];
const draw = geoPath(projection, {
  moveTo(x, y) { landRings.push([[x, y]]); },
  lineTo(x, y) { landRings.at(-1).push([x, y]); },
  closePath() {},
  arc() {},
});
for (const p of kept) draw(p);
const landD = toPath(landRings);

// --- Clouds: the noise field on the visible hemisphere, contoured.
const hash3 = (x, y, z) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1440662683);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};
const vnoise = (x, y, z) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const l = (a, b, t) => a + (b - a) * t;
  return l(
    l(l(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u), l(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u), v),
    l(l(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u), l(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u), v),
    w,
  );
};
const fbm = (x, y, z, oct) => {
  let s = 0, a = 0.5, fr = 1, n = 0;
  for (let i = 0; i < oct; i++) {
    s += a * vnoise(x * fr + i * 17.13, y * fr - i * 7.7, z * fr + i * 3.1);
    n += a; a *= 0.5; fr *= 2.03;
  }
  return s / n;
};
const cloudAt = (lon, lat) => {
  const lr = (lon * Math.PI) / 180, pr = (lat * Math.PI) / 180;
  const p = [Math.cos(pr) * Math.cos(lr), Math.cos(pr) * Math.sin(lr), Math.sin(pr)];
  const q = [p[0] * 3.1, p[1] * 3.1, p[2] * 6.5];                 // stretched east-west
  const wx = fbm(q[0] * 0.8 + 5.2, q[1] * 0.8 + 1.3, q[2] * 0.8, 4) - 0.5;
  const wy = fbm(q[0] * 0.8 - 2.1, q[1] * 0.8 + 7.7, q[2] * 0.8, 4) - 0.5;
  const c = fbm(q[0] + wx * 2.2, q[1] + wy * 2.2, q[2] + (wx - wy) * 1.2, 6);
  const a = Math.abs(lat);
  const band = 0.09 * Math.exp(-((a - 50) ** 2) / 120) + 0.05 * Math.exp(-((lat - 6) ** 2) / 40) - 0.07 * Math.exp(-((a - 24) ** 2) / 60);
  return c + band;
};
const N = CLOUD_GRID, step = 64 / N;
const field = new Float64Array(N * N);
for (let j = 0; j < N; j++) {
  for (let i = 0; i < N; i++) {
    const x = (i + 0.5) * step, y = (j + 0.5) * step;
    const r = Math.hypot(x - 32, y - 32) / 32;
    if (r >= 0.985) continue;
    const ll = projection.invert([x, y]);
    field[j * N + i] = ll ? cloudAt(ll[0], ll[1]) : 0;
  }
}
const onDisc = Array.from(field).filter((v) => v > 0).sort((a, b) => a - b);
const levels = CLOUD_COVER.map((q) => onDisc[Math.floor(q * (onDisc.length - 1))]);
const cloudDs = contours().size([N, N]).thresholds(levels)(Array.from(field)).map((mp) =>
  toPath(mp.coordinates.flat().map((ring) => ring.map(([x, y]) => [x * step, y * step]))),
);

const tsx = `// Generated by scripts/render-globe-mark.mjs (\`pnpm render-globe-mark\`);
// edit that and re-run it, not this.
import { useId } from "react";

interface GlobeMarkProps {
  className?: string;
}

/**
 * A small vector globe in the join page's hero-globe colours: North America,
 * night-dark navy ocean, slate land, swirling cloud, a sheen on the lit side
 * and a soft atmosphere at the rim. Gradient ids are per instance; the
 * navbar renders desktop and mobile copies at once, and a shared id would
 * resolve to whichever copy is hidden.
 */
export default function GlobeMark({ className = "" }: GlobeMarkProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const u = (name: string) => \`url(#\${id}-\${name})\`;

  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <defs>
        <radialGradient id={\`\${id}-ocean\`} cx="36%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#2F4D7E" />
          <stop offset="40%" stopColor="#16305A" />
          <stop offset="75%" stopColor="#0A1D3A" />
          <stop offset="100%" stopColor="#04101E" />
        </radialGradient>
        <radialGradient id={\`\${id}-land\`} cx="36%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#7A7B7F" />
          <stop offset="40%" stopColor="#575D62" />
          <stop offset="75%" stopColor="#35444C" />
          <stop offset="100%" stopColor="#1C2A32" />
        </radialGradient>
        <radialGradient id={\`\${id}-shade\`} cx="34%" cy="28%" r="80%">
          <stop offset="60%" stopColor="#02080F" stopOpacity="0" />
          <stop offset="100%" stopColor="#02080F" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id={\`\${id}-sheen\`} cx="30%" cy="24%" r="46%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.36" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={\`\${id}-atmo\`} cx="50%" cy="50%" r="50%">
          <stop offset="84%" stopColor="#4FA3D6" stopOpacity="0" />
          <stop offset="96%" stopColor="#4FA3D6" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#4FA3D6" stopOpacity="0.12" />
        </radialGradient>
        <filter id={\`\${id}-soft\`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.45" />
        </filter>
        <filter id={\`\${id}-glint\`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
      <circle cx="32" cy="32" r="32" fill={u("ocean")} />
      <path fill={u("land")} d="${landD}" />
      <g fill="#E4EAF0" filter={u("soft")}>
${cloudDs.map((d, k) => `        <path opacity="${[0.26, 0.3, 0.36][k]}" d="${d}" />`).join("\n")}
      </g>
      <circle cx="32" cy="32" r="32" fill={u("shade")} />
      <circle cx="32" cy="32" r="32" fill={u("sheen")} />
      <ellipse cx="21" cy="17" rx="5" ry="3" transform="rotate(-32 21 17)" fill="#FFFFFF" opacity="0.5" filter={u("glint")} />
      <circle cx="32" cy="32" r="32" fill={u("atmo")} />
    </svg>
  );
}
`;
for (const v of VARIANTS) writeFileSync(outFor(v), tsx);
// The drop-in copy for Questura (handoffs/globe-member-badge): the same file
// marked as a client component, since it calls useId.
writeFileSync(
  join(import.meta.dirname, "..", "handoffs", "globe-member-badge", "GlobeMark.tsx"),
  `"use client";\n\n${tsx.replace(
    /^\/\/ Generated by .*\n\/\/ edit that and re-run it, not this\.\n/,
    "// Generated in the navbar lab (alanmalpartida/questura-navbar-lab) by\n" +
      "// scripts/render-globe-mark.mjs. Regenerate it there and copy it over;\n" +
      "// don't hand-edit the paths here.\n",
  )}`,
);
console.log(
  `Wrote GlobeMark.tsx to ${VARIANTS.join(", ")}: ${kept.length} land polygons (${(landD.length / 1024).toFixed(1)} KB), ` +
    `clouds ${cloudDs.map((d) => (d.length / 1024).toFixed(1)).join("/")} KB`,
);
