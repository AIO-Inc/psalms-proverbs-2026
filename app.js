/* ═══════════════════════════════════════════════════════════════
   PSALMS & PROVERBS PWA — Application Logic
   Vanilla JS + StPageFlip
   ═══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  // ─── Constants ───
  const PSALM_COUNT = 150;
  const PROVERB_COUNT = 31;

  // Proverb titles (standard chapter themes — will be replaced with Skywalker's titles when available)
  const PROVERB_TITLES = [
    'The Fear of the Source Is the Beginning of Knowledge',
    'The Benefit of Wisdom',
    'Trust in the Source with All Your Heart',
    'Above All Else, Guard Your Heart',
    'Avoid the Forbidden Woman',
    'The Sluggard',
    'The Adulteress',
    'Wisdom Calls Out',
    'Wisdom Has Built Her House',
    'The Righteous and the Wicked',
    'Honest Scales',
    'The Root of the Righteous',
    'Whoever Walks with the Wise Becomes Wise',
    'The Fear of the Source Is a Fountain of Life',
    'A Gentle Answer Turns Away Wrath',
    'Commit Your Work to the Source',
    'A Friend Loves at All Times',
    'The Name of the Source Is a Strong Tower',
    'Better to Be Poor and Walk in Integrity',
    'Wine Is a Mocker',
    'The King\u2019s Heart Is in the Hand of the Source',
    'Train Up a Child',
    'Buy Truth and Do Not Sell It',
    'By Wisdom a House Is Built',
    'A Soft Answer Turns Away Wrath (Royal Proverbs)',
    'Like a Lame Man\u2019s Legs',
    'Iron Sharpens Iron',
    'The Rich Man Is Wise in His Own Eyes',
    'A Man of Violence',
    'The Words of Agur',
    'The Woman Who Fears the Source'
  ];

  // Two-book structure
  const BOOKS = [
    {
      id: 'psalms',
      name: 'The Psalms',
      sections: [
        { name: 'Book One', range: 'Psalms 1\u201341', start: 1, end: 41 },
        { name: 'Book Two', range: 'Psalms 42\u201372', start: 42, end: 72 },
        { name: 'Book Three', range: 'Psalms 73\u201389', start: 73, end: 89 },
        { name: 'Book Four', range: 'Psalms 90\u2013106', start: 90, end: 106 },
        { name: 'Book Five', range: 'Psalms 107\u2013150', start: 107, end: 150 }
      ],
      count: PSALM_COUNT
    },
    {
      id: 'proverbs',
      name: 'The Proverbs',
      sections: [
        { name: 'Chapters 1\u201331', start: 1, end: 31 }
      ],
      count: PROVERB_COUNT
    }
  ];

  // ─── State ───
  let bookData = {};  // { psalms: [...], proverbs: [...] }
  let pageFlip = null;
  let currentPageIndex = 0;
  let audioEl = null;
  let currentSpeed = 1;
  let currentBookId = 'psalms';  // which book is being browsed

  // ─── DOM refs ───
  const coverScreen = document.getElementById('cover-screen');
  const bookCover = document.getElementById('book-cover');
  const bookScreen = document.getElementById('book-screen');
  const closeBookBtn = document.getElementById('close-book');
  const searchBtn = document.getElementById('search-btn');
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchClose = document.getElementById('search-close');
  const bookContainer = document.getElementById('book');
  const topBarTitle = document.getElementById('top-bar-title');
  const audioRibbon = document.getElementById('audio-ribbon');
  const audioPlay = document.getElementById('audio-play');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const audioTitle = document.getElementById('audio-title');
  const audioCurrent = document.getElementById('audio-current');
  const audioDuration = document.getElementById('audio-duration');
  const audioSeek = document.getElementById('audio-seek');
  const speedBtn = document.getElementById('speed-btn');
  const audioComingSoon = document.getElementById('audio-coming-soon');
  const loadingIndicator = document.getElementById('loading-indicator');

  // ═══════════════════════════════════════════════════════════════
  // MARKDOWN PARSER
  // ═══════════════════════════════════════════════════════════════

  function parseMarkdown(md) {
    const lines = md.split('\n');
    let title = '';
    let subtitle = '';
    let sections = [];
    let currentSection = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Title from H1
      if (line.startsWith('# ') && !title) {
        title = line.replace(/^#\s+/, '').trim();
        continue;
      }

      // Subtitle — first italic line after title
      if (!subtitle && line.startsWith('*') && line.endsWith('*') && !line.includes('**')) {
        subtitle = line.replace(/^\*|\*$/g, '').trim();
        continue;
      }

      // Section separator
      if (line.trim() === '---') {
        sections.push(currentSection);
        currentSection = [];
        continue;
      }

      currentSection.push(line);
    }
    if (currentSection.length > 0) sections.push(currentSection);

    const nonEmpty = sections
      .map(s => s.join('\n').trim())
      .filter(text => text.length > 0);

    const body = nonEmpty[0] || '';
    const notes = nonEmpty.length > 1 ? nonEmpty[nonEmpty.length - 1] : '';

    return { title, subtitle, body, notes };
  }

  // ═══════════════════════════════════════════════════════════════
  // MARKDOWN → HTML RENDERER
  // ═══════════════════════════════════════════════════════════════

  function renderMarkdown(text) {
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

    const paragraphs = html.split(/\n\n+/);
    return paragraphs
      .map(p => {
        p = p.trim();
        if (!p) return '';
        p = p.replace(/\n/g, '<br>');
        return '<p>' + p + '</p>';
      })
      .join('');
  }

  // ═══════════════════════════════════════════════════════════════
  // LOAD PSALMS
  // ═══════════════════════════════════════════════════════════════

  async function loadPsalms() {
    const promises = [];
    for (let i = 1; i <= PSALM_COUNT; i++) {
      const num = String(i).padStart(3, '0');
      promises.push(
        fetch(`psalms/PSALM-${num}.md`)
          .then(r => {
            if (!r.ok) throw new Error(`Failed to load PSALM-${num}.md`);
            return r.text();
          })
          .then(md => {
            const parsed = parseMarkdown(md);
            const titleMatch = parsed.title.match(/^PSALM\s+\d+\s+\u2014\s+(.+)$/i);
            const psalmTitle = titleMatch ? titleMatch[1] : parsed.title;
            return {
              num: i,
              title: psalmTitle,
              subtitle: parsed.subtitle,
              body: parsed.body,
              notes: parsed.notes,
              available: true
            };
          })
          .catch(err => {
            console.error(`Error loading Psalm ${i}:`, err);
            return {
              num: i,
              title: '( unavailable )',
              subtitle: '',
              body: '<p>This psalm could not be loaded.</p>',
              notes: '',
              available: false
            };
          })
      );
    }
    bookData.psalms = await Promise.all(promises);
    bookData.psalms.sort((a, b) => a.num - b.num);
  }

  // ═══════════════════════════════════════════════════════════════
  // LOAD PROVERBS — attempts fetch, gracefully handles missing files
  // ═══════════════════════════════════════════════════════════════

  async function loadProverbs() {
    const promises = [];
    for (let i = 1; i <= PROVERB_COUNT; i++) {
      const num = String(i).padStart(3, '0');
      promises.push(
        fetch(`proverbs/PROVERB-${num}.md`)
          .then(r => {
            if (!r.ok) throw new Error(`PROVERB-${num}.md not found`);
            return r.text();
          })
          .then(md => {
            const parsed = parseMarkdown(md);
            const titleMatch = parsed.title.match(/^PROVERB\s+\d+\s+\u2014\s+(.+)$/i);
            const proverbTitle = titleMatch ? titleMatch[1] : parsed.title;
            return {
              num: i,
              title: proverbTitle,
              subtitle: parsed.subtitle,
              body: parsed.body,
              notes: parsed.notes,
              available: true
            };
          })
          .catch(() => {
            // File doesn't exist yet — use placeholder title
            return {
              num: i,
              title: PROVERB_TITLES[i - 1] || `Proverb ${i}`,
              subtitle: '',
              body: '',
              notes: '',
              available: false
            };
          })
      );
    }
    bookData.proverbs = await Promise.all(promises);
    bookData.proverbs.sort((a, b) => a.num - b.num);
  }

  // ═══════════════════════════════════════════════════════════════
  // AUDIO — check availability
  // ═══════════════════════════════════════════════════════════════

  function getAudioFile(bookId, chapterNum) {
    // Currently only Psalm 23 has audio
    if (bookId === 'psalms' && chapterNum === 23) {
      return 'audio/PSALM-023.mp3';
    }
    // Proverbs audio not yet available
    return null;
  }

  // ═══════════════════════════════════════════════════════════════
  // PAGE BUILDERS
  // ═══════════════════════════════════════════════════════════════

  function buildCoverPage() {
    const div = document.createElement('div');
    div.className = 'page page-cover stf__item';
    div.dataset.density = 'hard';
    div.innerHTML = `
      <div class="cover-icon-large">
        <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
          <path d="M8 10C8 8.9 8.9 8 10 8H22V40H10C8.9 40 8 39.1 8 38V10Z" stroke="#c9a84c" stroke-width="1.5" fill="none" opacity="0.7"/>
          <path d="M40 10C40 8.9 39.1 8 38 8H26V40H38C39.1 40 40 39.1 40 38V10Z" stroke="#c9a84c" stroke-width="1.5" fill="none" opacity="0.7"/>
          <path d="M24 8V40" stroke="#c9a84c" stroke-width="1" opacity="0.4"/>
          <path d="M14 16L18 16M14 20L18 20M14 24L18 24M14 28L18 28" stroke="#c9a84c" stroke-width="0.8" opacity="0.5"/>
          <path d="M30 16L34 16M30 20L34 20M30 24L34 24M30 28L34 28" stroke="#c9a84c" stroke-width="0.8" opacity="0.5"/>
        </svg>
      </div>
      <h2>PSALMS<br>& PROVERBS</h2>
      <p class="cover-subtitle-large">2026 Rendering</p>
      <div class="cover-divider-large"></div>
      <p class="cover-credit">The Psalms and Proverbs in Today's Rendering</p>
      <div class="cover-divider-large"></div>
      <p class="cover-credit" style="margin-top:10px;">Source: Hebrew Text</p>
    `;
    return div;
  }

  function buildTOCPage() {
    const div = document.createElement('div');
    div.className = 'page page-toc stf__item';

    let html = '<div class="toc-header"><h2>Table of Contents</h2><div class="toc-decoration"></div></div>';

    // Render each book
    BOOKS.forEach((book, bookIdx) => {
      html += `<div class="toc-book-section">`;
      html += `<div class="toc-book-title">${book.name}</div>`;

      book.sections.forEach(section => {
        html += `<div class="toc-section">`;
        html += `<div class="toc-section-title">${section.name}</div>`;
        for (let n = section.start; n <= section.end; n++) {
          const entry = bookData[book.id] ? bookData[book.id][n - 1] : null;
          if (!entry) continue;

          const available = entry.available;
          const entryClass = available ? 'toc-entry' : 'toc-entry toc-entry-coming';
          const dataAttr = `data-book="${book.id}" data-chapter="${n}"`;

          html += `<div class="${entryClass}" ${dataAttr}>`;
          html += `<span class="psalm-num">${n}</span>`;
          if (available) {
            html += `<span class="psalm-title-text">${escapeHtml(entry.title)}</span>`;
            html += `<span class="dot-leaders"></span>`;
            html += `<span class="psalm-page">${n}</span>`;
          } else {
            html += `<span class="psalm-title-text psalm-title-coming">${escapeHtml(entry.title)}</span>`;
            html += `<span class="dot-leaders"></span>`;
            html += `<span class="psalm-page psalm-page-coming">Soon</span>`;
          }
          html += `</div>`;
        }
        html += `</div>`;
      });

      html += `</div>`;

      // Add divider between books
      if (bookIdx < BOOKS.length - 1) {
        html += `<div class="toc-book-divider"></div>`;
      }
    });

    div.innerHTML = html;

    // Attach click handlers — only for available entries
    div.querySelectorAll('.toc-entry').forEach(entry => {
      entry.addEventListener('click', (e) => {
        e.stopPropagation();
        const bookId = entry.dataset.book;
        const chapterNum = parseInt(entry.dataset.chapter);
        const item = bookData[bookId] ? bookData[bookId][chapterNum - 1] : null;
        if (item && item.available) {
          navigateToChapter(bookId, chapterNum);
        }
      });
    });

    return div;
  }

  function buildChapterPage(bookId, chapterNum) {
    const entry = bookData[bookId] ? bookData[bookId][chapterNum - 1] : null;
    if (!entry) return buildTOCPage();

    const div = document.createElement('div');
    div.className = 'page page-psalm stf__item';
    div.dataset.book = bookId;
    div.dataset.chapter = chapterNum;

    const label = bookId === 'psalms' ? 'Psalm' : 'Proverb';

    let html = '';

    // Header
    html += `<div class="psalm-header">`;
    html += `<h3>${label} ${entry.num}</h3>`;
    html += `<div class="psalm-title-line"></div>`;
    html += `</div>`;
    html += `<div class="psalm-subtitle">${escapeHtml(entry.title)}</div>`;
    if (entry.subtitle) {
      html += `<div class="psalm-subtitle">${escapeHtml(entry.subtitle)}</div>`;
    }

    // Body — or "Coming soon" placeholder
    if (entry.available && entry.body) {
      html += `<div class="psalm-body">${renderMarkdown(entry.body)}</div>`;
    } else {
      html += `<div class="psalm-body psalm-body-coming">`;
      html += `<p style="text-align:center; font-style:italic; color:var(--ink-light); margin-top:40px;">Coming soon</p>`;
      html += `<p style="text-align:center; font-size:12px; color:var(--gold-dim); margin-top:8px;">This chapter will be added when the rendering is ready.</p>`;
      html += `</div>`;
    }

    // Translation notes (collapsible)
    if (entry.notes) {
      html += `<div class="notes-section">`;
      html += `<div class="notes-tab" onclick="this.nextElementSibling.classList.toggle('open')">Translation Notes</div>`;
      html += `<div class="notes-content">${renderMarkdown(entry.notes)}</div>`;
      html += `</div>`;
    }

    div.innerHTML = html;
    return div;
  }

  // ─── Escape helper ───
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ═══════════════════════════════════════════════════════════════
  // BUILD ALL PAGES (for StPageFlip)
  // ═══════════════════════════════════════════════════════════════

  function buildAllPages() {
    bookContainer.innerHTML = '';

    // Page 0: Cover (hard page)
    const coverPage = buildCoverPage();
    bookContainer.appendChild(coverPage);

    // Page 1: TOC
    const tocPage = buildTOCPage();
    bookContainer.appendChild(tocPage);

    // Pages 2..count+1: Chapter pages for current book
    const currentBook = BOOKS.find(b => b.id === currentBookId);
    const chapterCount = currentBook.count;

    for (let i = 1; i <= chapterCount; i++) {
      const page = buildChapterPage(currentBookId, i);
      bookContainer.appendChild(page);
    }

    // Closing page
    const closingDiv = document.createElement('div');
    closingDiv.className = 'page page-cover stf__item';
    closingDiv.dataset.density = 'hard';
    const bookLabel = currentBookId === 'psalms' ? 'The Psalms' : 'The Proverbs';
    const countLabel = currentBookId === 'psalms' ? '150 Psalms \u00b7 5 Books' : '31 Chapters';
    closingDiv.innerHTML = `
      <div class="cover-divider-large" style="margin: 20px 0;"></div>
      <h2 style="font-size: 20px;">${bookLabel}</h2>
      <p class="cover-subtitle-large">Complete</p>
      <div class="cover-divider-large"></div>
      <p class="cover-credit">${countLabel}</p>
      <p class="cover-credit" style="margin-top:10px;">Rendered 2026</p>
      <div class="cover-divider-large" style="margin-top: 20px;"></div>
      <p class="cover-credit" style="font-size:10px; margin-top:16px; opacity:0.6;">Source: Hebrew Text<br>Standing corrections applied</p>
    `;
    bookContainer.appendChild(closingDiv);
  }

  // ═══════════════════════════════════════════════════════════════
  // ST PAGE FLIP INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  function initPageFlip() {
    const allPages = Array.from(bookContainer.querySelectorAll('.stf__item'));

    pageFlip = new St.PageFlip(bookContainer, {
      width: 400,
      height: 560,
      size: 'stretch',
      minWidth: 280,
      maxWidth: 500,
      minHeight: 380,
      maxHeight: 700,
      drawShadow: true,
      flippingTime: 800,
      usePortrait: true,
      startZIndex: 5,
      autoSize: true,
      maxShadowOpacity: 0.5,
      showCover: true,
      mobileScrollSupport: true,
      swipeDistance: 25,
      clickEventForward: false,
      useMouseEvents: true,
      showPageCorners: true,
      disableFlipByClick: false
    });

    pageFlip.loadFromHtml(allPages);

    pageFlip.on('flip', (e) => {
      const pageIndex = e.data;
      handlePageChange(pageIndex);
    });

    pageFlip.on('changeState', (e) => {
      // 'flipping', 'read', etc.
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // PAGE CHANGE HANDLER
  // ═══════════════════════════════════════════════════════════════

  function handlePageChange(pageIndex) {
    currentPageIndex = pageIndex;

    const currentBook = BOOKS.find(b => b.id === currentBookId);
    const chapterCount = currentBook.count;
    const label = currentBookId === 'psalms' ? 'Psalm' : 'Proverb';

    // Page layout: 0=cover, 1=TOC, 2=chapter 1, ..., count+1=chapter count, count+2=closing
    let chapterNum = null;
    if (pageIndex >= 2 && pageIndex <= chapterCount + 1) {
      chapterNum = pageIndex - 1;
    }

    if (chapterNum) {
      const entry = bookData[currentBookId] ? bookData[currentBookId][chapterNum - 1] : null;
      if (entry) {
        topBarTitle.textContent = `${label} ${entry.num}`;
        updateAudioForChapter(currentBookId, entry.num);
      }
    } else if (pageIndex === 0) {
      topBarTitle.textContent = 'Psalms & Proverbs';
      hideAudioRibbon();
    } else if (pageIndex === 1) {
      topBarTitle.textContent = 'Table of Contents';
      hideAudioRibbon();
    } else {
      topBarTitle.textContent = 'Psalms & Proverbs';
      hideAudioRibbon();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════

  function navigateToChapter(bookId, chapterNum) {
    // If switching books, rebuild pages
    if (bookId !== currentBookId) {
      currentBookId = bookId;
      // Destroy current page flip, rebuild, then navigate
      if (pageFlip) {
        pageFlip.destroy();
        pageFlip = null;
      }
      buildAllPages();
      initPageFlip();
    }

    // Chapter N is at page index (N + 1)
    const targetPage = chapterNum + 1;
    if (pageFlip) {
      pageFlip.flip(targetPage, 'top');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // AUDIO PLAYER
  // ═══════════════════════════════════════════════════════════════

  function updateAudioForChapter(bookId, chapterNum) {
    const audioFile = getAudioFile(bookId, chapterNum);
    const label = bookId === 'psalms' ? 'Psalm' : 'Proverb';

    if (audioFile) {
      audioRibbon.hidden = false;
      audioComingSoon.hidden = true;
      document.querySelector('.ribbon-body').style.display = '';
      document.querySelector('.ribbon-top').style.display = '';
      audioTitle.textContent = `${label} ${chapterNum}`;

      if (!audioEl) {
        audioEl = new Audio();
        audioEl.preload = 'metadata';

        audioEl.addEventListener('loadedmetadata', () => {
          audioDuration.textContent = formatTime(audioEl.duration);
          audioSeek.max = audioEl.duration;
        });

        audioEl.addEventListener('timeupdate', () => {
          audioCurrent.textContent = formatTime(audioEl.currentTime);
          audioSeek.value = audioEl.currentTime;
        });

        audioEl.addEventListener('ended', () => {
          showPlayIcon();
        });
      }

      const fileBase = bookId === 'psalms'
        ? `PSALM-${String(chapterNum).padStart(3, '0')}`
        : `PROVERB-${String(chapterNum).padStart(3, '0')}`;

      if (audioEl.src && audioEl.src.includes(fileBase)) {
        return;
      }

      audioEl.src = audioFile;
      audioEl.load();
      audioEl.playbackRate = currentSpeed;
      showPlayIcon();
    } else {
      // Show "coming soon" ribbon
      audioRibbon.hidden = false;
      audioComingSoon.hidden = false;
      document.querySelector('.ribbon-body').style.display = 'none';
      document.querySelector('.ribbon-top').style.display = 'none';

      if (audioEl) {
        audioEl.pause();
      }
    }
  }

  function hideAudioRibbon() {
    audioRibbon.hidden = true;
    if (audioEl) {
      audioEl.pause();
    }
    showPlayIcon();
  }

  function showPlayIcon() {
    playIcon.hidden = false;
    pauseIcon.hidden = true;
  }

  function showPauseIcon() {
    playIcon.hidden = true;
    pauseIcon.hidden = false;
  }

  function toggleAudioPlay() {
    if (!audioEl || !audioEl.src) return;

    if (audioEl.paused) {
      audioEl.play().then(() => {
        showPauseIcon();
      }).catch(err => {
        console.error('Audio play failed:', err);
      });
    } else {
      audioEl.pause();
      showPlayIcon();
    }
  }

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  // Audio event handlers
  audioPlay.addEventListener('click', toggleAudioPlay);

  audioSeek.addEventListener('input', () => {
    if (audioEl && audioEl.duration) {
      audioEl.currentTime = parseFloat(audioSeek.value);
    }
  });

  speedBtn.addEventListener('click', () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const currentIdx = speeds.indexOf(currentSpeed);
    const nextIdx = (currentIdx + 1) % speeds.length;
    currentSpeed = speeds[nextIdx];
    speedBtn.textContent = currentSpeed + 'x';
    speedBtn.dataset.speed = currentSpeed;
    if (audioEl) {
      audioEl.playbackRate = currentSpeed;
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // COVER OPEN / CLOSE
  // ═══════════════════════════════════════════════════════════════

  let isBookOpen = false;

  async function openBook() {
    if (isBookOpen) return;
    isBookOpen = true;

    bookCover.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
    bookCover.style.transform = 'scale(1.08)';

    await new Promise(r => setTimeout(r, 200));

    coverScreen.classList.add('fade-out');
    bookScreen.hidden = false;

    await new Promise(r => setTimeout(r, 400));

    coverScreen.style.display = 'none';
    loadingIndicator.hidden = false;

    // Load both books if not already loaded
    if (!bookData.psalms) {
      await loadPsalms();
    }
    if (!bookData.proverbs) {
      await loadProverbs();
    }

    buildAllPages();
    initPageFlip();

    loadingIndicator.hidden = true;
    bookCover.style.transform = '';
  }

  function closeBook() {
    if (!isBookOpen) return;
    isBookOpen = false;

    bookScreen.hidden = true;
    coverScreen.style.display = '';
    coverScreen.classList.remove('fade-out');

    if (pageFlip) {
      pageFlip.destroy();
      pageFlip = null;
    }
    bookContainer.innerHTML = '';

    hideAudioRibbon();
    topBarTitle.textContent = 'Psalms & Proverbs';
  }

  bookCover.addEventListener('click', openBook);
  bookCover.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openBook();
    }
  });

  closeBookBtn.addEventListener('click', closeBook);

  // ═══════════════════════════════════════════════════════════════
  // SEARCH — searches both Psalms and Proverbs
  // ═══════════════════════════════════════════════════════════════

  function openSearch() {
    searchOverlay.hidden = false;
    searchInput.value = '';
    renderSearchResults('');
    setTimeout(() => searchInput.focus(), 100);
  }

  function closeSearch() {
    searchOverlay.hidden = true;
  }

  function renderSearchResults(query) {
    const q = query.toLowerCase().trim();

    if (!q) {
      // Show all — grouped by book
      let html = '';
      BOOKS.forEach(book => {
        html += `<div class="search-book-label">${book.name}</div>`;
        const items = bookData[book.id] || [];
        items.forEach(entry => {
          if (!entry.available) {
            // Show greyed out
            html += `<div class="search-result-item search-result-coming">`;
            html += `<span class="search-result-num">${entry.num}</span>`;
            html += `<span class="search-result-title">${escapeHtml(entry.title)}</span>`;
            html += `<span class="search-result-book">Coming soon</span>`;
            html += `</div>`;
          } else {
            html += `<div class="search-result-item" data-book="${book.id}" data-chapter="${entry.num}">`;
            html += `<span class="search-result-num">${entry.num}</span>`;
            html += `<span class="search-result-title">${escapeHtml(entry.title)}</span>`;
            html += `</div>`;
          }
        });
      });
      searchResults.innerHTML = html;
    } else {
      // Filter across both books
      let html = '';
      let hasResults = false;

      BOOKS.forEach(book => {
        const items = (bookData[book.id] || []).filter(entry => {
          return entry.available && (
            String(entry.num).includes(q) ||
            entry.title.toLowerCase().includes(q)
          );
        });

        if (items.length > 0) {
          hasResults = true;
          html += `<div class="search-book-label">${book.name}</div>`;
          items.forEach(entry => {
            html += `<div class="search-result-item" data-book="${book.id}" data-chapter="${entry.num}">`;
            html += `<span class="search-result-num">${entry.num}</span>`;
            html += `<span class="search-result-title">${escapeHtml(entry.title)}</span>`;
            html += `</div>`;
          });
        }
      });

      if (!hasResults) {
        searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
        return;
      }

      searchResults.innerHTML = html;
    }

    // Attach click handlers
    searchResults.querySelectorAll('.search-result-item[data-book]').forEach(item => {
      item.addEventListener('click', () => {
        const bookId = item.dataset.book;
        const chapterNum = parseInt(item.dataset.chapter);
        closeSearch();
        navigateToChapter(bookId, chapterNum);
      });
    });
  }

  searchBtn.addEventListener('click', openSearch);
  searchClose.addEventListener('click', closeSearch);
  searchInput.addEventListener('input', () => {
    renderSearchResults(searchInput.value);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!searchOverlay.hidden) {
        closeSearch();
      } else if (isBookOpen) {
        closeBook();
      }
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // SERVICE WORKER REGISTRATION
  // ═══════════════════════════════════════════════════════════════

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.error('SW registration failed:', err));
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // PRELOAD DATA (while cover is showing)
  // ═══════════════════════════════════════════════════════════════

  loadPsalms().then(() => {
    console.log(`Preloaded ${bookData.psalms.length} psalms`);
  }).catch(err => {
    console.error('Psalm preload error:', err);
  });

  loadProverbs().then(() => {
    console.log(`Preloaded ${bookData.proverbs.length} proverbs`);
  }).catch(err => {
    console.error('Proverb preload error:', err);
  });

})();