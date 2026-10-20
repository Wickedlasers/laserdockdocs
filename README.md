# laserdockdocs — wiki.laseros.com

**This repo is the site.** The HTML in here is exactly what gets served, at
https://wiki.laseros.com (GitHub Pages) and on the office LAN at http://goldmine.local/.
There is no build step: a push to `main` publishes these files as they are.

The wiki is the **LaserCube User Wiki** for the LaserCube Ultra MK2 and the LaserCube Pro
(the compact Ultra MK2). The manual lives at
`docs/guides/ultra-mk2-pro-manual/`. Its old address `docs/guides/ultra-mk2-full-manual-v1.4/`
is a redirect that keeps the `#anchor`, because laseros.com FAQ answers link to it.

## What goes where

Three parts, each with one job, named this way and in this order in every header menu (homepage, manual, Academy,
Quick start pages, 404): Quick start · Academy · Manual · Tutorials · Downloads. This README is public too (the whole
repo is published).

| | Its one job | Who it's for | Add something here when |
|---|---|---|---|
| **Quick start** (`start/`) | Get going: five steps from the box to the first projection, one page per model; the printed booklet's QR codes land here; the homepage's "Which LaserCube do you have?" row opens it | New owners, on day one | Never by hand: the pages are built by `academy/tools/start-pages/build.py` (workspace repo); a step changes only when the box or the first-day steps change |
| **Academy** (`academy/`) | Learn: courses, start to finish, with quick checks, a quiz and a certificate; laser safety first | Owners who want to run it well | A course needs it (facts only from the manual, X-Laser's course or the owner) |
| **Manual** (`docs/guides/ultra-mk2-pro-manual/`) | Look it up: every setting, port, spec, DMX channel and fix | Owners with a question | It's a fact, setting or spec (the manual is the source of truth) |
| **Tutorials** (homepage `#videos` and the beginner's guide above it; all of them on laseros.com/tutorials) | Watch how: short videos | Owners who'd rather see it done | There's a new video |

Names: "Quick start" (the only thing on the wiki that says "Start here"), "Academy" or "LaserCube Academy", "Manual",
"Tutorials" (not "Videos" or "Video guides"). The first Academy course is "Laser safety: from setup to your first safe
show" (other courses cite it as "Laser safety, lesson N"); it was called "Start here" until 15 Oct 2026, so its folder is
still `academy/start-here/` (saved progress and links keep working: never rename the folder). The Academy landing, the
Quick start landing and the manual's opening note each say in one line what the part is for and where the other two
are. The homepage layout is the owner's pick (15 Oct 2026: he preferred the old design to a "What do you need?" card
row and one merged video section): keep it. New material goes in one place and links to the others, never copied into
all three.

AI guides (`ai/`): plain Markdown files written for AI chat assistants, served as they are (GitHub Pages sends `.md` as
`text/markdown`). `ai/laseros-beam-creator-guide.md` lets an AI write a Beam Creator project file (`.ldbc`); the manual's
"Making a Beam with AI" section links it and `llms.txt` lists it. Its ids, ranges and defaults were checked against
LaserOS 0.18.1's Beam Creator code (where LaserOS accepts a value that breaks an effect, the guide gives the range that
works) and its examples were loaded and run with that code; when a LaserOS release changes Beam Creator, re-check the
guide the same way before changing it (the test tools and the guide's source are kept outside this public repo).

Developer files (`developers/`): `developers/udp-streaming-protocol.pdf` is LaserDock's UDP DAC Streaming Protocol
Specification for the Ultra MK2 and Pro (document v1.1, 10 October 2026), linked from the manual's "Writing Your Own
Software" section. Since the firmware 2.2 update of the manual it is the copy attached to the firmware v2-2 release
(`WiFiCube_Mk2_UDP_DAC_Streaming_Protocol_Spec_v1-1.pdf`, byte for byte). Keep the file name when a newer version comes
out: replace the file in place, so every link to it gets the new version (the version and date are on its cover).
LaserDock publishes documents only from a firmware release, never from work in progress: take new copies from the
assets of LaserDock's firmware release, not from a branch.

Firmware notes: LaserDock's "What's new" PDF for firmware 2.2 is NOT hosted here: its model-names page uses old
internal model names that the wiki never uses. The manual follows LaserDock's manual v1.6 (firmware 2.2); where the wiki keeps its own wording
on purpose (for example: LaserOS doesn't update the Ultra MK2 or Pro), the list of differences and reasons is kept
outside this public repo.

Compliance files (`compliance/`): `compliance/eu-declaration-of-conformity.pdf` is Laserdock Limited's signed EU
Declaration of Conformity for the LaserCube (declaration 20261013-000, 13 October 2026; it replaces 20250410-000 of
10 April 2025 and adds the Pro 3W/6W and Ultra MK2 6W/10W), byte for byte as signed. The manual's "Declaration of
Conformity" section shows its first page (`Pictures/web/eu-declaration-of-conformity-<date>-440.webp`, made from the PDF
at 150 dpi) linked to it. www.laseros.com serves its own copies of the same file (/wp-content/uploads/2021/12/EU_DoC.pdf
and /live-assets/wp-content/uploads/2020/10/EU_DoC.pdf) and page 4 of /manual-mk2.pdf shows it. A newer declaration:
replace the PDF here in place (same name, so links keep working), make a new thumbnail, update the caption's model list,
and replace the www copies by hand. Not on 20261013-000: the Ultra MK2 5W and the original USB LaserCube.

Product labels: the manual's "Product Labelling and Placement" shows LaserDock's 7.5 ULTRA MK2 label artwork
(2025 print file) and, below it, the Pro's main label (`Pictures/pro-label-6-0-pro.png`,
`Pictures/pro-label-3-0-pro.png`, October 2026). The Pro labels are that same print file with only the model, year
and output values changed, and on the 3W the input line (model names as on declaration 20261013-000; output and input from the manual's
Technical Specifications; year 2026); the changed characters are copied from the same artwork, and every other line and symbol is the
original artwork. When LaserDock's own Pro label file or a clear
photo of a production label turns up, compare it with these and replace them if anything differs (keep the file names).

