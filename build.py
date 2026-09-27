#!/usr/bin/env python3
"""Bundle src/ into one self-contained HTML file: Aldex_SOP_Hub.html.

The output has no local dependencies (screenshots are embedded), so it can be
opened from a shared drive, emailed, or hosted as a single file.
Run:  python3 build.py
"""
import base64
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "Aldex_SOP_Hub.html"


def main():
    html = (SRC / "app.html").read_text(encoding="utf-8")
    content = (SRC / "content.js").read_text(encoding="utf-8")
    app = (SRC / "app.js").read_text(encoding="utf-8")
    snapshot = json.loads((SRC / "live-snapshot.json").read_text(encoding="utf-8"))

    # Embed only the screenshots the content references: ['image-id', t(...)] pairs.
    # (The same pattern is used by `link: ['sopId', t(...)]`; those have no .png and are skipped.)
    images = {}
    for name in sorted(set(re.findall(r"\['([a-z0-9-]+)',\s*t\(", content))):
        path = SRC / "img" / f"{name}.png"
        if path.exists():
            images[name] = "data:image/png;base64," + base64.b64encode(path.read_bytes()).decode("ascii")

    def js(obj):
        # Keep the payload safe inside a <script> tag.
        return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")

    out = (html
           .replace("/*@CONTENT@*/", content)
           .replace("/*@SNAPSHOT@*/", js(snapshot))
           .replace("/*@IMAGES@*/", js(images))
           .replace("/*@APP@*/", app))
    OUT.write_text(out, encoding="utf-8")
    print(f"Wrote {OUT.name}: {OUT.stat().st_size / 1e6:.2f} MB, {len(images)} screenshots embedded")


if __name__ == "__main__":
    main()
