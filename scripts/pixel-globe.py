"""Pixel globe generator for atlantic-4. Prints an ASCII preview and writes
the component:

    python3 scripts/pixel-globe.py src/navbars/atlantic-4/shared/components/PixelGlobe.tsx

Orthographic projection of coarse continent outlines, sampled onto a small
grid, shaded with a top-left light, then flattened into one SVG path per colour.
"""
import math, sys

LON0, LAT0 = -42.0, 26.0   # view centre
D = 32                      # globe diameter in pixels
W, H = 44, 36               # canvas (clouds overhang the globe)
CX, CY = 22.0, 18.0         # globe centre on canvas
SS = 4                      # supersampling per axis

LAND = {
 "namerica": [(-168,66),(-162,70),(-156,71),(-140,70),(-128,70),(-115,68),(-95,72),(-85,70),(-80,64),(-94,59),(-92,57),(-82,55),(-79,51),(-77,62),(-70,60),(-64,60),(-56,52),(-60,47),(-66,45),(-70,42),(-74,40),(-76,35),(-81,31),(-80,25),(-82,27),(-84,30),(-89,30),(-94,29),(-97,26),(-97,21),(-94,18),(-90,21),(-87,21),(-88,16),(-84,15),(-83,10),(-79,9),(-77,8),(-80,7),(-83,8),(-86,12),(-92,15),(-96,16),(-105,20),(-106,23),(-112,29),(-114,31),(-117,33),(-121,35),(-124,40),(-124,46),(-125,49),(-130,54),(-135,58),(-140,60),(-148,60),(-152,58),(-158,57),(-165,55),(-162,60),(-166,62)],
 "greenland": [(-73,78),(-60,82),(-35,83),(-20,82),(-18,76),(-22,70),(-32,68),(-42,60),(-48,61),(-52,65),(-55,70),(-60,76)],
 "baffin": [(-80,64),(-62,66),(-68,72),(-80,73),(-90,70)],
 "arctic": [(-120,72),(-80,74),(-65,78),(-80,82),(-110,78)],
 "samerica": [(-77,8),(-72,12),(-64,11),(-60,9),(-52,5),(-50,0),(-44,-2),(-35,-5),(-35,-9),(-39,-14),(-40,-22),(-48,-26),(-53,-33),(-58,-38),(-62,-39),(-65,-42),(-68,-50),(-72,-54),(-75,-50),(-74,-42),(-72,-30),(-71,-18),(-76,-14),(-81,-6),(-80,-1),(-78,2)],
 "africa": [(-17,21),(-13,27),(-10,30),(-6,35),(0,36),(10,37),(11,33),(20,31),(25,32),(32,31),(33,28),(36,22),(42,12),(51,12),(51,10),(45,2),(40,-4),(40,-11),(35,-20),(33,-26),(28,-33),(20,-35),(18,-30),(12,-18),(13,-10),(9,-1),(9,4),(5,6),(-2,5),(-8,4),(-13,8),(-17,14)],
 "eurasia": [(-10,36),(-9,43),(-2,44),(-5,48),(0,49),(4,52),(8,54),(10,57),(5,58),(5,62),(14,68),(20,70),(28,71),(40,67),(44,68),(55,70),(70,73),(80,73),(100,78),(115,74),(140,73),(160,70),(180,68),(180,62),(160,60),(155,55),(140,54),(135,43),(128,35),(122,40),(121,31),(119,24),(110,20),(108,12),(104,10),(100,14),(100,6),(104,1),(98,8),(98,16),(92,22),(88,22),(80,15),(77,8),(73,20),(67,25),(57,25),(56,27),(50,30),(48,29),(51,24),(56,26),(59,22),(52,16),(43,13),(40,17),(35,28),(34,31),(36,36),(28,36),(26,40),(23,36),(21,40),(19,42),(13,45),(12,44),(16,40),(18,40),(15,38),(12,38),(8,44),(3,43),(-1,37),(-6,36)],
 "britain": [(-5,50),(1,51),(2,53),(-2,56),(-3,59),(-6,58),(-5,55),(-3,54),(-5,52)],
 "ireland": [(-10,52),(-6,52),(-6,55),(-8,55),(-10,54)],
 "iceland": [(-24,64),(-14,64),(-14,66),(-22,66.5)],
 "cuba": [(-85,22),(-74,20),(-77,21),(-84,23)],
 "madagascar": [(44,-25),(49,-15),(50,-16),(47,-25)],
}
WATER = {
 "hudson": [(-95,60),(-85,55),(-80,55),(-78,62),(-85,64),(-94,62)],
 "black": [(28,42),(41,41),(39,45),(33,46),(30,46)],
 "caspian": [(47,37),(54,37),(53,45),(47,46)],
 "baltic": [(10,54),(22,55),(24,60),(30,60),(22,61),(20,65),(24,66),(17,62),(16,57),(12,56)],
}

