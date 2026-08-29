# laserdockdocs — wiki.laseros.com

**This repo is the site.** The HTML in here is exactly what gets served, at
https://wiki.laseros.com (GitHub Pages) and on the office LAN at http://goldmine.local/.
There is no build step: a push to `main` publishes these files as they are.

## Source of truth

**goldmine** (`/srv/wiki/site`, 192.168.0.106) is where the site is edited. Bring changes
here from there, never the other way round:

```bash
rsync -a --delete --exclude '.git' --exclude 'README.md' --exclude '.github' \
      goldmine:/srv/wiki/site/ .
git add -A && git commit -m "sync from goldmine"
```

## History

Everything before the static conversion was a Hugo (Doks) project that generated this site
from the LaserCube manual's LibreOffice `.odt`. That project is still here on the
**`hugo-source`** branch, and the conversion pipeline is documented in
`wlweb/wiki.laseros.com/HANDOFF.md` in `wlmisc.git`.
