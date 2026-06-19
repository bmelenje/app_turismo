"""
Genera versiones transparentes y livianas de los GIF de avatar para el FAB.
- Recorta el fondo sólido (flood-fill desde los bordes) -> transparente.
- Reduce el tamaño (la burbuja del FAB es ~56px).
Conserva la animación completa.
"""
from PIL import Image
from collections import deque

JOBS = [
    ("public/videos/sahumadora_video.gif", "public/videos/sahumadora_fab.gif", 48),
    ("public/videos/iglesia_video.gif", "public/videos/iglesia_fab.gif", 60),
]
OUT_W = 240  # ancho de salida (suficiente para 56px @3x)


def flood_bg_mask(rgb, tol):
    """Devuelve set de pixeles de fondo conectados a los bordes (magic wand)."""
    w, h = rgb.size
    px = rgb.load()

    # color semilla = promedio de las 4 esquinas
    cs = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    sr = sum(c[0] for c in cs) // 4
    sg = sum(c[1] for c in cs) // 4
    sb = sum(c[2] for c in cs) // 4

    bg = bytearray(w * h)  # 0 = subject, 1 = background
    dq = deque()

    def close(c):
        return abs(c[0] - sr) <= tol and abs(c[1] - sg) <= tol and abs(c[2] - sb) <= tol

    # sembrar todos los bordes que sean color de fondo
    for x in range(w):
        for y in (0, h - 1):
            i = y * w + x
            if not bg[i] and close(px[x, y]):
                bg[i] = 1
                dq.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            i = y * w + x
            if not bg[i] and close(px[x, y]):
                bg[i] = 1
                dq.append((x, y))

    while dq:
        x, y = dq.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h:
                i = ny * w + nx
                if not bg[i] and close(px[nx, ny]):
                    bg[i] = 1
                    dq.append((nx, ny))
    return bg


def process(src, dst, tol):
    im = Image.open(src)
    n = getattr(im, "n_frames", 1)
    w0, h0 = im.size
    out_h = round(OUT_W * h0 / w0)

    frames, durations = [], []
    for f in range(n):
        im.seek(f)
        rgb = im.convert("RGB").resize((OUT_W, out_h), Image.LANCZOS)
        bg = flood_bg_mask(rgb, tol)

        # cuantizar a 255 colores dejando libre el índice 255 para transparencia
        p = rgb.convert("P", palette=Image.ADAPTIVE, colors=255)
        pdata = bytearray(p.tobytes())
        for i, isbg in enumerate(bg):
            if isbg:
                pdata[i] = 255
        p.frombytes(bytes(pdata))
        p.info["transparency"] = 255

        frames.append(p)
        durations.append(im.info.get("duration", 80))

    frames[0].save(
        dst,
        save_all=True,
        append_images=frames[1:],
        loop=0,
        duration=durations,
        disposal=2,
        transparency=255,
        optimize=True,
    )
    pct = round(100 * sum(b for fr in [flood_bg_mask(Image.open(src).convert("RGB").resize((OUT_W, out_h)), tol)] for b in fr) / (OUT_W * out_h))
    print(f"{dst}  ({n} frames, {OUT_W}x{out_h}, ~{pct}% fondo recortado)")


for src, dst, tol in JOBS:
    process(src, dst, tol)