def inside(poly, lon, lat):
    c = False
    n = len(poly)
    for i in range(n):
        x1, y1 = poly[i]; x2, y2 = poly[(i + 1) % n]
        if (y1 > lat) != (y2 > lat):
            if lon < (x2 - x1) * (lat - y1) / (y2 - y1) + x1:
                c = not c
    return c

def is_land(lon, lat):
    if any(inside(p, lon, lat) for p in WATER.values()):
        return False
    return any(inside(p, lon, lat) for p in LAND.values())

def unproject(x, y):
    """x, y in [-1, 1] (y down) -> (lon, lat) or None off the disc."""
    y = -y
    r2 = x * x + y * y
    if r2 > 1: return None
    z = math.sqrt(1 - r2)
    p0, l0 = math.radians(LAT0), math.radians(LON0)
    lat = math.asin(y * math.cos(p0) + z * math.sin(p0))
    lon = l0 + math.atan2(x, z * math.cos(p0) - y * math.sin(p0))
    lon = (math.degrees(lon) + 540) % 360 - 180
    return lon, math.degrees(lat)

R = D / 2
grid = [[None] * W for _ in range(H)]   # None | ("o"|"l", shade)
for j in range(H):
    for i in range(W):
        disc = land = 0
        for sj in range(SS):
            for si in range(SS):
                x = (i + (si + .5) / SS - CX) / R
                y = (j + (sj + .5) / SS - CY) / R
                ll = unproject(x, y)
                if ll is None: continue
                disc += 1
                land += is_land(*ll)
        if disc * 2 < SS * SS: continue
        x = (i + .5 - CX) / R; y = (j + .5 - CY) / R
        z = math.sqrt(max(0, 1 - x * x - y * y))
        light = -0.55 * x - 0.6 * y + 0.58 * z
        grid[j][i] = ["l" if land * 2 >= disc else "o", light, math.hypot(x, y)]

def h(i, j):
    v = (i * 374761393 + j * 668265263) & 0xFFFFFFFF
    v = ((v ^ (v >> 13)) * 1274126177) & 0xFFFFFFFF
    return (v ^ (v >> 16)) / 0xFFFFFFFF

PAL = {
    # Ocean is the Subscribe button's blue (#3B5BDB) with its hover/active
    # shades for the shaded side and a lighter tint for the highlight.
    "ocean_hi": "#6F88E8", "ocean": "#3B5BDB", "ocean_mid": "#3451C7", "ocean_lo": "#2F44B0",
    "coast": "#26399A",
    "land_hi": "#C3E4CE", "land": "#9CCBB2", "land_lo": "#7FB598", "land_dot": "#5E9C73",
    "cloud_hi": "#FFFFFF", "cloud": "#D6E8F8", "cloud_lo": "#B4B8F0",
}
out = [[None] * W for _ in range(H)]
for j in range(H):
    for i in range(W):
        c = grid[j][i]
        if not c: continue
        kind, light, r = c
        if kind == "o":
            # drop shadow: land up-left of this ocean pixel
            nb = [grid[j - 1][i] if j else None, grid[j][i - 1] if i else None]
            if any(n and n[0] == "l" for n in nb):
                out[j][i] = "coast"
            elif r > 0.9 and light < 0.1: out[j][i] = "ocean_lo"
            elif light > 0.78: out[j][i] = "ocean_hi"
            elif light > 0.4: out[j][i] = "ocean"
            else: out[j][i] = "ocean_mid"
        else:
            n = h(i, j)
            if r > 0.9 and light < 0.1: out[j][i] = "land_lo"
            elif n < 0.13: out[j][i] = "land_dot"
            elif n > 0.93 or (light > 0.62 and n > 0.6): out[j][i] = "land_hi"
            else: out[j][i] = "land"

