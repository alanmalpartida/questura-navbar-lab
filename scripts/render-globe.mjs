#!/usr/bin/env node
// Renders atlantic-4's globe: `pnpm render-globe`.
//
// Paints an illustrated Earth (Natural Earth coastlines from world-atlas,
// procedural terrain, relief, clouds and atmosphere) in headless Chromium,
// and writes it next to the component as globe.webp plus a generated
// Globe.tsx that knows its aspect ratio. Needs Playwright with Chromium
// (`npx playwright install chromium` if it isn't already on the machine);
// it is only used here, never by the site.
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { readFileSync, realpathSync, writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const OUT_DIR = join(import.meta.dirname, "..", "src", "navbars", "atlantic-4", "shared", "components");
const HEIGHT = 480; // px; 3x the largest size the navbar shows it at

function loadPlaywright() {
  try {
    return require("playwright");
  } catch {
    const globalRoot = execSync("npm root -g").toString().trim();
    return createRequire(join(globalRoot, "noop.js"))("playwright");
  }
}

// The UMD bundles, found through node_modules (pnpm keeps d3-array, a
// dependency of d3-geo, beside d3-geo's real path).
const modules = join(import.meta.dirname, "..", "node_modules");
const d3GeoDir = realpathSync(join(modules, "d3-geo"));
const bundles = [
  join(d3GeoDir, "..", "d3-array", "dist", "d3-array.min.js"),
  join(d3GeoDir, "dist", "d3-geo.min.js"),
  join(modules, "topojson-client", "dist", "topojson-client.min.js"),
];
const topo = JSON.parse(readFileSync(join(modules, "world-atlas", "land-50m.json"), "utf8"));

// Everything below runs in the page. It is self-contained apart from the
// d3 / topojson globals loaded above.
function paint({ topo, height }) {
  const LON0 = -28, LAT0 = 22;           // view centre
  const HALF_W = 1.36;                   // canvas half-width, in globe radii
  const HALO = 0.045;                    // atmosphere beyond the disc, in radii
  const SCALE = 2;                       // render at 2x, then downscale
  const TW = 4096, TH = 2048;            // equirectangular texture size

  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const scale = (a, k) => [a[0] * k, a[1] * k, a[2] * k];

  // --- Noise: 3D value noise sampled on the unit sphere, so it has no seams.
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
    let s = 0, a = 0.5, f = 1, n = 0;
    for (let i = 0; i < oct; i++) {
      s += a * vnoise(x * f + i * 17.13, y * f - i * 7.7, z * f + i * 3.1);
      n += a; a *= 0.5; f *= 2.03;
    }
    return s / n;
  };

  // --- Equirectangular textures: land mask, its blur (for shallows and
  // coastal fringes) and mountain ranges (blurred into a relief field).
  const canvas = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const equi = (lon, lat) => [((lon + 180) / 360) * TW, ((90 - lat) / 180) * TH];
  const fillPolys = (ctx, polys) => {
    ctx.beginPath();
    for (const poly of polys) {
      poly.forEach(([lo, la], i) => { const [x, y] = equi(lo, la); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.closePath();
    }
    ctx.fill();
  };
  const channel = (c) => {
    const d = c.getContext("2d").getImageData(0, 0, TW, TH).data;
    const out = new Float32Array(TW * TH);
    for (let i = 0; i < out.length; i++) out[i] = d[i * 4] / 255;
    return out;
  };
  const blurred = (src, px) => {
    const c = canvas(TW, TH), x = c.getContext("2d", { willReadFrequently: true });
    x.fillStyle = "#000"; x.fillRect(0, 0, TW, TH);
    x.filter = `blur(${px}px)`; x.drawImage(src, 0, 0);
    return c;
  };

  const landC = canvas(TW, TH);
  {
    const x = landC.getContext("2d", { willReadFrequently: true });
    x.fillStyle = "#000"; x.fillRect(0, 0, TW, TH);
    const proj = d3.geoEquirectangular().scale(TW / (2 * Math.PI)).translate([TW / 2, TH / 2]).precision(0.1);
    x.fillStyle = "#fff"; x.beginPath(); d3.geoPath(proj, x)(topojson.feature(topo, topo.objects.land)); x.fill();
    // Natural Earth's land fills the Great Lakes; cut them back out.
    x.fillStyle = "#000";
    fillPolys(x, [
      [[-92.1,46.7],[-90,46.6],[-88,46.9],[-86.5,46.5],[-84.6,46.5],[-84.8,47.3],[-86,48.3],[-88.5,48.4],[-89.6,48]],
      [[-87.8,41.7],[-86.8,41.8],[-86.2,43.5],[-86.3,45],[-85,45.8],[-84.7,45.8],[-87,46],[-88,45],[-87.8,43.5]],
      [[-84.7,45.9],[-83.5,45.8],[-82.2,43.3],[-81.7,44.8],[-80.2,44.6],[-80.8,45.9],[-83.5,46.2]],
      [[-83.4,41.8],[-81.5,41.7],[-79,42.8],[-80.2,42.8],[-82.5,42.5]],
      [[-79.8,43.3],[-76.2,43.5],[-76.3,44.2],[-79.2,43.8]],
    ]);
  }
  const mountC = canvas(TW, TH);
  {
    const x = mountC.getContext("2d", { willReadFrequently: true });
    x.fillStyle = "#000"; x.fillRect(0, 0, TW, TH);
    x.fillStyle = "#fff";
    fillPolys(x, [
      [[-150,63],[-140,62],[-128,62],[-114,50],[-105,41],[-104,33],[-108,31],[-113,36],[-117,44],[-124,52],[-135,58]],
      [[-122.5,48],[-120,48],[-118.5,40],[-118,36],[-120.5,38]],
      [[-87,34],[-84,33.5],[-78,38],[-72,43],[-69,46],[-72,46],[-77,42],[-82,38.5]],
      [[-103,24],[-100,26],[-105,31],[-108,29]],
      [[-79,7],[-74,8],[-72,2],[-76,-3],[-73,-12],[-67,-17],[-67,-24],[-69,-33],[-70,-42],[-71,-50],[-74,-50],[-73,-40],[-71.5,-30],[-70.5,-22],[-71.5,-17],[-76,-12],[-79,-5],[-80,0]],
      [[-46,-20],[-42,-19],[-43,-23],[-47,-23]],
      [[5.5,44],[10,45.8],[16,46.3],[15,47.8],[10,47.5],[6,46.5]],
      [[-2,42.5],[3,42.3],[2,43],[-1,43.2]],
      [[-9.5,30],[-2,33],[9,35.5],[10,36.5],[3,35],[-6,33.5],[-9.5,31.5]],
      [[5.5,59],[8,62],[14,66],[18,69],[20,68.5],[15,64],[9,60],[7,58.5]],
      [[38,44],[49,41],[49,42.5],[40,44.8]],
      [[44,38],[58,27],[60,30],[48,38]],
      [[30,37],[42,38],[43,40],[32,39]],
      [[36,6],[40,5],[43,9],[40,14],[37,13]],
      [[28,-30],[31,-28],[30,-26],[27,-29]],
      [[70,38],[80,35],[92,28],[88,30],[76,37]],
    ]);
  }
  const land = channel(landC);
  const coastNear = channel(blurred(landC, 10));   // ~1 deg falloff
  const coastFar = channel(blurred(landC, 34));    // ~3 deg falloff
  const mount = channel(blurred(mountC, 12));

  const sample = (tex, lon, lat) => {
    const u = ((lon + 180) / 360) * TW - 0.5, v = ((90 - lat) / 180) * TH - 0.5;
    const x0 = Math.floor(u), y0 = Math.floor(v), fx = u - x0, fy = v - y0;
    const X0 = ((x0 % TW) + TW) % TW, X1 = (X0 + 1) % TW;
    const Y0 = clamp(y0, 0, TH - 1), Y1 = clamp(y0 + 1, 0, TH - 1);
    const a = tex[Y0 * TW + X0], b = tex[Y0 * TW + X1], c = tex[Y1 * TW + X0], d = tex[Y1 * TW + X1];
    return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
  };

  // --- Palette. The ocean is the Subscribe button's blue (#3B5BDB).
  const C = {
    deep: rgb("#2C43B0"), ocean: rgb("#3B5BDB"), shelf: rgb("#5B78E4"), shallow: rgb("#86A0EE"),
    seaice: rgb("#E4ECF9"), ice: rgb("#F5F8FD"), iceShade: rgb("#D3DDF0"),
    grass: rgb("#8FC49F"), meadow: rgb("#A6CF9A"), forest: rgb("#4F8F66"), jungle: rgb("#3F8158"),
    boreal: rgb("#3F7458"), tundra: rgb("#A7BFA2"), savanna: rgb("#C8C98A"), steppe: rgb("#CFC795"),
    sand: rgb("#E7D39C"), dune: rgb("#DDBF83"), rock: rgb("#A8977A"), snow: rgb("#F4F6FA"),
    cloud: rgb("#FFFFFF"), cloudShade: rgb("#DCE3F6"), atmo: rgb("#A9BDF7"),
  };
  // Biome boxes (lon0, lon1, lat0, lat1). Each fades in over a few degrees
  // of noise-jittered coordinates, so no edge comes out straight; earlier
  // entries win where boxes overlap.
  const BIOMES = [
    ["sand",    -17, 32, 17, 31], ["sand", 34, 60, 15, 31], ["sand", 13, 24, -28, -19],
    ["sand",   -117, -106, 29, 37], ["sand", -71, -69, -27, -18],
    ["steppe",  -72, -63, -52, -37], ["steppe", 44, 70, 38, 50], ["steppe", -110, -97, 34, 49],
    ["savanna", -17, 40, 8, 17], ["savanna", 28, 42, -12, 8], ["savanna", 14, 36, -20, -8],
    ["savanna", -56, -40, -22, -5], ["savanna", -106, -97, 19, 28], ["savanna", 22, 32, -34, -24],
    ["jungle",  -79, -48, -12, 5], ["jungle", 9, 30, -5, 5], ["jungle", -13, 9, 4, 8],
    ["forest",  -92, -77, 7, 18], ["forest", -95, -70, 30, 46], ["forest", 5, 40, 44, 56],
    ["meadow",  -10, 40, 36, 44], ["meadow", -63, -48, -38, -22],
  ];
  const biome = (lon, lat, p) => {
    const j1 = (fbm(p[0] * 7 + 3, p[1] * 7, p[2] * 7, 5) - 0.5) * 18;
    const j2 = (fbm(p[0] * 7, p[1] * 7 + 7, p[2] * 7, 5) - 0.5) * 12;
    const lo = lon + j1, la = lat + j2;
    if (lon > -74 && lon < -11 && lat > 59.5) {
      const inland = sample(coastNear, lon, lat);          // Greenland: ice sheet, green fringe
      return mix(C.tundra, C.ice, smooth(0.72, 0.9, inland));
    }
    let col = C.grass;
    for (let k = BIOMES.length - 1; k >= 0; k--) {
      const [name, a, b, c, d] = BIOMES[k];
      const inside = Math.min(lo - a, b - lo, la - c, d - la);   // degrees from the nearest edge
      col = mix(col, C[name], smooth(-3.5, 3.5, inside));
    }
    // Boreal forest in Canada and Russia, not across the Atlantic side.
    const borealLon = 1 - smooth(-56, -48, lo) * (1 - smooth(16, 26, lo));
    col = mix(col, C.boreal, smooth(49, 54, la) * borealLon * 0.9);
    col = mix(col, C.tundra, smooth(61, 65, la));
    col = mix(col, C.snow, smooth(72, 76, la));
    return col;
  };

  // --- Geometry of the output.
  const r = (height / 2 / (1 + HALO)) * SCALE;
  const H = height * SCALE, W = Math.round(HALF_W * r * 2);
  const cx = W / 2, cy = H / 2;
  const L = (() => { const v = [-0.45, -0.52, 0.72]; const n = Math.hypot(...v); return v.map((c) => c / n); })();
  const Hv = (() => { const v = [L[0], L[1], L[2] + 1]; const n = Math.hypot(...v); return v.map((c) => c / n); })();
  const p0 = (LAT0 * Math.PI) / 180, l0 = (LON0 * Math.PI) / 180;

  const N = W * H;
  const inDisc = new Uint8Array(N);
  const base = new Float32Array(N * 3);
  const elev = new Float32Array(N);
  const cloud = new Float32Array(N);
  const water = new Float32Array(N);
  const geo = new Float32Array(N * 2);

  // Pass 1: surface colour, elevation, clouds, per pixel on the disc.
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const x = (px + 0.5 - cx) / r, y = (py + 0.5 - cy) / r;
      const rr = x * x + y * y;
      if (rr > 1.0001) continue;
      const i = py * W + px;
      inDisc[i] = 1;
      const z = Math.sqrt(Math.max(0, 1 - rr));
      const yy = -y;
      const lat = Math.asin(clamp(yy * Math.cos(p0) + z * Math.sin(p0), -1, 1));
      const lonr = l0 + Math.atan2(x, z * Math.cos(p0) - yy * Math.sin(p0));
      const lon = ((((lonr * 180) / Math.PI) + 540) % 360) - 180, latd = (lat * 180) / Math.PI;
      geo[i * 2] = lon; geo[i * 2 + 1] = latd;
      const p = [Math.cos(lat) * Math.cos(lonr), Math.cos(lat) * Math.sin(lonr), Math.sin(lat)];

      const lm = sample(land, lon, latd);
      const m = sample(mount, lon, latd);
      const tex = fbm(p[0] * 22, p[1] * 22, p[2] * 22, 4);

      // Ocean: brand blue, lighter over the shelves, darker in the deeps.
      const near = sample(coastNear, lon, latd), far = sample(coastFar, lon, latd);
      let sea = mix(C.deep, C.ocean, smooth(0.0, 0.25, far) * 0.7 + fbm(p[0] * 6, p[1] * 6, p[2] * 6, 3) * 0.3);
      sea = mix(sea, C.shelf, smooth(0.08, 0.35, far) * 0.8);
      sea = mix(sea, C.shallow, smooth(0.2, 0.55, near) * 0.75);
      if (latd > 76) sea = mix(sea, C.seaice, smooth(0.45, 0.62, fbm(p[0] * 9, p[1] * 9, p[2] * 9, 4) + (latd - 76) * 0.02));

      // Land: biome, mountains with snowy peaks, texture.
      let ground = biome(lon, latd, p);
      const peak = m * (0.55 + 0.9 * fbm(p[0] * 14, p[1] * 14, p[2] * 14, 5));
      ground = mix(ground, C.rock, smooth(0.2, 0.75, peak) * 0.85);
      if (Math.abs(latd) > 36 || peak > 1.05) ground = mix(ground, C.snow, smooth(0.95, 1.25, peak) * 0.9);
      ground = scale(ground, 0.93 + tex * 0.14);

      const col = mix(sea, ground, lm);
      base[i * 3] = col[0]; base[i * 3 + 1] = col[1]; base[i * 3 + 2] = col[2];
      water[i] = 1 - lm;
      elev[i] = lm * (peak * 0.8 + 0.07 * fbm(p[0] * 30, p[1] * 30, p[2] * 30, 4));

      // Clouds: domain-warped noise, stretched east-west, heavier in the
      // storm tracks and along the equator, thinnest in the subtropics.
      const q = [p[0] * 3.1, p[1] * 3.1, p[2] * 6.5];
      const wx = fbm(q[0] * 0.8 + 5.2, q[1] * 0.8 + 1.3, q[2] * 0.8, 4) - 0.5;
      const wy = fbm(q[0] * 0.8 - 2.1, q[1] * 0.8 + 7.7, q[2] * 0.8, 4) - 0.5;
      const cN = fbm(q[0] + wx * 2.2, q[1] + wy * 2.2, q[2] + (wx - wy) * 1.2, 6)
        + (fbm(q[0] * 4.3, q[1] * 4.3, q[2] * 4.3, 3) - 0.5) * 0.09;   // ragged, wispy edges
      const a = Math.abs(latd);
      const band = 0.09 * Math.exp(-((a - 52) ** 2) / 120) + 0.05 * Math.exp(-((latd - 6) ** 2) / 40) - 0.07 * Math.exp(-((a - 24) ** 2) / 60);
      cloud[i] = smooth(0.56, 0.72, cN + band);
    }
  }

  // Pass 2: light it. Relief from the elevation gradient, cloud shadows
  // offset away from the light, diffuse + ambient, a sun glint on open
  // water, and atmosphere towards the rim.
  const img = new ImageData(W, H);
  const out = img.data;
  const sh = [Math.round(-L[0] * 5 * SCALE), Math.round(-L[1] * 5 * SCALE)];
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const x = (px + 0.5 - cx) / r, y = (py + 0.5 - cy) / r;
      const d = Math.sqrt(x * x + y * y);
      const o = (py * W + px) * 4;
      if (d > 1) {
        // Halo: a thin glow just outside the disc, stronger on the lit side.
        const t = (d - 1) / HALO;
        if (t < 1) {
          const lit = clamp(0.35 + 0.65 * (-(x / d) * L[0] - (y / d) * L[1]) * 1.2);
          out[o] = C.atmo[0]; out[o + 1] = C.atmo[1]; out[o + 2] = C.atmo[2];
          out[o + 3] = 255 * 0.55 * (1 - t) ** 2 * lit;
        }
        continue;
      }
      const i = py * W + px;
      const z = Math.sqrt(Math.max(0, 1 - d * d));
      const n = [x, y, z];
      const diff = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);

      const at = (ix, iy) => (inDisc[iy * W + ix] ? elev[iy * W + ix] : elev[i]);
      const ex = at(px + 1, py) - at(px - 1, py), ey = at(px, py + 1) - at(px, py - 1);
      const relief = clamp(1 + (-ex * L[0] - ey * L[1]) * 9 * z, 0.72, 1.28);

      const sx = px + sh[0], sy = py + sh[1];
      const shadow = sx >= 0 && sy >= 0 && sx < W && sy < H && inDisc[sy * W + sx] ? cloud[sy * W + sx] : 0;

      let c = [base[i * 3], base[i * 3 + 1], base[i * 3 + 2]];
      c = scale(c, relief * (1 - shadow * 0.32));
      const cl = cloud[i];
      const lightK = 0.34 + 0.8 * diff ** 0.85;
      c = scale(c, lightK);
      // Clouds take less of the shading than the ground, so they stay bright.
      const cloudCol = scale(mix(C.cloudShade, C.cloud, clamp(0.2 + diff)), 0.72 + 0.32 * diff);
      c = mix(c, cloudCol, cl * 0.95);
      const spec = Math.max(0, n[0] * Hv[0] + n[1] * Hv[1] + n[2] * Hv[2]) ** 90 * 0.26 * water[i] * (1 - cl);
      c = [c[0] + 255 * spec, c[1] + 255 * spec, c[2] + 255 * spec];
      const fres = (1 - z) ** 2.4;
      c = mix(c, C.atmo, fres * 0.75 * (0.35 + 0.65 * diff));

      const edge = clamp((1 - d) * r + 0.5); // anti-aliased rim
      out[o] = clamp(c[0], 0, 255); out[o + 1] = clamp(c[1], 0, 255); out[o + 2] = clamp(c[2], 0, 255);
      out[o + 3] = 255 * edge;
    }
  }

  const big = canvas(W, H);
  const bx = big.getContext("2d");
  bx.putImageData(img, 0, 0);

  // Pass 3: the decorative clouds around the globe, in globe radii from its
  // centre: round puffs on a flat base, lit from the top left, a lavender
  // underside.
  const CLOUDS = [
    { base: -0.5, puffs: [[-1.24, -0.57, 0.07], [-1.15, -0.64, 0.1], [-1.03, -0.69, 0.125], [-0.92, -0.62, 0.1], [-0.84, -0.56, 0.065]] },
    { base: -0.43, puffs: [[0.8, -0.48, 0.065], [0.9, -0.56, 0.1], [1.02, -0.6, 0.11], [1.13, -0.52, 0.085], [1.21, -0.47, 0.055]] },
    { base: 0.82, puffs: [[0.27, 0.77, 0.065], [0.38, 0.68, 0.11], [0.52, 0.64, 0.125], [0.64, 0.71, 0.1], [0.74, 0.77, 0.07]] },
    { base: 0.48, puffs: [[-1.25, 0.44, 0.045], [-1.17, 0.39, 0.07], [-1.07, 0.42, 0.06], [-1.01, 0.45, 0.04]] },
  ];
  for (const cld of CLOUDS) {
    const layer = canvas(W, H), lx = layer.getContext("2d");
    const X = (u) => cx + u * r, Y = (v) => cy + v * r;
    lx.fillStyle = "#fff";
    lx.beginPath();
    for (const [u, v, rad] of cld.puffs) { lx.moveTo(X(u) + rad * r, Y(v)); lx.arc(X(u), Y(v), rad * r, 0, Math.PI * 2); }
    lx.fill();
    lx.globalCompositeOperation = "destination-out";
    lx.fillRect(0, Y(cld.base), W, H);
    lx.globalCompositeOperation = "source-atop";
    const top = Math.min(...cld.puffs.map(([, v, rad]) => v - rad));
    const g = lx.createLinearGradient(0, Y(top), 0, Y(cld.base));
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.55, "rgba(236,241,252,0.9)");
    g.addColorStop(0.8, "rgba(214,223,248,1)");
    g.addColorStop(1, "rgba(183,192,240,1)");
    lx.fillStyle = g;
    lx.fillRect(0, 0, W, H);
    // A soft highlight on the top-left of each puff.
    for (const [u, v, rad] of cld.puffs) {
      const hg = lx.createRadialGradient(X(u - rad * 0.35), Y(v - rad * 0.45), 0, X(u - rad * 0.35), Y(v - rad * 0.45), rad * r * 0.9);
      hg.addColorStop(0, "rgba(255,255,255,0.95)");
      hg.addColorStop(1, "rgba(255,255,255,0)");
      lx.fillStyle = hg;
      lx.fillRect(0, 0, W, H);
    }
    bx.drawImage(layer, 0, 0);
  }

  // Downscale to the output size.
  const outC = canvas(Math.round(W / SCALE), height);
  const ox = outC.getContext("2d");
  ox.imageSmoothingEnabled = true;
  ox.imageSmoothingQuality = "high";
  ox.drawImage(big, 0, 0, outC.width, outC.height);
  return { webp: outC.toDataURL("image/webp", 0.9), width: outC.width, height: outC.height };
}

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent("<!doctype html><title>globe</title>");
for (const path of bundles) await page.addScriptTag({ path });
const { webp, width, height } = await page.evaluate(paint, { topo, height: HEIGHT });
await browser.close();

writeFileSync(join(OUT_DIR, "globe.webp"), Buffer.from(webp.split(",")[1], "base64"));
writeFileSync(
  join(OUT_DIR, "Globe.tsx"),
  `// Generated by scripts/render-globe.mjs (\`pnpm render-globe\`); edit that
// and re-run it, not this. The globe's disc is centred in the image, so its
// centre is the image's centre; the clouds either side set its width.
import globeUrl from "./globe.webp";

/** Width / height of the image, clouds included. */
export const GLOBE_ASPECT = ${width} / ${height};

interface GlobeProps {
  className?: string;
}

export default function Globe({ className = "" }: GlobeProps) {
  return (
    <img
      src={globeUrl}
      width={${width}}
      height={${height}}
      alt=""
      aria-hidden
      draggable={false}
      decoding="async"
      className={\`block select-none \${className}\`}
    />
  );
}
`,
);
console.log(`Wrote globe.webp (${width}x${height}, ${Math.round((webp.length * 3) / 4 / 1024)} KB) and Globe.tsx`);
