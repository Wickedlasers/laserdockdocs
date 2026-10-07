# laserdockdocs — wiki.laseros.com

**This repo is the site.** The HTML in here is exactly what gets served, at
https://wiki.laseros.com (GitHub Pages) and on the office LAN at http://goldmine.local/.
There is no build step: a push to `main` publishes these files as they are.

The wiki is the **LaserCube User Wiki** for the LaserCube Ultra MK2 and the LaserCube Pro
(the compact Ultra MK2, called "Evo" before launch). The manual lives at
`docs/guides/ultra-mk2-pro-manual/`. Its old address `docs/guides/ultra-mk2-full-manual-v1.4/`
is a redirect that keeps the `#anchor`, because laseros.com FAQ answers link to it.

## What goes where

Three places, each with one job. The header menus (homepage, manual, 404 page) use these names in this order;
the Academy's own header should match.

| | What it's for | Who it's for | Add something here when |
|---|---|---|---|
| **Academy** (`academy/`) | Learn: a course, start to finish, with a quiz and a certificate | New owners, once | A beginner must know it before their first show |
| **Manual** (`docs/guides/ultra-mk2-pro-manual/`) | Look it up: every setting, port, spec and DMX channel | Owners with a question | It's a fact, setting or spec (the manual is the source of truth) |
| **Tutorials** (homepage `#videos`, all of them on laseros.com/tutorials) | Watch how: short videos, one task each | Owners who'd rather see it done | There's a new how-to video |

Call them by these names everywhere (not "video guides", "free course" or "wiki" for the manual). New material goes
in one place and links to the others, never copied into all three: a lesson links the manual section it is
based on; a video gets a line in the matching manual section if it helps.

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
`images/home/`, the Inter font is self-hosted in `fonts/inter/` (SIL OFL).

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
  own = set(re.findall(r'href="#([a-z0-9-]+)"', manual))
  print('broken links inside the manual:', sorted(own - ids) or 'none')
  EOF
  ```
- **Search** fetches the manual page in the browser and indexes every `h1`-`h4` that has an `id`
  inside `.docs-content`. Keep that wrapper and the heading ids if the manual is restyled.
- **Videos:** the `VIDEOS` list in the script and the two video sections in the HTML use YouTube ids;
  thumbnails are `images/home/videos/<id>.webp` (640x360). Source: laseros.com/tutorials.
- **Hotspots** on the hero photo are `--x`/`--y` percentages of `images/home/ultra-mk2-rear.webp`.
  If that photo is replaced, re-measure them.
- **Shared with the manual:** the manual page carries copies of the theme script in `<head>`, the
  `:root` colour tokens, the `@font-face` block, the SVG sprite (wordmark gradients and icons), the
  header (nav and the narrow-screen menu, with its theme/menu/key-hint JS), the footer, and the search
  dialog's HTML, CSS and JS (including the `VIDEOS` and `STOP` lists). A change to any of these here
  needs the same change there. The two `render()`/`open()` functions differ (the manual indexes its own
  page and its `POPULAR` has another shape), so copy fixes by hand, not by pasting whole functions.
- **Search links:** `/?q=<words>` opens the search with those words (the 404 page's search box uses it).
- `index.html` is written by hand now; don't regenerate it from the old Hugo project on `hugo-source`.

## Manual (`docs/guides/ultra-mk2-pro-manual/index.html`)

One self-contained file like the homepage (same header, colours, font and search), redesigned in
October 2026 from the old Doks page. The manual text is the `<main class="docs-content">` block;
edit it by hand.

- **Keep every heading id**, and the empty `<span id="anchor-NN">` inside headings (old link
  targets from the .odt conversion). The homepage links and search, this page's search and the old
  `ultra-mk2-full-manual-v1.4/` redirect use them. Run the anchor check above after any change.
- **Contents and search are built in the browser** from the `h1`-`h4` headings that have an `id`:
  the contents list shows the `h1`s with their `h2`s (or `h3`s when a chapter has none); `h4`s only
  feed the search and the "you are here" highlight. A new section only needs a heading with an id.
  Keep the heading levels; they also set the search ranking. Sub-headings go one level at a time
  (h1 > h2 > h3 > h4, no jump from h1 to h3), which screen readers and the accessibility check need.
- **Images:** the page shows WebP copies in `Pictures/web/` (about 5 MB in all), named
  `<original name>-<file width>.webp` and made at twice the shown size, at most 2 x 760 px. In the
  `<img>`, `width` and `height` are the size shown on the page (half the file's pixels), e.g.
  `cwebp -q 82 -resize 1200 0 Pictures/x.png -o Pictures/web/x-1200.webp` and
  `<img src="Pictures/web/x-1200.webp" width="600" height="..." alt="" loading="lazy" decoding="async">`.
  Without `width`/`height`, deep links land in the wrong place while lazy images load. The sources
  stay in `Pictures/` (for the 240x320 CubeOS screenshots the lossless originals are the `.bmp`
  files); the Declaration of Conformity thumbnails link to their full-size scans.
- **The search code is a copy of the homepage's** (it indexes this page's own DOM instead of
  fetching it, and closes the dialog when a result on this page is picked). Function and variable
  names match the homepage's, so a fix can be copied across; see "Shared with the manual" above.

## 404 page (`404.html`)

GitHub Pages serves it for any URL that doesn't exist, at that URL, so every link and asset in it is
root-relative (`/fonts/...`). Old `/docs/...` links (the Doks site had `/docs/resources/`,
`/docs/reference/`) jump straight to the manual, keeping any `#anchor`; anything else shows the page,
whose search box sends `/?q=` to the homepage search. Its colour tokens, wordmark and header are copies
of the homepage's (a fourth copy, see "Shared with the manual").

## Academy (`academy/`)

Free courses with a final quiz and a certificate, at /academy/. Plain HTML/CSS/JS, progress kept in the
visitor's browser, no accounts or server. Its header, colour tokens and footer are copies of the homepage's
(see "Shared with the manual" above; the academy is a third copy). How it works, how to add a course and
the content rules: `academy/README.md`.
