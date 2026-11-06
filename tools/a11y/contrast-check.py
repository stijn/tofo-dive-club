"""Check every text run against the real pixels behind it (WCAG 1.4.6, AAA).
usage: python3 -I textbg.py <prefix> [...]"""
import json, re, sys
from PIL import Image

def lin(c):
    c /= 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def lum(rgb):
    r, g, b = rgb[:3]
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)

def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)

bad_total = 0
for prefix in sys.argv[1:]:
    runs = json.load(open(prefix + '.json'))
    meta = json.load(open(prefix + '-slices.json'))
    img = Image.new('RGB', (meta['W'], meta['total']))
    for i, sl in enumerate(meta['slices']):
        img.paste(Image.open(f'{prefix}-s{i}.png').convert('RGB'), (0, sl['y']))
    W, H = img.size
    px = img.load()
    fails = {}
    for r in runs:
        m = re.match(r'rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)', r['color'])
        if not m:
            continue
        fg = tuple(float(v) for v in m.groups()[:3])
        alpha = float(m.group(4)) if m.group(4) else 1.0
        if alpha == 0:
            continue
        large = r['size'] >= 24 or (r['size'] >= 18.66 and r['weight'] >= 700)
        need = 4.5 if large else 7.0
        x0, y0 = max(0, int(r['x'])), max(0, int(r['y']))
        x1, y1 = min(W - 1, int(r['x'] + r['w'])), min(H - 1, int(r['y'] + r['h']))
        if x1 <= x0 or y1 <= y0:
            continue
        worst = None
        step = max(1, int(min(r['w'], r['h']) / 6))
        for yy in range(y0, y1, step):
            for xx in range(x0, x1, step):
                bg = px[xx, yy]
                eff = tuple(fg[i] * alpha + bg[i] * (1 - alpha) for i in range(3))
                c = ratio(eff, bg)
                if worst is None or c < worst[0]:
                    worst = (c, bg)
        if worst and worst[0] < need:
            key = (r['sel'], r['t'][:28])
            if key not in fails or worst[0] < fails[key][0]:
                fails[key] = (worst[0], need, r['color'], worst[1], int(r['y']))
    bad_total += len(fails)
    print(f'\n=== {prefix.split("/")[-1]}: {len(runs)} text runs, {len(fails)} below AAA')
    for (sel, t), (c, need, col, bg, y) in sorted(fails.items(), key=lambda kv: kv[1][0])[:40]:
        print(f'  {c:5.2f} < {need}  y={y:5d}  {sel:28s} "{t}"  fg {col} bg rgb{bg}')
sys.exit(1 if bad_total else 0)
