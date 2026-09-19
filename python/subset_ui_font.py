"""Rebuild the initial UI font from the bundled full font (fonttools + brotli)."""

from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / "src/renderer/assets/fonts/noto-sans-sc"
characters = set(chr(point) for point in range(0x20, 0x100))
for folder in (ROOT / "src/renderer", ROOT / "src/autouma"):
    for source in folder.rglob("*"):
        if source.suffix in {".ts", ".tsx", ".css", ".json", ".ejs"}:
            characters.update(source.read_text(encoding="utf-8"))
characters.update((ROOT / "assets/data/umdb.json").read_text(encoding="utf-8"))

font = TTFont(FONTS / "NotoSansSC-variable.woff2")
options = subset.Options()
options.layout_features = ["*"]
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=sorted(ord(character) for character in characters))
subsetter.subset(font)
font.flavor = "woff2"
font.save(FONTS / "NotoSansSC-ui.woff2")
print(f"UI font: {len(font.getBestCmap())} mapped glyphs, weights 100-900")
