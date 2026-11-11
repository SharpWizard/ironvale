# Builds dist/Ironvale.exe: a single portable Windows program with the whole game inside.
# Needs only Python (with Pillow) and the C# compiler that ships with Windows. Run:  python tools/exe/make_exe.py
import os, subprocess, sys, zipfile, hashlib
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
DIST = os.path.join(ROOT, 'dist'); os.makedirs(DIST, exist_ok=True)
WORK = os.path.join(DIST, '_build'); os.makedirs(WORK, exist_ok=True)

# ---------------- icon: gold shield with a castle tower on dark wood ----------------
def make_icon():
    S = 1024
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # rounded wooden tile with a brass rim
    d.rounded_rectangle([24, 24, S - 24, S - 24], radius=190, fill=(138, 106, 47, 255))
    d.rounded_rectangle([52, 52, S - 52, S - 52], radius=165, fill=(46, 31, 19, 255))
    glow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([160, 90, S - 160, S - 330], fill=(120, 80, 40, 150))
    img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(110)))
    d = ImageDraw.Draw(img)
    # shield
    def shield(inset, col):
        l, r, t, b = 212 + inset, S - 212 - inset, 170 + inset, S - 150 - inset * 1.5
        mid = S / 2
        d.polygon([(l, t), (r, t), (r, t + (b - t) * 0.5), (mid + (r - mid) * 0.62, t + (b - t) * 0.8), (mid, b), (mid - (mid - l) * 0.62, t + (b - t) * 0.8), (l, t + (b - t) * 0.5)], fill=col)
    shield(0, (255, 226, 150, 255)); shield(22, (201, 143, 30, 255)); shield(48, (30, 58, 96, 255))
    # castle tower
    g = (243, 200, 90, 255)
    cx = S // 2
    d.rectangle([cx - 105, 420, cx + 105, 700], fill=g)
    d.rectangle([cx - 140, 372, cx + 140, 432], fill=g)
    for k in range(4):
        x0 = cx - 140 + k * 76
        d.rectangle([x0, 318, x0 + 52, 380], fill=g)
    d.rectangle([cx - 36, 590, cx + 36, 700], fill=(30, 58, 96, 255)); d.ellipse([cx - 36, 554, cx + 36, 626], fill=(30, 58, 96, 255))
    d.rectangle([cx - 14, 462, cx + 14, 530], fill=(30, 58, 96, 255))
    # soft top highlight
    hi = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(hi).rounded_rectangle([52, 52, S - 52, 400], radius=165, fill=(255, 235, 190, 26))
    img = Image.alpha_composite(img, hi)
    ico = os.path.join(WORK, 'ironvale.ico')
    img.resize((256, 256), Image.LANCZOS).save(ico, sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    img.resize((128, 128), Image.LANCZOS).save(os.path.join(ROOT, 'lib', 'icon.png'))
    img.resize((256, 256), Image.LANCZOS).save(os.path.join(DIST, 'icon-preview.png'))
    return ico

# ---------------- pack the game ----------------
def make_zip():
    z = os.path.join(WORK, 'game.zip'); h = hashlib.sha1()
    files = [('ironvale.html', os.path.join(ROOT, 'ironvale.html'))]
    for folder in ('lib', 'models'):
        for n in sorted(os.listdir(os.path.join(ROOT, folder))):
            files.append((folder + '/' + n, os.path.join(ROOT, folder, n)))
    with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for arc, path in files:
            data = open(path, 'rb').read(); h.update(arc.encode()); h.update(data); zf.writestr(arc, data)
    open(os.path.join(WORK, 'stamp.txt'), 'w').write(h.hexdigest()[:10])
    return z, len(files)

def main():
    ico = make_icon(); z, n = make_zip()
    csc = r'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'
    if not os.path.exists(csc): sys.exit('C# compiler not found: ' + csc)
    out = os.path.join(DIST, 'Ironvale.exe')
    cmd = [csc, '/nologo', '/target:winexe', '/optimize+', '/platform:anycpu', '/out:' + out, '/win32icon:' + ico,
           '/resource:' + z + ',game.zip', '/resource:' + os.path.join(WORK, 'stamp.txt') + ',stamp.txt',
           '/r:System.IO.Compression.dll', '/r:System.IO.Compression.FileSystem.dll', '/r:System.Windows.Forms.dll', os.path.join(HERE, 'Launcher.cs')]
    r = subprocess.run(cmd, capture_output=True, text=True)
    print(r.stdout.strip() or 'compiled', r.stderr.strip())
    if r.returncode: sys.exit(r.returncode)
    print('%s  (%.1f MB, %d game files inside)' % (out, os.path.getsize(out) / 1048576, n))

main()