The header is a hand copy in each page. Before pushing a menu change, check that every copy matches:
`grep -n -A7 'class="nav"\|class="menu-panel"' index.html docs/guides/ultra-mk2-pro-manual/index.html 404.html academy/index.html academy/*/index.html`

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
  inside `.docs-content`. Keep that wrapper and the heading ids if the manual is restyled. Text inside an
  element with `data-no-search` is left out (the Troubleshooting chapter's list of links to its own
  sections, which would otherwise match every symptom search).
- **Videos:** the `VIDEOS` list in the script and the two video sections in the HTML use YouTube ids;
  thumbnails are `images/home/videos/<id>.webp` (640x360, from YouTube's `maxresdefault.jpg`). Source:
  laseros.com/tutorials and the channel's newest uploads (Jarek's beginner's guide and WebApp video aren't on
  laseros.com/tutorials yet).
- **Quick start, Academy and Tutorials in search:** the `PAGES` list (the Quick start pages, the Academy, each course, Tutorials) shows when a search
  word starts one of a page's keys ("acad", "course", "tutorials"), so "dmx" alone stays with the manual; every
  other word must be in the page's title, description, keys or topics ("dmx course", "safety course"). Keys must be
  words the manual doesn't use ("class" would catch laser-class searches), and a word of one or two letters must be
  a whole word, so "ce certificate" stays with the manual. Exception on purpose (15 Oct 2026): the Quick start landing's keys "here getting",
  so "start here" and "getting started" land there. Don't add "start", "new" or "first" as keys: the other words are
  matched as plain substrings ("mode" is inside "model"), so they pulled "start mode", "first zone" and "laser won't
  start" away from the manual (session review, 15 Oct). Course 1's topics carry its old name "start here", so "start
  here course" still finds it. Academy rows come
  first; a search with "tutorial", "video" or "youtube" puts the Tutorials group before the manual. A new Academy course goes in
  this list here and in the manual (its paths start with `../../../`).
- **Hotspots** on the hero photo are `--x`/`--y` percentages of `images/home/ultra-mk2-rear.webp`.
  If that photo is replaced, re-measure them.