# Clouds: rows of (cols string). '#' white top, '+' body, '-' underside.
CLOUDS = [
    (2, 4, [
        "      ####     ",
        "    ##++++#    ",
        "  ###+++++++#  ",
        "-----------++  ",
    ]),
    (0, 7, ["##  ", "--  "]),
    (35, 12, [
        "  ###   ",
        " #+++## ",
        "#+++++++",
        "--------",
    ]),
    (26, 29, [
        "     ####       ",
        "   ##++++##     ",
        " ##++++++++###  ",
        "#++++++++++++++#",
        "----------------",
    ]),
]
cmap = {"#": "cloud_hi", "+": "cloud", "-": "cloud_lo"}
for x0, y0, rows in CLOUDS:
    for dy, row in enumerate(rows):
        for dx, ch in enumerate(row):
            if ch in cmap and 0 <= x0 + dx < W and 0 <= y0 + dy < H:
                out[y0 + dy][x0 + dx] = cmap[ch]

sym = {"ocean_hi": ":", "ocean": ".", "ocean_mid": ",", "ocean_lo": ";", "coast": "~",
       "land_hi": "o", "land": "O", "land_lo": "0", "land_dot": "@",
       "cloud_hi": "#", "cloud": "+", "cloud_lo": "-"}
for row in out:
    print("".join(sym[c] if c else " " for c in row))

# Trim to used bounds.
xs = [i for j in range(H) for i in range(W) if out[j][i]]
ys = [j for j in range(H) for i in range(W) if out[j][i]]
x0, x1, y0, y1 = min(xs), max(xs) + 1, min(ys), max(ys) + 1

paths = {}
for j in range(y0, y1):
    i = x0
    while i < x1:
        c = out[j][i]
        k = i
        while k < x1 and out[j][k] == c: k += 1
        if c:
            paths.setdefault(c, []).append(f"M{i - x0} {j - y0}h{k - i}v1h-{k - i}z")
        i = k

order = list(PAL)
lines = "\n".join(
    f'      <path fill="{PAL[c]}" d="{"".join(paths[c])}" />' for c in order if c in paths
)
tsx = f'''// Generated by scripts/pixel-globe.py; edit that and re-run it, not this.
// Pixel art: an orthographic view of the Atlantic on a {x1 - x0}x{y1 - y0}
// grid, one path per colour. Crisp edges keep the pixels square at any size;
// size it with the className (height drives width). The disc fills the full
// height, so its centre is the SVG's centre.

/** Width / height of the whole drawing, clouds included. */
export const PIXEL_GLOBE_ASPECT = {x1 - x0} / {y1 - y0};

interface PixelGlobeProps {{
  className?: string;
}}

export default function PixelGlobe({{ className = "" }}: PixelGlobeProps) {{
  return (
    <svg
      viewBox="0 0 {x1 - x0} {y1 - y0}"
      shapeRendering="crispEdges"
      aria-hidden
      className={{`block ${{className}}`}}
    >
{lines}
    </svg>
  );
}}
'''
open(sys.argv[1], "w").write(tsx)
dy = [j for j in range(H) for i in range(W) if grid[j][i]]
print("canvas", x1 - x0, y1 - y0, "disc rows", min(dy) - y0, max(dy) + 1 - y0, file=sys.stderr)
