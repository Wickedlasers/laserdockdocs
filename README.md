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
