/* LaserCube Academy: lesson navigation, progress, checks, exercises, final quiz and the certificate.
   No server and no accounts: progress lives in this browser (localStorage) and the certificate is drawn here.
   A course is one HTML page (see academy/README.md); this file needs no changes for a new course. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function load(key) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v && typeof v === "object" && !Array.isArray(v) ? v : null; } catch (e) { return null; }
  }
  function isObj(v) { return !!v && typeof v === "object" && !Array.isArray(v); }
  // Progress as stored, cleaned up: anything malformed (old format, another script) is dropped, not trusted.
  function clean(s) {
    s = isObj(s) ? s : {};
    var done = {};
    if (isObj(s.done)) Object.keys(s.done).forEach(function (k) { if (s.done[k]) done[k] = s.done[k]; });
    var p = s.passed;
    var passed = isObj(p) && typeof p.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.date) && typeof p.version === "string" ? { date: p.date, version: p.version } : null;
    return { done: done, passed: passed, name: typeof s.name === "string" ? s.name.slice(0, 60) : "" };
  }
  function store(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function keyFor(slug) { return "academy:" + slug; }
  var CHECK = '<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>';

  // Theme: same switch and storage key as the wiki, so the choice carries over.
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  function isDark() { return root.dataset.theme ? root.dataset.theme === "dark" : mq.matches; }
  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("wiki-theme", next); } catch (e) {}
  });

  // Header menu (narrow screens): closes on a link, a tap outside, focus leaving it and Esc, like the wiki's.
  var menu = document.querySelector(".menu");
  if (menu) {
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) menu.open = false; });
    // pointerdown, not click: iOS sends no click for a tap on plain content.
    document.addEventListener("pointerdown", function (e) { if (menu.open && !menu.contains(e.target)) menu.open = false; });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.open) { menu.open = false; menu.querySelector("summary").focus(); } });
    menu.addEventListener("focusout", function (e) { if (e.relatedTarget && !menu.contains(e.relatedTarget)) menu.open = false; });
  }

  // "Skip to content": focus the content without a hash change, so the address keeps the open lesson
  var skip = document.querySelector(".skip"), mainEl = document.getElementById("main");
  if (skip && mainEl) skip.addEventListener("click", function (e) {
    e.preventDefault();
    mainEl.setAttribute("tabindex", "-1");
    mainEl.focus();
  });

  // Videos: a local thumbnail until the visitor presses play, then YouTube's privacy-enhanced player.
  $$(".video[data-yt]").forEach(function (v) {
    var b = $("button", v);
    b.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(v.dataset.yt) + "?autoplay=1&rel=0";
      f.title = v.dataset.title || "Video";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      f.referrerPolicy = "strict-origin-when-cross-origin";
      v.textContent = "";
      v.appendChild(f);
      f.focus();
    });
  });

  // Catalogue cards: show progress for each course.
  $$("[data-progress-for]").forEach(function (el) {
    var st = clean(load(keyFor(el.dataset.progressFor)));
    var total = +el.dataset.lessons || 1;
    var ids = Object.keys(st.done);
    var n = Math.min(ids.length, total);
    var bar = $(".progress-bar span", el), txt = $(".progress-text", el), btn = $("[data-start]", el.closest(".card") || document);
    if (bar) bar.style.width = Math.round((n / total) * 100) + "%";
    if (txt) txt.textContent = st.passed ? "Completed: certificate ready" : n ? n + " of " + total + " lessons done" : "Not started";
    if (btn) {
      if (st.passed) { btn.textContent = "Get your certificate"; btn.href = btn.getAttribute("href") + "#certificate"; }
      else if (n) { btn.textContent = "Continue the course"; }
    }
  });

  var course = $("[data-course]");
  if (!course) return;

  var slug = course.dataset.course, version = course.dataset.version || "1";
  var KEY = keyFor(slug);
  var state = clean(load(KEY));
  // Another tab may have saved progress since this one loaded: merge instead of overwriting it.
  function merged() {
    var disk = clean(load(KEY));
    Object.keys(disk.done).forEach(function (k) { if (!state.done[k]) state.done[k] = disk.done[k]; });
    if (!state.passed) state.passed = disk.passed;
    if (!state.name) state.name = disk.name;
  }
  function save() { merged(); store(KEY, state); }
  window.addEventListener("storage", function (e) {
    if (e.key !== KEY) return;
    merged();
    refresh();
    if (current && current.id === "final") renderFinal();
    if (current && current.id === "certificate") renderCert();
  });

  var views = $$(".view", course);
  var lessons = views.filter(function (v) { return v.classList.contains("lesson"); });
  var total = lessons.length;
  var live = $("#announce");
  function say(t) { if (!live) return; live.textContent = ""; setTimeout(function () { live.textContent = t; }, 40); }
  function titleOf(l) { var h = $("h2", l); return h ? h.textContent.trim() : l.id; }
  function doneCount() { return lessons.filter(function (l) { return state.done[l.id]; }).length; }

  // ---- phone contents: a copy of the sidebar list ----
  var toc = $(".toc ol"), phone = $(".toc-phone .inner");
  if (toc && phone) phone.appendChild(toc.cloneNode(true));

  // ---- views ----
  var first = true;
  var current = null;
  // "Review lesson N" under a graded quiz question: coming back (browser Back, the quiz link, or the
  // "Back to your quiz results" link on that lesson) returns to that question, not to the top of the quiz.
  // Opening any other part of the course forgets the question.
  var reviewFrom = null, reviewLesson = "", reviewBack = [];
  function showReviewBack(v) {
    if (v.id !== "final" && v.id !== reviewLesson) { reviewFrom = null; reviewLesson = ""; }
    var on = !!(reviewFrom && reviewFrom.isConnected && v.id === reviewLesson);
    if (on && !reviewBack.length) {
      reviewBack = [0, 1].map(function () {
        var p = document.createElement("p");
        p.className = "review-back";
        p.innerHTML = '<a class="link" data-nav href="#final"><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg>Back to your quiz results</a>';
        return p;
      });
    }
    if (on) {
      v.insertBefore(reviewBack[0], v.firstChild);
      v.insertBefore(reviewBack[1], $(".pager", v)); // and at the end, above the lesson's own Back and Next
    }
    reviewBack.forEach(function (p) { p.hidden = !on; });
    return on;
  }
  function route() {
    var id = "";
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) {}
    var el = id && document.getElementById(id);
    // A link to something inside a view (a heading) opens that view; a link to anything else ("Skip to content")
    // keeps the view that is open.
    var v = el && (el.classList.contains("view") ? el : el.closest(".view"));
    if (!v) {
      if (el && current) { history.replaceState(null, "", "#" + current.id); return; } // keep the open lesson in the address
      v = views[0];
    }
    current = v;
    views.forEach(function (x) { x.classList.toggle("current", x === v); });
    $$("[data-nav]").forEach(function (a) {
      if (a.getAttribute("href") === "#" + v.id) a.setAttribute("aria-current", "step"); else a.removeAttribute("aria-current");
    });
    var det = $(".toc-phone");
    if (det) det.open = false;
    if (menu) menu.open = false;
    if (v.id === "final") renderFinal();
    if (v.id === "certificate") renderCert();
    if (v.classList.contains("lesson")) solved(v); // done once read if nothing in it needs an answer
    var reviewing = showReviewBack(v);
    if (!first && v.id === "final" && reviewFrom && reviewFrom.isConnected) {
      // the question centred, or its top just below the sticky header when it is taller than the screen
      var r = reviewFrom.getBoundingClientRect();
      window.scrollTo(0, Math.max(0, r.top + window.pageYOffset - Math.max(80, (window.innerHeight - r.height) / 2)));
      var link = $("a[data-nav]", reviewFrom);
      if (link) link.focus({ preventScroll: true });
    } else if (!first) {
      toTop();
      var h = reviewing ? $("a", reviewBack[0]) : $("h2", v); // the back link comes right before the heading
      if (h) h.focus({ preventScroll: true });
    } else if (location.hash) {
      // Firefox has already jumped to the anchor in the page as it was before the other lessons were hidden.
      toTop();
      window.addEventListener("load", toTop);
    }
    first = false;
  }
  function toTop() {
    var top = $(".course-grid").getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo(0, Math.max(0, top));
  }
  views.forEach(function (v) { var h = $("h2", v); if (h) h.setAttribute("tabindex", "-1"); });
  window.addEventListener("hashchange", route);
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-nav]");
    if (a && a.getAttribute("href") === location.hash) route(); // same link again: still bring the lesson to the top
  });

  function refresh() {
    var n = doneCount();
    $$(".js-progress").forEach(function (p) {
      var bar = $(".progress-bar span", p), txt = $(".progress-text", p);
      if (bar) bar.style.width = Math.round((n / total) * 100) + "%";
      if (txt) txt.textContent = state.passed ? "Course completed" : n + " of " + total + " lessons done";
    });
    $$(".toc [data-nav], .toc-phone [data-nav]").forEach(function (a) {
      var id = a.getAttribute("href").slice(1), li = a.parentNode, st = $(".st", a);
      var isLesson = lessons.some(function (l) { return l.id === id; });
      var done = isLesson ? !!state.done[id] : id === "final" ? !!state.passed : id === "certificate" ? !!(state.passed && state.name) : false;
      li.classList.toggle("done", done);
      if (st) { if (done) st.innerHTML = CHECK; else if (st.dataset.n) st.textContent = st.dataset.n; }
      if (id === "final" || id === "certificate") li.classList.toggle("locked", id === "final" ? n < total : !state.passed);
      if (st && done) a.setAttribute("aria-label", a.textContent.trim() + " (done)"); else a.removeAttribute("aria-label");
    });
    lessons.forEach(function (l) {
      var d = !!state.done[l.id];
      $$(".done-flag, .lesson-done", l).forEach(function (x) { x.hidden = !d; });
    });
    var start = $("#start-btn");
    if (start) {
      var next = lessons.filter(function (l) { return !state.done[l.id]; })[0];
      if (state.passed) { start.textContent = "Get your certificate"; start.href = "#certificate"; }
      else if (!next) { start.textContent = "Take the final quiz"; start.href = "#final"; }
      else if (n) { start.textContent = "Continue: " + titleOf(next); start.href = "#" + next.id; }
      else { start.textContent = "Start the course"; start.href = "#" + lessons[0].id; }
    }
  }

  // ---- lesson practice: multiple choice, put-in-order, scenarios ----
  function verdict(ok, text) {
    return '<span class="verdict">' + (ok ? "Right." : "Not quite.") + "</span> " + text;
  }
  function solved(lesson) {
    var items = $$(".check, .order, .scenario", lesson);
    if (items.every(function (it) { return it.dataset.solved === "1"; }) && !state.done[lesson.id]) {
      state.done[lesson.id] = new Date().toISOString();
      save();
      say(doneCount() === total ? "Lesson complete. All lessons are done: the final quiz is open." : "Lesson complete.");
    }
    refresh();
  }

  function setupCheck(fs, onSolved) {
    var fb = $(".feedback", fs), why = $(".why", fs);
    $$("input", fs).forEach(function (inp) {
      inp.addEventListener("change", function () {
        var ok = inp.value === fs.dataset.answer;
        $$(".opt", fs).forEach(function (o) { o.classList.remove("right", "wrong"); });
        inp.closest(".opt").classList.add(ok ? "right" : "wrong");
        fs.classList.toggle("is-right", ok);
        fs.classList.toggle("is-wrong", !ok);
        fb.innerHTML = verdict(ok, ok ? (why ? why.innerHTML : "") : "Try another answer.");
        if (ok && fs.dataset.solved !== "1") { fs.dataset.solved = "1"; onSolved(); }
      });
    });
  }

  var ARROW_UP = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
  var ARROW_DOWN = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>';
  function setupOrder(box, onSolved) {
    var ol = $("ol", box), fb = $(".feedback", box), why = $(".why", box), btn = $(".check-order", box);
    var items = $$("li", ol);
    if (items.length < 2 || !btn) { box.dataset.solved = "1"; return; } // nothing to put in order
    items.forEach(function (li, i) {
      li.dataset.pos = i;
      var span = document.createElement("span");
      while (li.firstChild) span.appendChild(li.firstChild);
      li.appendChild(span);
      var label = span.textContent.trim();
      var mv = document.createElement("div");
      mv.className = "mv";
      mv.innerHTML = '<button type="button" data-dir="-1">' + ARROW_UP + '</button><button type="button" data-dir="1">' + ARROW_DOWN + "</button>";
      mv.firstChild.setAttribute("aria-label", "Move up: " + label);
      mv.lastChild.setAttribute("aria-label", "Move down: " + label);
      li.appendChild(mv);
    });
    var order;
    do { order = shuffle(items.slice()); } while (order.every(function (li, i) { return +li.dataset.pos === i; }));
    order.forEach(function (li) { ol.appendChild(li); });
    function sync() {
      var lis = $$("li", ol);
      lis.forEach(function (li, i) {
        var b = $$(".mv button", li);
        b[0].disabled = i === 0;
        b[1].disabled = i === lis.length - 1;
      });
    }
    sync();
    ol.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-dir]");
      if (!b || b.disabled) return;
      var li = b.closest("li"), dir = +b.dataset.dir;
      if (dir < 0 && li.previousElementSibling) ol.insertBefore(li, li.previousElementSibling);
      if (dir > 0 && li.nextElementSibling) ol.insertBefore(li.nextElementSibling, li);
      $$("li", ol).forEach(clearMark);
      fb.innerHTML = "";
      sync();
      (b.disabled ? $$(".mv button", li)[dir < 0 ? 1 : 0] : b).focus();
      var lis = $$("li", ol);
      say("Moved to step " + (lis.indexOf(li) + 1) + " of " + lis.length + ".");
    });
    btn.addEventListener("click", function () {
      var lis = $$("li", ol), right = 0;
      lis.forEach(function (li, i) {
        var ok = +li.dataset.pos === i;
        if (ok) right++;
        clearMark(li);
        li.classList.add(ok ? "right" : "wrong");
        // the colour isn't the only sign: each step also says whether it is in place
        var tag = document.createElement("em");
        tag.className = "tag";
        tag.textContent = ok ? "In place" : "Move";
        li.insertBefore(tag, $(".mv", li));
      });
      var all = right === lis.length;
      box.classList.toggle("is-right", all);
      box.classList.toggle("is-wrong", !all);
      fb.innerHTML = all
        ? verdict(true, why ? why.innerHTML : "That’s the order.")
        : verdict(false, right + " of " + lis.length + " steps are in the right place. Move the ones marked “Move” and check again.");
      if (all && box.dataset.solved !== "1") { box.dataset.solved = "1"; onSolved(); }
    });
  }

  function clearMark(li) {
    li.classList.remove("right", "wrong");
    var tag = $(".tag", li);
    if (tag) tag.remove();
  }

  function setupScenario(sc, onSolved) {
    var btns = $$(".choices button", sc), fb = $(".feedback", sc), why = $(".why", sc);
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var ok = b.dataset.a === sc.dataset.answer;
        btns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); x.classList.remove("right", "wrong"); });
        b.classList.add(ok ? "right" : "wrong");
        sc.classList.toggle("is-right", ok);
        sc.classList.toggle("is-wrong", !ok);
        var hint = $(".hint", sc);
        fb.innerHTML = verdict(ok, ok ? (why ? why.innerHTML : "") : hint ? hint.innerHTML : "Think again about who or what the beam could reach.");
        if (ok && sc.dataset.solved !== "1") { sc.dataset.solved = "1"; onSolved(); }
      });
    });
  }

  lessons.forEach(function (lesson) {
    function done() { solved(lesson); }
    $$(".check", lesson).forEach(function (fs) { setupCheck(fs, done); });
    $$(".order", lesson).forEach(function (o) { setupOrder(o, done); });
    $$(".scenario", lesson).forEach(function (s) { setupScenario(s, done); });
  });

  // ---- printing the checklist ----
  $$("[data-print-checklist]").forEach(function (b) {
    b.addEventListener("click", function () { document.body.classList.add("print-checklist"); window.print(); });
  });
  window.addEventListener("afterprint", function () { document.body.classList.remove("print-checklist"); });

  // ---- final quiz ----
  var final = $("#final");
  var bank = final ? $$(".bank .check", final) : [];
  var PICK = final ? Math.min(+final.dataset.pick || 10, bank.length) : 0;
  var PASS = final ? Math.min(+final.dataset.pass || Math.ceil(PICK * 0.8), PICK) : 0;
  var quizForm = $("#quiz-form"), quizList = $("#quiz-list"), quizMsg = $("#quiz-msg"), quizResult = $("#quiz-result");

  function localDate() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function niceDate(iso) {
    var p = (iso || localDate()).split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  // One question per topic (data-group) first, so every quiz covers every part of the course; then fill up at random.
  function pick() {
    var seen = {}, firsts = [], rest = [];
    shuffle(bank.slice()).forEach(function (q) {
      var g = q.dataset.group;
      if (g && !seen[g]) { seen[g] = true; firsts.push(q); } else rest.push(q);
    });
    var chosen = shuffle(firsts).slice(0, PICK);
    return shuffle(chosen.concat(rest.slice(0, PICK - chosen.length)));
  }

  function newQuiz() {
    reviewFrom = null;
    reviewLesson = "";
    quizList.textContent = "";
    quizResult.hidden = true;
    quizResult.textContent = "";
    quizMsg.textContent = "";
    pick().forEach(function (src, i) {
      var q = src.cloneNode(true);
      $$("input", q).forEach(function (inp, k) { inp.name = "fq" + i; inp.id = "fq" + i + "-" + k; inp.checked = false; inp.disabled = false; });
      var opts = $(".opts", q);
      shuffle($$(".opt", opts)).forEach(function (o) { opts.appendChild(o); });
      var qn = $(".qn", q);
      if (qn) qn.textContent = "Question " + (i + 1) + " of " + PICK;
      quizList.appendChild(q);
    });
    $("button[type=submit]", quizForm).hidden = false;
  }

  if (quizList) quizList.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#lesson-"]');
    if (a) { reviewFrom = a.closest(".check"); reviewLesson = a.getAttribute("href").slice(1); }
  });

  function leftMsg(n) { return "Answer all " + PICK + " questions first (" + n + " left)."; }
  // after a submit with blanks: clear a question's mark once it is answered, and keep the count right
  if (quizList) quizList.addEventListener("change", function (e) {
    var q = e.target.closest(".check");
    if (q && q.classList.contains("missing")) { q.classList.remove("missing"); $(".feedback", q).textContent = ""; }
    if (!quizMsg.textContent) return;
    var left = $$(".check", quizList).filter(function (x) { return !$("input:checked", x); }).length;
    quizMsg.textContent = left ? leftMsg(left) : "";
  });

  function renderFinal() {
    if (!final) return;
    var missing = lessons.filter(function (l) { return !state.done[l.id]; });
    var locked = $("#final-locked");
    locked.hidden = !missing.length;
    quizForm.hidden = !!missing.length;
    if (missing.length) {
      var ul = $("ul", locked);
      ul.textContent = "";
      missing.forEach(function (l) {
        var li = document.createElement("li"), a = document.createElement("a");
        a.href = "#" + l.id;
        a.className = "link";
        a.textContent = titleOf(l);
        li.appendChild(a);
        ul.appendChild(li);
      });
      return;
    }
    if (!quizList.children.length) newQuiz();
  }

  if (quizForm) quizForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var qs = $$(".check", quizList);
    var open = qs.filter(function (q) { return !$("input:checked", q); });
    qs.forEach(function (q) {
      var miss = open.indexOf(q) >= 0;
      q.classList.toggle("missing", miss);
      $(".feedback", q).innerHTML = miss ? '<span class="verdict">Pick an answer for this question.</span>' : "";
    });
    if (open.length) {
      quizMsg.textContent = leftMsg(open.length);
      open[0].scrollIntoView({ block: "center" });
      $("input", open[0]).focus({ preventScroll: true });
      return;
    }
    quizMsg.textContent = "";
    var score = 0;
    qs.forEach(function (q) {
      var c = $("input:checked", q), ok = c.value === q.dataset.answer, why = $(".why", q);
      if (ok) score++;
      c.closest(".opt").classList.add(ok ? "right" : "wrong");
      if (!ok) { var r = $('input[value="' + q.dataset.answer + '"]', q); if (r) r.closest(".opt").classList.add("right"); }
      q.classList.add(ok ? "is-right" : "is-wrong");
      $(".feedback", q).innerHTML = verdict(ok, why ? why.innerHTML : "");
      // a wrong answer points back to its lesson
      var n = q.dataset.lesson;
      if (!ok && /^\d+$/.test(n || "") && document.getElementById("lesson-" + n)) $(".feedback", q).insertAdjacentHTML("beforeend", ' <a class="link" data-nav href="#lesson-' + n + '">Review lesson ' + n + "</a>");
      $$("input", q).forEach(function (i) { i.disabled = true; });
    });
    $("button[type=submit]", quizForm).hidden = true;
    var pass = score >= PASS;
    quizResult.className = "result " + (pass ? "pass" : "fail");
    quizResult.hidden = false;
    if (pass) {
      if (!state.passed || state.passed.version !== version) state.passed = { date: localDate(), version: version };
      save();
      quizResult.innerHTML = '<h3 tabindex="-1">You passed: ' + score + " of " + PICK + '.</h3><p>Well done. Your certificate is ready.</p><div class="btn-row"><a class="btn solid" href="#certificate">Get your certificate</a></div>';
    } else {
      quizResult.innerHTML = '<h3 tabindex="-1">' + score + " of " + PICK + " right. You need " + PASS + ' to pass.</h3><p>Read the explanations under each question, then try again with a new set of questions.</p><div class="btn-row"><button class="btn solid" type="button" id="retry">Try again</button></div>';
      $("#retry").addEventListener("click", function () { newQuiz(); $("h2", final).focus(); final.scrollIntoView(); });
    }
    refresh();
    $("h3", quizResult).focus();
    say(pass ? "You passed." : "Not passed yet.");
  });

  // ---- certificate (drawn on a canvas, saved as PDF or PNG; nothing leaves the browser) ----
  var certForm = $("#cert-form"), certInput = $("#cert-name"), canvas = $("#cert-canvas");
  var FONT = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", Arial, sans-serif';
  var PW = 1123, PH = 794, SCALE = 3508 / PW; // designed on an A4 landscape page at 96 dpi, drawn at 300 dpi

  function renderCert() {
    if (!certForm) return;
    $("#cert-locked").hidden = !!state.passed;
    $("#cert-ready").hidden = !state.passed;
    if (!state.passed) return;
    if (state.name && !certInput.value) certInput.value = state.name;
    if (state.name && certKey(state.name) !== drawn) drawWhenReady(state.name);
  }
  var drawn = "", shownUrl = null; // what the certificate on screen shows, and its image URL
  function certKey(name) { return name + "|" + state.passed.date + "|" + state.passed.version; }

  // Draw once Inter (including the subset the name needs) has loaded, or after 2.5 s with whatever font there is.
  // If the font is late, draw with the fallback first and again once it has loaded.
  function drawWhenReady(name) {
    var loaded = false;
    var ready = (document.fonts && document.fonts.load
      ? Promise.all([document.fonts.load("600 58px Inter", name), document.fonts.load("400 17px Inter"), document.fonts.load("600 28px Inter")]).catch(function () {})
      : Promise.resolve()).then(function () { loaded = true; });
    return Promise.race([ready, new Promise(function (r) { setTimeout(r, 2500); })]).then(function () {
      drawCert(name);
      if (!loaded) { drawn = ""; ready.then(function () { if (state.name === name) drawCert(name); }); }
    });
  }

  function spaced(c, text, x, y, spacing, align) {
    var w = 0, chars = Array.from(text);
    chars.forEach(function (ch) { w += c.measureText(ch).width + spacing; });
    w -= spacing;
    var cx = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
    var oldAlign = c.textAlign;
    c.textAlign = "left";
    chars.forEach(function (ch) { c.fillText(ch, cx, y); cx += c.measureText(ch).width + spacing; });
    c.textAlign = oldAlign;
  }
  function arcText(c, text, cx, cy, r, top, spacing) {
    var chars = Array.from(text), ws = chars.map(function (ch) { return c.measureText(ch).width; });
    var totalW = ws.reduce(function (a, b) { return a + b; }, 0) + spacing * (chars.length - 1);
    var a = top ? -Math.PI / 2 - totalW / r / 2 : Math.PI / 2 + totalW / r / 2;
    c.textAlign = "center";
    c.textBaseline = "middle";
    chars.forEach(function (ch, i) {
      var half = ws[i] / 2 / r;
      a += top ? half : -half;
      c.save();
      c.translate(cx + r * Math.cos(a), cy + r * Math.sin(a));
      c.rotate(top ? a + Math.PI / 2 : a - Math.PI / 2);
      c.fillText(ch, 0, 0);
      c.restore();
      a += (top ? 1 : -1) * (half + spacing / r);
    });
    c.textBaseline = "alphabetic";
  }
  function fit(c, text, weight, size, maxW, min) {
    do { c.font = weight + " " + size + "px " + FONT; size -= 1; } while (c.measureText(text).width > maxW && size > min);
  }

  function drawCert(name) {
    var c = canvas.getContext("2d");
    canvas.width = Math.round(PW * SCALE);
    canvas.height = Math.round(PH * SCALE);
    c.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    var ink = "#0a0a0c", muted = "#55555f", subtle = "#696973", blue = "#2b62fd";

    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, PW, PH);
    c.strokeStyle = ink; c.lineWidth = 1.4; c.strokeRect(28, 28, PW - 56, PH - 56);
    c.strokeStyle = "rgba(10,10,12,.16)"; c.lineWidth = 0.7; c.strokeRect(36, 36, PW - 72, PH - 72);

    // LaserCube wordmark (the same path the page header uses), in the wiki's "ink" gradient
    var path = $("#wordmark path");
    if (path && window.Path2D) {
      c.save();
      c.translate(84, 82);
      var s = 210 / 234;
      c.scale(s, s);
      var g = c.createLinearGradient(27, 5.3, 217, 69.7);
      g.addColorStop(0, ink); g.addColorStop(0.404, "#c13ad1"); g.addColorStop(0.51, ink); g.addColorStop(1, blue);
      c.fillStyle = g;
      c.fill(new Path2D(path.getAttribute("d")), "evenodd");
      c.restore();
    }
    c.fillStyle = muted;
    c.font = "600 12px " + FONT;
    spaced(c, "ACADEMY", 306, 96, 2.6, "left");
    c.font = "500 12.5px " + FONT;
    c.fillStyle = subtle;
    c.textAlign = "right";
    c.fillText("wiki.laseros.com/academy", PW - 84, 96);

    var line = c.createLinearGradient(84, 0, PW - 84, 0);
    line.addColorStop(0, blue); line.addColorStop(0.55, "#f98dff"); line.addColorStop(1, "rgba(43,98,253,.15)");
    c.fillStyle = line;
    c.fillRect(84, 126, PW - 168, 1.6);

    c.textAlign = "center";
    c.fillStyle = blue;
    c.font = "600 14px " + FONT;
    spaced(c, "CERTIFICATE OF COMPLETION", PW / 2, 206, 3.2, "center");
    c.fillStyle = muted;
    c.font = "400 17px " + FONT;
    c.fillText("Awarded to", PW / 2, 256);

    c.fillStyle = ink;
    fit(c, name, "600", 58, 860, 12);
    c.fillText(name, PW / 2, 330);
    c.fillStyle = "rgba(10,10,12,.22)";
    c.fillRect(PW / 2 - 280, 356, 560, 1);

    c.fillStyle = muted;
    c.font = "400 17px " + FONT;
    c.fillText("for completing the LaserCube Academy course", PW / 2, 400);
    c.fillStyle = ink;
    fit(c, course.dataset.title, "600", 28, 900, 16);
    c.fillText(course.dataset.title, PW / 2, 446);
    c.fillStyle = muted;
    c.font = "400 15px " + FONT;
    c.fillText(course.dataset.subtitle + "  ·  Course version " + state.passed.version, PW / 2, 482);

    // bottom row: date, seal, issuer
    c.fillStyle = "rgba(10,10,12,.22)";
    c.fillRect(84, 590, 240, 1);
    c.fillRect(PW - 324, 590, 240, 1);
    c.fillStyle = subtle;
    c.font = "600 11px " + FONT;
    spaced(c, "DATE", 84, 614, 2, "left");
    spaced(c, "ISSUED BY", PW - 84, 614, 2, "right");
    c.fillStyle = ink;
    c.font = "600 18px " + FONT;
    c.textAlign = "left";
    c.fillText(niceDate(state.passed.date), 84, 642);
    c.textAlign = "right";
    c.fillText("Wicked Lasers", PW - 84, 642);

    var cx = PW / 2, cy = 616;
    c.strokeStyle = ink; c.lineWidth = 1.4;
    c.beginPath(); c.arc(cx, cy, 64, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 0.7;
    c.beginPath(); c.arc(cx, cy, 44, 0, Math.PI * 2); c.stroke();
    c.fillStyle = ink;
    c.font = "600 9.5px " + FONT;
    arcText(c, "LASERCUBE ACADEMY", cx, cy, 54, true, 1.6);
    arcText(c, "WICKED LASERS", cx, cy, 54, false, 1.6);
    for (var i = 0; i < 16; i++) {
      var a = (i / 16) * Math.PI * 2, r2 = i % 2 ? 24 : 34;
      c.strokeStyle = i % 4 === 0 ? blue : i % 4 === 2 ? "#c13ad1" : ink;
      c.lineWidth = i % 2 ? 1 : 1.6;
      c.beginPath();
      c.moveTo(cx + 11 * Math.cos(a), cy + 11 * Math.sin(a));
      c.lineTo(cx + r2 * Math.cos(a), cy + r2 * Math.sin(a));
      c.stroke();
    }
    c.fillStyle = ink;
    c.beginPath(); c.arc(cx, cy, 5.5, 0, Math.PI * 2); c.fill();

    c.textAlign = "center";
    c.fillStyle = subtle;
    c.font = "400 11.5px " + FONT;
    c.fillText("A certificate of completion. It is not a licence, a Laser Safety Officer (LSO) qualification or permission to run public laser shows.", PW / 2, 724);

    // Shown as an image, so phones (and in-app browsers that block downloads) can long-press to save it.
    drawn = certKey(name);
    var img = $("#cert-img");
    if (img && canvas.toBlob) canvas.toBlob(function (b) {
      if (!b) { img.src = canvas.toDataURL("image/png"); return; }
      if (shownUrl) URL.revokeObjectURL(shownUrl);
      shownUrl = URL.createObjectURL(b);
      img.src = shownUrl;
    }, "image/png");
    else if (img) img.src = canvas.toDataURL("image/png");
    $("#cert-out").hidden = false;
  }

  // A one-page PDF (A4 landscape) holding the certificate as a JPEG.
  function pdfFromJpeg(jpeg, w, h) {
    var enc = new TextEncoder(), parts = [], len = 0, offs = [];
    function add(x) { var b = typeof x === "string" ? enc.encode(x) : x; parts.push(b); len += b.length; }
    function obj(n, body) { offs[n] = len; add(n + " 0 obj\n" + body + "\nendobj\n"); }
    var PWpt = 841.89, PHpt = 595.28, content = "q " + PWpt + " 0 0 " + PHpt + " 0 0 cm /Im0 Do Q";
    add("%PDF-1.4\n");
    add(new Uint8Array([37, 226, 227, 207, 211, 10]));
    obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
    obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    obj(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + PWpt + " " + PHpt + "] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>");
    offs[4] = len;
    add("4 0 obj\n<< /Type /XObject /Subtype /Image /Width " + w + " /Height " + h + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + jpeg.length + " >>\nstream\n");
    add(jpeg);
    add("\nendstream\nendobj\n");
    obj(5, "<< /Length " + content.length + " >>\nstream\n" + content + "\nendstream");
    obj(6, "<< /Title (LaserCube Academy certificate) /Producer (wiki.laseros.com/academy) >>");
    var xref = len, x = "xref\n0 7\n0000000000 65535 f \n";
    for (var i = 1; i <= 6; i++) x += String(offs[i]).padStart(10, "0") + " 00000 n \n";
    add(x + "trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n" + xref + "\n%%EOF\n");
    return new Blob(parts, { type: "application/pdf" });
  }
  function download(blob, name) {
    var url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  function fileBase() { return "LaserCube-Academy-" + slug + "-certificate"; }

  if (certForm) {
    certForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = certInput.value.replace(/\s+/g, " ").trim();
      var msg = $("#cert-msg");
      if (!name) { msg.textContent = "Type the name you want on the certificate."; certInput.focus(); return; }
      msg.textContent = "";
      state.name = name;
      save();
      refresh();
      drawWhenReady(name).then(function () { say("Certificate ready. Download it as a PDF or an image."); });
    });
    function failed() { $("#cert-msg").textContent = "The download didn’t start in this browser. Press and hold the certificate above to save it, or open this page in Chrome, Safari or Firefox."; }
    function bytes(blob) {
      if (blob.arrayBuffer) return blob.arrayBuffer();
      return new Promise(function (ok, no) { var r = new FileReader(); r.onload = function () { ok(r.result); }; r.onerror = no; r.readAsArrayBuffer(blob); });
    }
    $("#dl-pdf").addEventListener("click", function () {
      canvas.toBlob(function (b) {
        if (!b) return failed();
        bytes(b).then(function (buf) { download(pdfFromJpeg(new Uint8Array(buf), canvas.width, canvas.height), fileBase() + ".pdf"); }, failed);
      }, "image/jpeg", 0.92);
    });
    $("#dl-png").addEventListener("click", function () {
      canvas.toBlob(function (b) { if (b) download(b, fileBase() + ".png"); else failed(); }, "image/png");
    });
  }

  refresh();
  route();
})();
