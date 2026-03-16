// Keep anchor targets visible below the sticky header when navigating via TOC
(function () {
  function getHeaderOffset() {
    // Try common header elements from the theme
    const header = document.querySelector('header.navbar, .navbar, header');
    const announcement = document.querySelector('#announcement');
    let h = 0;
    if (header) h += Math.ceil(header.getBoundingClientRect().height);
    if (announcement && announcement.offsetParent !== null) {
      h += Math.ceil(announcement.getBoundingClientRect().height);
    }
    // Fallback cushion
    if (!h) h = 96;
    // Add a small extra gap
    return h + 8;
  }

  function getScrollContainer() {
    const container = document.querySelector('.docs-content');
    return container || window;
  }

  function setHeaderOffsetVar() {
    const h = getHeaderOffset();
    try { document.documentElement.style.setProperty('--header-offset', h + 'px'); } catch (_) {}
  }

  function scrollToId(id, replaceHash = false) {
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    const sc = getScrollContainer();
    if (sc === window) {
      const y = window.pageYOffset + el.getBoundingClientRect().top - getHeaderOffset();
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      // When scrolling inside docs-content, don't subtract header offset
      const y = el.offsetTop; // relative to offsetParent; docs-content is ancestor
      try { sc.scrollTo({ top: y, behavior: 'smooth' }); } catch (_) { sc.scrollTop = y; }
    }
    if (replaceHash) {
      try { history.replaceState(null, '', '#' + id); } catch (_) {}
    }
  }

  // Handle TOC clicks (desktop + mobile) for both hash-only and full URLs with hashes.
  // Let the browser update location.hash first, then correct the scroll position.
  document.addEventListener('click', function (e) {
    const a = e.target.closest('#toc a, #TableOfContents a, .toc-mobile a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const hasHash = href.includes('#');
    if (!hasHash) return;
    // Defer correction to next tick so the default anchor navigation occurs first.
    setTimeout(function () {
      const url = new URL(href, window.location.href);
      const id = (url.hash || '').replace(/^#/, '');
      if (id) {
        setActive(id);
        scrollToId(id, true);
      }
    }, 0);
  }, { capture: true });

  // Adjust after hash-based navigation (e.g., from external links)
  window.addEventListener('hashchange', function () {
    const id = (location.hash || '').replace(/^#/, '');
    // Delay to allow default scroll, then correct
    setTimeout(function () { scrollToId(id); }, 0);
  });

  // If page loads with a hash, correct initial position
  window.addEventListener('DOMContentLoaded', setHeaderOffsetVar);
  window.addEventListener('load', function () {
    const id = (location.hash || '').replace(/^#/, '');
    setHeaderOffsetVar();
    if (id) {
      setTimeout(function () { scrollToId(id); }, 0);
    }
  });
  window.addEventListener('resize', setHeaderOffsetVar);

  // Custom ScrollSpy: keep active link until the next section is within 100px
  const TOC_SELECTORS = '#toc a, #TableOfContents a, .toc-mobile a';
  let headings = [];
  let currentActiveId = null;
  let ticking = false;

  function collectHeadings() {
    headings = Array.from(document.querySelectorAll(
      '.docs-content h1[id], .docs-content h2[id], .docs-content h3[id], .docs-content h4[id]'
    ));
  }

  function setActive(id) {
    if (!id || id === currentActiveId) return;
    currentActiveId = id;
    const tocLinks = document.querySelectorAll(TOC_SELECTORS);
    tocLinks.forEach(a => a.classList.remove('active'));
    tocLinks.forEach(a => {
      try {
        const url = new URL(a.getAttribute('href') || '', window.location.href);
        if ((url.hash || '').replace(/^#/, '') === id) {
          a.classList.add('active');
        }
      } catch (_) {}
    });
  }

  function updateActiveOnScroll() {
    if (!headings.length) return;
    const sc = getScrollContainer();
    const offset = (sc === window) ? getHeaderOffset() : 0;
    // Find the first heading that is below the header/top. Only switch when it's within 100px
    let candidateIndex = -1;
    if (sc === window) {
      for (let i = 0; i < headings.length; i++) {
        const top = headings[i].getBoundingClientRect().top - offset;
        if (top <= 100) candidateIndex = i; else break;
      }
    } else {
      const st = sc.scrollTop;
      for (let i = 0; i < headings.length; i++) {
        const top = (headings[i].offsetTop - st) - offset;
        if (top <= 100) candidateIndex = i; else break;
      }
    }
    if (candidateIndex >= 0) {
      setActive(headings[candidateIndex].id);
    } else if (!currentActiveId && headings.length) {
      // If no candidate yet (e.g., top of page), default to first heading
      setActive(headings[0].id);
    }
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateActiveOnScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  // Initialize
  collectHeadings();
  window.addEventListener('load', collectHeadings);
  window.addEventListener('resize', collectHeadings);
  document.addEventListener('DOMContentLoaded', collectHeadings);
  const scInit = getScrollContainer();
  if (scInit && scInit.addEventListener) scInit.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  // Run once to set initial state
  updateActiveOnScroll();
})();
