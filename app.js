/* ═══════════════════════════════════════════════════════════════
   PSALMS & PROVERBS 2026 — Audio PWA
   Clean rebuild: all text pre-embedded in data.json, no fetch calls
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── DOM refs ───
  const coverScreen = document.getElementById('cover-screen');
  const bookCover = document.getElementById('book-cover');
  const bookScreen = document.getElementById('book-screen');
  const bookContainer = document.getElementById('book');
  const loadingIndicator = document.getElementById('loading-indicator');
  const topBar = document.getElementById('top-bar');
  const topBarTitle = document.getElementById('top-bar-title');
  const closeBookBtn = document.getElementById('close-book');
  const searchBtn = document.getElementById('search-btn');
  const tocBtn = document.getElementById('toc-btn');
  const tocOverlay = document.getElementById('toc-overlay');
  const tocOverlayContent = document.getElementById('toc-overlay-content');
  const tocCloseBtn = document.getElementById('toc-close-btn');
  const pagePrev = document.getElementById('page-prev');
  const pageNext = document.getElementById('page-next');
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-input');
  const searchClose = document.getElementById('search-close');
  const searchResults = document.getElementById('search-results');
  const audioRibbon = document.getElementById('audio-ribbon');
  const audioPlay = document.getElementById('audio-play');
  const audioSeek = document.getElementById('audio-seek');
  const audioTime = document.getElementById('audio-time');
  const audioTitle = document.getElementById('audio-title');
  const speedBtn = document.getElementById('speed-btn');
  const audioEl = document.getElementById('audio-el');
  const textSizeBtn = document.getElementById('text-size-btn');

  // ─── State ───
  let pageFlip = null;
  let currentPageIndex = 0;
  let currentBookId = 'psalms';
  let lastLeftIndex = -1; // spread mode: left-page index of the last flip, for direction detection
  let bookData = { psalms: [], proverbs: [] };
  let isBookOpen = false;
  let currentAudioBook = null;
  let currentAudioChapter = null;
  let playbackRate = 1;

  // ─── Text size (accessibility) ───
  const TEXT_SCALES = [1, 1.15, 1.3, 1.5, 1.75, 2];
  let textScaleIndex = 0;
  const TEXT_SIZE_KEY = 'pp-text-scale';

  function applyTextScale(scale) {
    document.documentElement.style.setProperty('--text-scale', scale);
  }

  function nextTextScale() {
    textScaleIndex = (textScaleIndex + 1) % TEXT_SCALES.length;
    const scale = TEXT_SCALES[textScaleIndex];
    applyTextScale(scale);
    try { localStorage.setItem(TEXT_SIZE_KEY, String(textScaleIndex)); } catch (e) {}
    updateTextSizeLabel();
  }

  function updateTextSizeLabel() {
    const scale = TEXT_SCALES[textScaleIndex];
    // Show a small "A" at base, progressively larger "A" at higher scales
    if (scale <= 1.15) textSizeBtn.textContent = 'A';
    else if (scale <= 1.3) textSizeBtn.textContent = 'A+';
    else if (scale <= 1.5) textSizeBtn.textContent = 'A++';
    else textSizeBtn.textContent = 'A+++';
    textSizeBtn.style.fontSize = (13 + (scale - 1) * 10) + 'px';
  }

  // ─── Books config ───
  const BOOKS = [
    {
      id: 'psalms',
      name: 'The Psalms',
      count: 150,
      label: 'Psalm',
      sections: [
        { name: 'Book One', start: 1, end: 41 },
        { name: 'Book Two', start: 42, end: 72 },
        { name: 'Book Three', start: 73, end: 89 },
        { name: 'Book Four', start: 90, end: 106 },
        { name: 'Book Five', start: 107, end: 150 }
      ]
    },
    {
      id: 'proverbs',
      name: 'The Proverbs',
      count: 31,
      label: 'Proverb',
      sections: [
        { name: 'The Lectures', start: 1, end: 9 },
        { name: 'Proverbs of Solomon', start: 10, end: 22 },
        { name: 'The Thirty Sayings', start: 23, end: 24 },
        { name: "Hezekiah's Collection", start: 25, end: 29 },
        { name: 'Agur, Lemuel & The Woman of Strength', start: 30, end: 31 }
      ]
    }
  ];

  // ─── Utils ───
  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function renderMarkdown(md) {
    if (!md) return '';
    let html = escapeHtml(md);
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Paragraphs
    html = html.split('\n\n').map(p => p.trim() ? `<p>${p.replace(/\n/g, '<br>')}</p>` : '').join('');
    return html;
  }

  // ─── Load all data from embedded JSON ───
  async function loadData() {
    const resp = await fetch('data.json');
    bookData = await resp.json();
    // Mark all as available (body is pre-loaded)
    bookData.psalms.forEach(p => { p.available = !!p.body; });
    bookData.proverbs.forEach(p => { p.available = !!p.body; });
  }

  // ─── Build cover page ───
  function buildCoverPage() {
    const div = document.createElement('div');
    div.className = 'page page-cover stf__item';
    div.innerHTML = `
      <div class="cover-leather">
        <div class="cover-emboss">
          <div class="cover-icon">✚</div>
          <div class="cover-divider"></div>
          <h1 class="cover-title">PSALMS<br>& PROVERBS</h1>
          <div class="cover-divider"></div>
          <p class="cover-subtitle">2026 Rendering</p>
          <div class="cover-divider-large"></div>
          <p class="cover-credit">Source: Hebrew Text</p>
        </div>
      </div>
    `;
    return div;
  }

  // ─── Build chapter page ───
  function buildChapterPage(bookId, chapterNum) {
    const book = BOOKS.find(b => b.id === bookId);
    const entry = bookData[bookId] ? bookData[bookId][chapterNum - 1] : null;
    if (!entry) return document.createElement('div');

    const div = document.createElement('div');
    div.className = 'page page-psalm stf__item';
    div.dataset.book = bookId;
    div.dataset.chapter = chapterNum;

    const label = book.label;
    let html = '<div class="page-scroll">';

    // Header
    html += `<div class="psalm-header">`;
    html += `<div class="psalm-header-num">${label} ${entry.num}</div>`;
    // Extract just the title part after the em dash
    const titleParts = entry.title.split(' — ');
    const displayTitle = titleParts.length > 1 ? titleParts.slice(1).join(' — ') : entry.title;
    html += `<div class="psalm-header-title">${escapeHtml(displayTitle)}</div>`;
    html += `<div class="psalm-header-rule"></div>`;
    html += `</div>`;

    // Subtitle
    if (entry.subtitle) {
      html += `<div class="psalm-subtitle">${escapeHtml(entry.subtitle)}</div>`;
    }

    // Body
    if (entry.available && entry.body) {
      html += `<div class="psalm-body">${renderMarkdown(entry.body)}</div>`;
    } else {
      html += `<div class="psalm-body"><p style="text-align:center;font-style:italic;color:var(--ink-light);margin-top:40px;">Coming soon</p></div>`;
    }

    // Notes
    if (entry.notes) {
      html += `<div class="notes-section">`;
      html += `<div class="notes-tab">Translation Notes</div>`;
      html += `<div class="notes-content">${renderMarkdown(entry.notes)}</div>`;
      html += `</div>`;
    }

    html += '</div>'; // close .page-scroll
    div.innerHTML = html;
    return div;
  }

  // ─── Build all pages for StPageFlip ───
  function buildAllPages() {
    bookContainer.innerHTML = '';

    // Page 0: Cover
    bookContainer.appendChild(buildCoverPage());

    // Pages 1..count: Chapter pages
    const currentBook = BOOKS.find(b => b.id === currentBookId);
    for (let i = 1; i <= currentBook.count; i++) {
      bookContainer.appendChild(buildChapterPage(currentBookId, i));
    }
  }

  // ─── Keep render in sync on resize/rotation ───
  function syncPageMode() {
    if (pageFlip) { try { pageFlip.update(); } catch (e) {} }
  }

  // ─── Init StPageFlip ───
  function initPageFlip() {
    const allPages = Array.from(bookContainer.querySelectorAll('.stf__item'));

    pageFlip = new St.PageFlip(bookContainer, {
      width: 400,
      height: 560,
      size: 'stretch',
      minWidth: 280,
      maxWidth: 500,
      minHeight: 380,
      maxHeight: 2000,
      drawShadow: true,
      flippingTime: 800,
      usePortrait: true,
      startZIndex: 5,
      autoSize: true,
      maxShadowOpacity: 0.5,
      showCover: false,
      mobileScrollSupport: true,
      swipeDistance: 30,
      clickEventForward: false,
      useMouseEvents: false,
      showPageCorners: true,
      disableFlipByClick: true
    });

    lastLeftIndex = -1;

    // Register BEFORE loadFromHTML: that call synchronously fires the initial
    // 'flip'(0) for the cover spread, and we want Psalm 1 audio shown on open.
    pageFlip.on('flip', (e) => {
      const leftIdx = e.data;
      let revealed = leftIdx;
      // In landscape "spread" mode StPageFlip reports only the LEFT page of the
      // two-page spread (always even). Track direction so audio follows the page
      // just revealed: forward flip reveals the right page (odd), backward reveals
      // the left (even).
      if (pageFlip && pageFlip.getOrientation() === 'landscape') {
        const dir = leftIdx > lastLeftIndex ? 1 : (leftIdx < lastLeftIndex ? -1 : 0);
        // Cover spread is [cover, Psalm 1]: left page 0 is the cover, so the
        // meaningful chapter on the right is always 1.
        revealed = (leftIdx === 0) ? 1 : (dir >= 0 ? leftIdx + 1 : leftIdx);
        const maxChapter = (BOOKS.find(b => b.id === currentBookId) || { count: 0 }).count;
        if (revealed > maxChapter) revealed = maxChapter;
      }
      lastLeftIndex = leftIdx;
      handlePageChange(revealed);
    });

    pageFlip.loadFromHTML(allPages);

    // ─── FORCE single-page (portrait) on ALL viewports ───
    // StPageFlip auto-switches to a 2-up "landscape" spread when the book width
    // reaches 2×minWidth (560px); in that mode turnToNextPage() advances a whole
    // spread = 2 chapters (the skip bug). Override the orientation calculation so
    // it ALWAYS reports portrait → one page is always one chapter, on every screen.
    (function forceSinglePageMode() {
      const render = pageFlip.getRender();
      render.calculateBoundsRect = function () {
        const blockW = this.getBlockWidth();
        const i = blockW / 2;
        const s = this.getBlockHeight() / 2;
        const ratio = this.setting.width / this.setting.height;
        let h = blockW;
        if (h > this.setting.maxWidth) h = this.setting.maxWidth;
        let r = h / ratio;
        if (r > this.getBlockHeight()) { r = this.getBlockHeight(); h = r * ratio; }
        const left = i - h / 2 - h;
        this.boundsRect = { left: left, top: s - r / 2, width: 2 * h, height: r, pageWidth: h };
        return 'portrait';
      };
      pageFlip.update();
    })();

    // Cleanup after flip animation
    pageFlip.on('changeState', (e) => {
      if (e.data === 'read' && pageFlip) {
        setTimeout(() => {
          try {
            const render = pageFlip.getRender();
            render.setFlippingPage(null);
            render.setBottomPage(null);
            render.clearShadow();
          } catch(err) {}
        }, 100);
      }
    });

    setupGestures();
    syncPageMode();
  }

  // ─── Custom tap/swipe gestures (bypass StPageFlip's flaky touch handling) ───
  function setupGestures() {
    // Remove any prior listeners to avoid stacking on rebuild
    if (bookContainer._gestureCleanup) {
      bookContainer._gestureCleanup();
      bookContainer._gestureCleanup = null;
    }

    let touchStart = null;
    let touchMoved = false;
    let lastTouchEnd = 0;

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      // Don't hijack taps on interactive elements (notes tab, etc.)
      if (e.target.closest && e.target.closest('.notes-tab, .notes-content, a, button, input, select, textarea')) {
        touchStart = null;
        return;
      }
      const t = e.touches[0];
      touchStart = { x: t.clientX, y: t.clientY, time: Date.now() };
      touchMoved = false;
    };

    const onTouchMove = (e) => {
      if (!touchStart || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - touchStart.x;
      const dy = t.clientY - touchStart.y;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) touchMoved = true;
      // Allow vertical scroll to pass through for long pages
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (Math.abs(dx) > 10) {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e) => {
      if (!touchStart) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.x;
      const dy = t.clientY - touchStart.y;
      const dt = Date.now() - touchStart.time;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      touchStart = null;
      lastTouchEnd = Date.now();

      // TAP (small movement) — page turn based on which half was tapped
      if (!touchMoved || (absDx < 30 && absDy < 30 && dt < 300)) {
        const blockRect = bookContainer.getBoundingClientRect();
        const midX = blockRect.left + blockRect.width / 2;
        if (t.clientX > midX) {
          pageFlip && pageFlip.turnToNextPage();
        } else {
          pageFlip && pageFlip.turnToPrevPage();
        }
        return;
      }

      // SWIPE — horizontal swipe flips, vertical swipe scrolls (handled natively)
      if (absDx > absDy && absDx > 40) {
        if (dx < 0) {
          pageFlip && pageFlip.turnToNextPage();
        } else {
          pageFlip && pageFlip.turnToPrevPage();
        }
      }
    };

    bookContainer.addEventListener('touchstart', onTouchStart, { passive: true });
    bookContainer.addEventListener('touchmove', onTouchMove, { passive: false });
    bookContainer.addEventListener('touchend', onTouchEnd, { passive: true });

    bookContainer._gestureCleanup = () => {
      bookContainer.removeEventListener('touchstart', onTouchStart);
      bookContainer.removeEventListener('touchmove', onTouchMove);
      bookContainer.removeEventListener('touchend', onTouchEnd);
    };
  }

  // ─── Page change handler ───
  function handlePageChange(pageIndex) {
    currentPageIndex = pageIndex;
    const currentBook = BOOKS.find(b => b.id === currentBookId);
    const label = currentBookId === 'psalms' ? 'Psalm' : 'Proverb';

    // Arrow button enable/disable based on position
    if (pageFlip && pageFlip.getPageCount) {
      const total = pageFlip.getPageCount();
      const cur = pageFlip.getCurrentPageIndex();
      pagePrev.disabled = cur <= 0;
      pageNext.disabled = cur >= total - 1;
    }

    // Page 0 = cover, Page 1 = chapter 1, etc.
    if (pageIndex >= 1 && pageIndex <= currentBook.count) {
      const chapterNum = pageIndex;
      const entry = bookData[currentBookId][chapterNum - 1];
      if (entry) {
        topBarTitle.textContent = `${label} ${entry.num}`;
        updateAudioForChapter(currentBookId, entry.num);
      }
    } else if (pageIndex === 0) {
      topBarTitle.textContent = 'Psalms & Proverbs';
      hideAudioRibbon();
    }
  }

  // ─── Navigate to chapter ───
  function reattachBook() {
    // StPageFlip.destroy() removes #book from the DOM. Re-attach it so a
    // rebuild renders into a live node (otherwise offsetWidth=0 => blank pages).
    const bookWrap = document.getElementById('book-container');
    if (bookWrap && !bookWrap.contains(bookContainer)) {
      bookWrap.appendChild(bookContainer);
    }
  }

  async function navigateToChapter(bookId, chapterNum) {
    if (bookId !== currentBookId) {
      currentBookId = bookId;
      if (pageFlip) {
        pageFlip.destroy();
        pageFlip = null;
      }
      reattachBook();
      buildAllPages();
      initPageFlip();
      // Defer the turn until layout settles (double RAF), then force a re-render
      // so pages are measured at their real size, not 0×0.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (pageFlip) {
          try { pageFlip.update(); } catch (err) {}
          pageFlip.turnToPage(chapterNum);
          handlePageChange(chapterNum);
        }
      }));
      return;
    }
    // Chapter N = page index N (cover offset by 1 from the flip-based index)
    if (pageFlip) {
      pageFlip.turnToPage(chapterNum);
      // turnToPage does not emit a 'flip' event, so update the chrome here
      // (title + audio ribbon) rather than waiting on handlePageChange.
      handlePageChange(chapterNum);
    }
  }

  // ─── Audio ───
  function getAudioFile(bookId, chapterNum) {
    const num = String(chapterNum).padStart(3, '0');
    const label = bookId === 'psalms' ? 'PSALM' : 'PROVERB';
    return `audio/${label}-${num}.mp3`;
  }

  function updateAudioForChapter(bookId, chapterNum) {
    const audioFile = getAudioFile(bookId, chapterNum);
    const label = bookId === 'psalms' ? 'Psalm' : 'Proverb';

    // Check if audio exists by trying to load it
    audioEl.src = audioFile;
    audioEl.load();

    audioEl.onerror = () => {
      // No audio for this chapter
      audioRibbon.classList.add('no-audio');
      audioPlay.disabled = true;
      audioSeek.disabled = true;
      audioTitle.textContent = 'Audio coming soon';
      audioTime.textContent = '';
    };

    audioEl.oncanplay = () => {
      audioRibbon.classList.remove('no-audio');
      audioPlay.disabled = false;
      audioSeek.disabled = false;
      const entry = bookData[bookId][chapterNum - 1];
      const titleParts = entry.title.split(' — ');
      const displayTitle = titleParts.length > 1 ? titleParts.slice(1).join(' — ') : entry.title;
      audioTitle.textContent = `${label} ${chapterNum} — ${displayTitle}`;
    };

    audioEl.onloadedmetadata = () => {
      audioSeek.max = audioEl.duration;
      updateTimeDisplay();
    };

    audioEl.ontimeupdate = () => {
      audioSeek.value = audioEl.currentTime;
      updateTimeDisplay();
    };

    audioEl.onended = () => {
      audioPlay.textContent = '▶';
    };

    currentAudioBook = bookId;
    currentAudioChapter = chapterNum;
    showAudioRibbon();
  }

  function showAudioRibbon() {
    audioRibbon.hidden = false;
  }

  function hideAudioRibbon() {
    audioRibbon.hidden = true;
    if (!audioEl.paused) {
      audioEl.pause();
      audioPlay.textContent = '▶';
    }
  }

  function toggleAudioPlay() {
    if (audioEl.paused) {
      audioEl.play();
      audioPlay.textContent = '⏸';
    } else {
      audioEl.pause();
      audioPlay.textContent = '▶';
    }
  }

  function updateTimeDisplay() {
    const fmt = (s) => {
      if (!s || isNaN(s)) return '0:00';
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return `${m}:${sec.toString().padStart(2, '0')}`;
    };
    audioTime.textContent = `${fmt(audioEl.currentTime)} / ${fmt(audioEl.duration)}`;
  }

  // ─── TOC Overlay ───
  function showTocOverlay() {
    let html = '';
    BOOKS.forEach((book, bookIdx) => {
      html += `<div class="toc-book-title">${book.name}</div>`;
      book.sections.forEach(section => {
        html += `<div class="toc-section-title">${section.name}</div>`;
        for (let n = section.start; n <= section.end; n++) {
          const entry = bookData[book.id] ? bookData[book.id][n - 1] : null;
          if (!entry) continue;
          const available = entry.available;
          const entryClass = available ? 'toc-entry' : 'toc-entry toc-entry-coming';
          html += `<div class="${entryClass}" data-book="${book.id}" data-chapter="${n}">`;
          html += `<span class="psalm-num">${n}</span>`;
          const titleParts = entry.title.split(' — ');
          const displayTitle = titleParts.length > 1 ? titleParts.slice(1).join(' — ') : entry.title;
          html += `<span class="psalm-title-text">${escapeHtml(displayTitle)}</span>`;
          html += `<span class="dot-leaders"></span>`;
          if (available) {
            html += `<span class="psalm-page">${n}</span>`;
          } else {
            html += `<span class="psalm-page" style="color:var(--gold-dim);font-size:11px;font-style:italic;">Soon</span>`;
          }
          html += `</div>`;
        }
      });
      if (bookIdx < BOOKS.length - 1) {
        html += `<div class="toc-book-divider"></div>`;
      }
    });
    tocOverlayContent.innerHTML = html;

    tocOverlayContent.querySelectorAll('.toc-entry').forEach(entry => {
      entry.addEventListener('click', (e) => {
        e.stopPropagation();
        const bookId = entry.dataset.book;
        const chapterNum = parseInt(entry.dataset.chapter);
        const item = bookData[bookId] ? bookData[bookId][chapterNum - 1] : null;
        if (item && item.available) {
          tocOverlay.hidden = true;
          navigateToChapter(bookId, chapterNum);
        }
      });
    });

    tocOverlay.hidden = false;
  }

  // ─── Search ───
  function openSearch() {
    searchOverlay.hidden = false;
    searchInput.value = '';
    searchResults.innerHTML = '';
    searchInput.focus();
  }

  function closeSearch() {
    searchOverlay.hidden = true;
  }

  function performSearch(query) {
    if (!query || query.length < 1) {
      searchResults.innerHTML = '';
      return;
    }
    const q = query.toLowerCase();
    let results = [];
    BOOKS.forEach(book => {
      bookData[book.id].forEach(entry => {
        if (!entry.available) return;
        if (String(entry.num).includes(q) || entry.title.toLowerCase().includes(q)) {
          results.push({ bookId: book.id, ...entry });
        }
      });
    });
    if (results.length === 0) {
      searchResults.innerHTML = '<p style="text-align:center;color:var(--gold-dim);font-style:italic;">No results</p>';
      return;
    }
    let html = '';
    results.forEach(r => {
      const label = r.bookId === 'psalms' ? 'Psalm' : 'Proverb';
      const titleParts = r.title.split(' — ');
      const displayTitle = titleParts.length > 1 ? titleParts.slice(1).join(' — ') : r.title;
      html += `<div class="search-result-item" data-book="${r.bookId}" data-chapter="${r.num}">`;
      html += `<span class="search-result-num">${label} ${r.num}</span>`;
      html += `<span class="search-result-title">${escapeHtml(displayTitle)}</span>`;
      html += `</div>`;
    });
    searchResults.innerHTML = html;
    searchResults.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const bookId = item.dataset.book;
        const chapterNum = parseInt(item.dataset.chapter);
        closeSearch();
        navigateToChapter(bookId, chapterNum);
      });
    });
  }

  // ─── Open / Close book ───
  async function openBook() {
    if (isBookOpen) return;
    isBookOpen = true;
    coverScreen.style.display = 'none';
    loadingIndicator.hidden = false;
    bookScreen.hidden = false;

    try {
      buildAllPages();
      initPageFlip();
    } catch (err) {
      console.error('openBook error:', err);
    }

    loadingIndicator.hidden = true;
  }

  function closeBook() {
    isBookOpen = false;
    bookScreen.hidden = true;
    coverScreen.style.display = '';
    if (pageFlip) {
      try { pageFlip.getUI().removeHandlers(); } catch (err) {}
      pageFlip.destroy();
      pageFlip = null;
      reattachBook();
    }
    hideAudioRibbon();
    topBarTitle.textContent = 'Psalms & Proverbs';
  }

  // ─── Event listeners ───
  // Translation notes tab — delegated (works on touch + mouse)
  bookContainer.addEventListener('click', (e) => {
    const tab = e.target.closest && e.target.closest('.notes-tab');
    if (tab) {
      const content = tab.nextElementSibling;
      if (content && content.classList.contains('notes-content')) {
        content.classList.toggle('open');
      }
    }
  });

  bookCover.addEventListener('click', openBook);
  bookCover.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBook(); }
  });
  closeBookBtn.addEventListener('click', closeBook);
  tocBtn.addEventListener('click', showTocOverlay);
  tocCloseBtn.addEventListener('click', () => { tocOverlay.hidden = true; });
  searchBtn.addEventListener('click', openSearch);
  textSizeBtn.addEventListener('click', nextTextScale);
  searchClose.addEventListener('click', closeSearch);
  searchInput.addEventListener('input', (e) => performSearch(e.target.value));
  audioPlay.addEventListener('click', toggleAudioPlay);
  audioSeek.addEventListener('input', () => { audioEl.currentTime = audioSeek.value; });
  pagePrev.addEventListener('click', () => { pageFlip && pageFlip.turnToPrevPage(); });
  pageNext.addEventListener('click', () => { pageFlip && pageFlip.turnToNextPage(); });
  speedBtn.addEventListener('click', () => {
    const speeds = [1, 1.25, 1.5, 0.75];
    const idx = speeds.indexOf(playbackRate);
    playbackRate = speeds[(idx + 1) % speeds.length];
    audioEl.playbackRate = playbackRate;
    speedBtn.textContent = playbackRate + '×';
  });

  // Keyboard nav
  document.addEventListener('keydown', (e) => {
    if (!isBookOpen) return;
    if (e.key === 'Escape') {
      if (!tocOverlay.hidden) { tocOverlay.hidden = true; return; }
      if (!searchOverlay.hidden) { closeSearch(); return; }
      closeBook();
    }
    if (e.key === 'ArrowLeft' && pageFlip) pageFlip.turnToPrevPage();
    if (e.key === 'ArrowRight' && pageFlip) pageFlip.turnToNextPage();
  });

  // Keep single-page/landscape mode in sync on resize / rotation
  window.addEventListener('resize', syncPageMode);
  window.addEventListener('orientationchange', syncPageMode);

  // ─── Init ───
  // Restore persisted text size before first paint of any chapter
  try {
    const saved = parseInt(localStorage.getItem(TEXT_SIZE_KEY) || '0', 10);
    if (!isNaN(saved) && saved >= 0 && saved < TEXT_SCALES.length) {
      textScaleIndex = saved;
      applyTextScale(TEXT_SCALES[saved]);
      updateTextSizeLabel();
    }
  } catch (e) {}

  loadData().then(() => {
    console.log(`Loaded ${bookData.psalms.length} psalms, ${bookData.proverbs.length} proverbs`);
  }).catch(err => {
    console.error('Failed to load data.json:', err);
  });

  // Service worker — auto-reload once when a new version is live, so users
  // get fixes without manually clearing cache or closing the app.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'activated' && navigator.serviceWorker.controller) {
            if (!sessionStorage.getItem('sw-reloaded')) {
              sessionStorage.setItem('sw-reloaded', '1');
              location.reload();
            }
          }
        });
      });
    }).catch(err => {
      console.error('SW registration failed:', err);
    });
  }

})();