# LaserCube Academy

Free courses at https://wiki.laseros.com/academy/. Plain HTML, CSS and JavaScript like the rest of this repo:
no build step, no server, no database, no accounts, no analytics.

- `index.html`: the course list.
- `start-here/index.html`: the first course, "Start here: from the box to your first safe show" (Ultra MK2 & Pro, beginner).
- `control-modes/index.html`: built as the second course, "Control modes for the Ultra MK2 and Pro" (Playlist, Visualizer, Laser Show,
  Cube Link, DMX/Art-Net, MIDI; 8 lessons, 29 quiz questions in 10 topics). It builds on start-here and links back to it.
- `connect/index.html`: built as the third course, "Connect, update and troubleshoot your Ultra MK2 or Pro" (the four connection
  modes, APIPA, status bar and Status Info, drop-outs, the web admin page, firmware updates, factory reset, power and heat;
  8 lessons, 34 quiz questions in 10 topics; version 1.2). The web admin page is there in LaserOS control mode (Paul, LaserDock,
  2026-10-07); the manual's old screenshots of it showed a LaserCube WiFi, so they were left out until new ones exist. Firmware
  2.1 and later change the connection mode without a restart (2.1 release notes in mk2SDContent, LaserDock manual v1.5 p.83);
  older firmware asks to restart.
  Its power and heat facts are in the manual's "Power, Battery and Temperature"
  section (owner decisions, added with the course). For one computer on a direct cable it leads with LAN server (owner
  decision 2026-10-08: one device on a cable = LAN Server) and keeps LAN client with APIPA as the second way.
- Course order (catalogue and each course's "Next course" link, audit 2026-10-09): Start here → LaserOS basics →
  Connect → Control modes → Laser mapping → Music show → TouchDesigner (beginner courses first; mapping and music use SD
  export and LAN client from Control modes and Connect; TouchDesigner, added after the audit, comes last).
- `laseros-basics/`, `laser-mapping/`, `music-show/`: built as courses 4-6 (2026-10-09), "LaserOS basics: your logo, text and
  effects" (8 lessons), "Laser mapping with LaserOS" (6) and "Build a laser show to your music" (8, Advanced). Their
  facts come from the manual chapter "Making Content in LaserOS" (labels checked against the LaserOS v0.18.1 source) and
  the tutorial videos' checked claims. Several embeds use `data-from`/`data-to` to skip parts of a video (other people's
  show clips, hidden LaserOS entries, a profane track title; margins: "Adding a course", step 3). These cuts need
  `data-to` in academy.js: never revert that part while these courses are live. Pages load `academy.js?v=<date>` and
  `academy.css?v=<date>`: raise the date whenever that file changes (pages are cached for 10 minutes). Card pictures:
  `images/home/academy-<course>*.webp` (video frames).
- `touchdesigner/`: course 7 (2026-10-09), "LaserCube with TouchDesigner" (6 lessons, Advanced, 30 quiz questions in
  10 topics). Facts come from the manual section "Ether Dream Control Mode" and Motus Art's four TouchDesigner videos
  (made for Wicked Lasers by Owen McAteer; filmed with TouchDesigner 2025.32820 and an Ultra MK2 on firmware 2.0; their
  checked analyses are kept outside this repo, in the academy sources folder `motus-art/`). The LaserCube WiFi has no
  Ether Dream mode, so the course is for the Ultra MK2 and Pro only; the community script part 1 shows for the WiFi is
  never mentioned or linked (owner decision). The cuts skip: part 1's old models page (around 0:14), its WiFi script
  (4:51 to 6:28) and "open the front panel" with the key on (2:40); the third-party fan video traced in part 2 (7:01
  to 9:31); TouchDesigner's sample music under part 4's equaliser demo (from 3:33; that part is text and screenshots
  only); and spoken slips (part 1 "both work just the same" 2:13; part 2 "negative 1 on the top left" 3:30; part 3
  the UV aside 2:48 and "0, 0 on top left" 5:42; part 4 "negative one, negative one, top left" 1:47). Slips the
  presenter corrects at once (part 3 "circular" to Radial, part 4 "20% to 80" then 1) are left in. The script's nodes
  sit in the background of part 1's preview (7:07 to 8:26); that cut's picture is cropped so they don't show.