- **Shared with the manual:** the manual page carries copies of the theme script in `<head>`, the
  `:root` colour tokens, the `@font-face` block, the SVG sprite (wordmark gradients and icons), the
  header (nav and the narrow-screen menu, with its theme/menu/key-hint JS), the footer, and the search
  dialog's HTML, CSS and JS (including the `VIDEOS`, `PAGES` and `STOP` lists). A change to any of these here
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
  Exception: crops from 1080p screen recordings (`Pictures/laseros-*`, the LaserOS chapter) are shown at
  about 0.65-0.75x of the file width, so their small labels stay readable.
  Without `width`/`height`, deep links land in the wrong place while lazy images load. The sources
  stay in `Pictures/` (for the 240x320 CubeOS screenshots the lossless originals are the `.bmp`
  files); the Declaration of Conformity thumbnails link to the signed PDF (the LaserCube's) and the adapters' full-size scans.
- **The search code is a copy of the homepage's** (it indexes this page's own DOM instead of
  fetching it, and closes the dialog when a result on this page is picked). Function and variable
  names match the homepage's, so a fix can be copied across; see "Shared with the manual" above.
- **3D models (`cad/`)**, linked from the manual's "3D Models for Mounts and Cases" (`#outside-3d-models`, under
  Hardware Installation): one ZIP per cube with an outside-only STEP file and a README.txt (October 2026). The Ultra MK2
  and WiFi files are marked approximate in their names, their README and the manual. They are built outside this repo
  from LaserDock's design files (which never go in this repo); to update one, replace the ZIP in place under the same
  name (or rename it and its link together) and update the size in the manual. A future merge of LaserDock's manual
  must keep this section.

## 404 page (`404.html`)

GitHub Pages serves it for any URL that doesn't exist, at that URL, so every link and asset in it is
root-relative (`/fonts/...`). Old `/docs/...` links (the Doks site had `/docs/resources/`,
`/docs/reference/`) jump straight to the manual, keeping any `#anchor`; anything else shows the page,
whose search box sends `/?q=` to the homepage search. Its colour tokens, wordmark and header are copies
of the homepage's (a fourth copy, see "Shared with the manual").

## Quick start (`start/`)

The online side of the printed Quick Start Guide: `start/` (pick your model) and one page per model
(`start/ultra-mk2/`, `start/pro/`, `start/wifi/`), each with the same five steps as the printed guide. The step ids
are the printed guide's section names (`#getting-to-know-your-lasercube`, `#turning-on-your-device`,
`#connecting-your-lasercube`, `#getting-started-with-laseros`, `#using-your-lasercube`): printed QR codes and
redirects point at them, so never rename them.

- **No material of its own.** Every sentence comes from the manual, an Academy lesson, the LaserCube WiFi manual (PDF)
  or the owner, and every video cut (start, end, caption, note, and whether it has a YouTube link) is copied from the
  Academy lesson that uses it. The one video that is in no lesson is the WiFi page's first, the channel's own LaserCube
  WiFi quick start guide. Change the lesson or the manual first, then the start page.
- **The four pages and `start/start.css` are written by a builder** that is kept outside this public repo (like the
  Beam Creator guide's source). Don't edit them by hand: the next build overwrites them. The builder copies the header,
  footer and icon sprite from `academy/index.html`, checks every link, manual anchor and lesson id, and the pages load
  `academy/academy.css` and `academy/academy.js` (theme switch, menu, click-to-play videos), so a change to those
  shows here too.
- **The WiFi page stands alone.** It is the only WiFi page on the wiki and shares no text with the other two, so it
  can be listed or unlisted on its own (the picker in `start/`, the other pages' model switch, the homepage's "Which
  LaserCube do you have?"). The page itself always stays: owners and printed codes need it.
- **Search:** the `PAGES` lists on the homepage and in the manual have a "Quick start" group (keys `quickstart quick unbox
  unboxing`): a search with one of those words shows the start pages first; a model name alone ("ultra") finds them
  only after everything else. Not in the header menu (the homepage's "Which LaserCube do you have?" row links them).

## Academy (`academy/`)

Free courses with a final quiz and a certificate, at /academy/. Plain HTML/CSS/JS, progress kept in the
visitor's browser, no accounts or server. Its header, colour tokens and footer are copies of the homepage's
(see "Shared with the manual" above; the academy is a third copy). How it works, how to add a course and
the content rules: `academy/README.md`.
