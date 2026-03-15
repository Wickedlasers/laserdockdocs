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

  function scrollToId(id, replaceHash = false) {
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    const y = window.pageYOffset + el.getBoundingClientRect().top - getHeaderOffset();
    window.scrollTo({ top: y, behavior: 'smooth' });
    if (replaceHash) {
      try { history.replaceState(null, '', '#' + id); } catch (_) {}
    }
  }

  // Handle TOC clicks (desktop + mobile) for both hash-only and full URLs with hashes.
  // Let the browser update location.hash first, then correct the scroll position.
  document.addEventListener('click', function (e) {
    const a = e.target.closest('#toc a, .toc-mobile a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const hasHash = href.includes('#');
    if (!hasHash) return;
    // Defer correction to next tick so the default anchor navigation occurs first.
    setTimeout(function () {
      const url = new URL(href, window.location.href);
      const id = (url.hash || '').replace(/^#/, '');
      if (id) scrollToId(id, true);
    }, 0);
  }, { capture: true });

  // Adjust after hash-based navigation (e.g., from external links)
  window.addEventListener('hashchange', function () {
    const id = (location.hash || '').replace(/^#/, '');
    // Delay to allow default scroll, then correct
    setTimeout(function () { scrollToId(id); }, 0);
  });

  // If page loads with a hash, correct initial position
  window.addEventListener('load', function () {
    const id = (location.hash || '').replace(/^#/, '');
    if (id) {
      setTimeout(function () { scrollToId(id); }, 0);
    }
  });
})();
