# laserdockdocs — wiki.laseros.com

**This repo is the site.** The HTML in here is exactly what gets served, at
https://wiki.laseros.com (GitHub Pages) and on the office LAN at http://goldmine.local/.
There is no build step: a push to `main` publishes these files as they are.

The wiki is the **LaserCube User Wiki** for the LaserCube Ultra MK2 and the LaserCube Pro
(the compact Ultra MK2, called "Evo" before launch). The manual lives at
`docs/guides/ultra-mk2-pro-manual/`. Its old address `docs/guides/ultra-mk2-full-manual-v1.4/`
is a redirect that keeps the `#anchor`, because laseros.com FAQ answers link to it.

## Source of truth

**Since October 2026 this GitHub repo is the source of truth.** Edit here (branch, then merge
to `main`). goldmine (`/srv/wiki/site`) is now a copy: pull from GitHub to update it, and don't
`rsync --delete` goldmine over this repo any more, or the edits made here are lost.

```bash
# on goldmine
git -C /srv/wiki/site pull    # or: rsync -a --delete --exclude .git <checkout>/ /srv/wiki/site/
```

## History

Everything before the static conversion was a Hugo (Doks) project that generated this site
from the LaserCube manual's LibreOffice `.odt`. That project is still here on the
**`hugo-source`** branch, and the conversion pipeline is documented in
`wlweb/wiki.laseros.com/HANDOFF.md` in `wlmisc.git`.

Until October 2026 the site was edited on goldmine and rsynced into this repo.

## Homepage (`index.html`)

One self-contained file (HTML, CSS and JS inline), redesigned in October 2026. Images are in
`images/home/`, fonts are self-hosted in `fonts/inter/` and `fonts/jetbrains-mono/` (SIL OFL).

- **It depends on the manual's heading ids.** About 60 links (the port hotspots on the hero photo,
  the chapter index, the beginner videos' "Manual:" links, the popular searches) point to
  `docs/guides/ultra-mk2-pro-manual/#<heading-id>`. Renaming a heading in the manual breaks them
  silently, so run this check before pushing any change to either page:

  ```bash
  python3 - <<'EOF'
  import re
  home = open('index.html', encoding='utf-8').read()
  manual = open('docs/guides/ultra-mk2-pro-manual/index.html', encoding='utf-8').read()
  ids = set(re.findall(r'\bid="?([^" >]+)', manual))
  used = set(re.findall(r'ultra-mk2-pro-manual/#([^"]+)"', home)) | set(re.findall(r'\["([a-z0-9-]+)", "', home))
  print('missing anchors:', sorted(used - ids) or 'none')
  EOF
  ```
- **Search** fetches the manual page in the browser and indexes every `h1`-`h4` that has an `id`
  inside `.docs-content`. Keep that wrapper and the heading ids if the manual is restyled.
- **Videos:** the `VIDEOS` list in the script and the two video sections in the HTML use YouTube ids;
  thumbnails are `images/home/videos/<id>.webp` (640x360). Source: laseros.com/tutorials.
- **Hotspots** on the hero photo are `--x`/`--y` percentages of `images/home/ultra-mk2-rear.webp`.
  If that photo is replaced, re-measure them.
- `index.html` is written by hand now; don't regenerate it from the old Hugo project on `hugo-source`.