- `academy.css`, `academy.js`: shared by every course. A new course needs no change to these
  (control-modes added small table styles, `.table-wrap`, and `.two.shots` for the 240 px screenshots of the cube's screen).

## How it works

- **Progress** is kept in the visitor's browser (`localStorage`, key `academy:<course>`). Nothing is sent anywhere.
  Clearing browser data or switching device starts the course again.
- **Lessons** are `<section class="view lesson" id="lesson-N">`. A lesson counts as done when every question,
  put-in-order exercise and scenario in it has been answered correctly (a lesson with nothing to answer: once opened).
  Progress from another open tab is merged, not overwritten; malformed stored data is ignored.
- **The final quiz** unlocks when all lessons are done. It picks `data-pick` questions from the hidden `.bank` in
  `#final` and passes at `data-pass` correct (now 10 and 8; never more than the number of questions shown).
  Each bank question has a topic (`data-group`); the quiz takes one random question per topic first, then fills up at
  random, so every quiz covers every topic (start-here: 26 questions in 10 topics). Options are shuffled. A wrong answer
  shows its explanation and a "Review lesson N" link (`data-lesson`). Unlimited retries, with a new set each time.
- **The certificate** is drawn in the browser on a canvas (A4 landscape, 300 dpi) and saved as a PDF or a PNG.
  It has no ID and no verification page, on purpose: it is a certificate of completion, not a credential.
  It shows the name the learner types, the course title and version, the date they passed, and a Wicked Lasers seal.
  It says it is not a licence, an LSO qualification or permission to run public shows. The page shows it as an image
  (long-press or right-click to save it, for browsers that block downloads) plus PDF and PNG downloads; it waits for the
  Inter font before drawing and is only redrawn when the name, date or version changes.
- **Videos** show a local thumbnail (`images/home/videos/<id>.webp`) until the visitor presses play; only then does
  the page load YouTube's privacy-enhanced player (youtube-nocookie.com).

## Adding a course

1. Copy `start-here/` to a new folder, e.g. `laseros-essentials/`.
2. In the copy, change `<main data-course="..." data-version="1.0" data-title="..." data-subtitle="...">`.
   `data-course` must be new (it is the progress key); `data-title` and `data-subtitle` go on the certificate.
3. Write the lessons. Building blocks, all plain HTML (copy them from `start-here/index.html`):
   - question: `<fieldset class="check" data-answer="b">` with radio options `a`, `b`, `c` (one `name` per question,
     unique on the page), a hidden `<p class="why">` (shown when answered right) and an empty
     `<p class="feedback" aria-live="polite">`. The page shuffles the options, so the right answer's place gives
     nothing away (write them in any order; don't refer to "the first option" in a `why`);
   - put-in-order: `<div class="order">` with an `<ol>` of at least two steps **in the right order** (the page
     shuffles them) and the "Check the order" button (`.check-order`); a list with fewer steps counts as solved;
   - scenario: `<div class="scenario" data-answer="yes|no">` with the two buttons, a `why`, an optional hidden
     `<p class="hint">` (shown after a wrong choice instead of the general "Think again" line) and a `feedback`;
   - video: `<div class="video" data-yt="<YouTube id>">` plus a thumbnail saved as `images/home/videos/<id>.webp`.
     To play only part of it, add `data-from="<second>"` and/or `data-to="<second>"` (YouTube `start`/`end`). YouTube
     starts at the nearest keyframe, up to about 2 s early, so leave that margin after a line you want skipped. Viewers
     can still scrub, and the "Watch on YouTube" link plays the whole video. When a page uses the same video more
     than once, give each cut its own thumbnail: a 1280x720 frame from inside that cut showing what it teaches, saved
     as `images/academy/<course>/l<lesson>-clip<n>.webp` (otherwise every lesson opens with the same picture), and
     put the cut's times in its caption, e.g. "(10:42 to 16:08)";
   - screenshot from a video: `<figure class="native">` (shown at its `width`/`height` attributes, never stretched;
     give a tall phone screen smaller attributes than the file, e.g. 288x600 for 492x1024) with the image linked to
     itself, saved as `images/academy/<course>/l<lesson>-<what>-<width>.webp`, cropped from the 1080p recording at
     full resolution (no upscaling); every label named in its caption or alt text must be readable in it and match
     the lesson's wording.
4. Update the contents list (`.toc`), the lesson count in the page text, and the final quiz bank: each question gets
   `data-group` (its topic; use exactly `data-pick` topics: with more, some are left out of each quiz; with fewer, the
   rest is filled at random) and
   `data-lesson` (the lesson number it reviews). Keep the options the same length and plausible: in step 2 of
   start-here (7 Oct 2026) the right answer had been the longest option in 17 of 20 questions.
5. Add a card for it to `academy/index.html` (`data-progress-for` = the course's `data-course`, `data-lessons` = its count).
6. Add both URLs to `sitemap.xml`.
7. Add the course to the search's `PAGES` list in `index.html` and in the manual page, with topic words for what it
   teaches (see the main README).

When a course changes in a way that matters, raise `data-version`. Certificates already issued keep the version
they were passed on.

## Videos not public yet

A video that is still private or scheduled on YouTube can go into a lesson now and be shown once it is public
(`grep -rnw pending` lists them):

- in a lesson, its `.video`, `.video-meta` and any `.video-note` sit in `<div class="pending-video" data-pending="<id>" hidden>`;
- on the homepage, its `<li>` or `<article>` has `data-pending="<id>" hidden`;
- in the search lists (homepage and manual), its row is commented out as `// pending <id>: [...]`;
- its thumbnail `images/home/videos/<id>.webp` is a frame from our own copy until YouTube has one (a cut of a video
  used twice on one page has its own picture in `images/academy/<course>/`, which stays).

When YouTube's oEmbed answers 200 for it (`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>`):
remove `hidden` and `data-pending` from those elements, un-comment its search rows, set the beginner's-guide part number
from "pt. N" in a "Beginners guide" YouTube title (without one, drop the part label), replace the thumbnail with YouTube's `maxresdefault.jpg` at 640x360, and push. The cut
times (`data-from`/`data-to`) were set on the presenter's own copy of the video; if the public upload is a different
length, check them again before showing it.

Jarek's four scheduled control-mode videos (Visualizers, Playlist, Laser shows, IDN & Ether Dream; 9-12 Oct 2026) are
shown by an hourly job on our server (academy-reveal.timer, running since 9 Oct 2026; it switches itself off once all
four are up). Don't show them by hand while it runs; the steps above are for other videos.

## Content rules (owner decisions, 7 Oct 2026)

- Facts come from the wiki manual (`docs/guides/ultra-mk2-pro-manual/`) and from X-Laser's Laser Operator Basics
  Course (used with X-Laser's permission; source copy kept outside this repo). A new fact goes into the manual first.
- X-Laser material is rewritten in our own words, facts unchanged. US-only rules (FDA variance, FAA, US reporting)
  are marked "In the US". Where X-Laser's US clearance rules differ from the manual, the manual's stricter
  3 m on all sides is used.
- The LaserCube is never presented as suitable for audience scanning.
- The owner reviews and OKs every course before it goes live. Pushing to `main` publishes it, like any wiki change.
