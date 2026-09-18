/* ═══════════════════════════════════════════════════════════════
   PSALMS & PROVERBS PWA — Application Logic
   Vanilla JS + StPageFlip
   ═══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  // ─── Constants ───
  const PSALM_COUNT = 150;
  const PROVERB_COUNT = 31;

  // Psalm titles (embedded from INDEX.md — no fetch needed for TOC)
  const PSALM_TITLES = [
    'Two Roads, One Life',
    'The Kings Are Laughing, and So Is He',
    'I Slept Anyway',
    'Lie Down in Peace',
    'Morning Watch',
    'The Bed Is Wet with Tears',
    'He Falls in His Own Pit',
    'What Is Man?',
    'He Doesn\'t Forget the Cry of the Poor',
    'Why Are You Standing So Far Away?',
    'Don\'t Fly Away',
    'When Everyone Is Lying',
    'How Long?',
    'The Fool Says in His Heart',
    'Who Gets to Stay?',
    'You Will Not Abandon Me to the Grave',
    'Hide Me in the Shadow of Your Wings',
    'He Reached Down',
    'Two Books, Same Author',
    'Some Trust in Horses',
    'You Gave Him What He Asked',
    'My God, My God, Why?',
    'The Shepherd',
    'Lift Up Your Heads, You Gates',
    'Remember Not the Sins of My Youth',
    'Test Me',
    'One Thing',
    'Don\'t Be Silent to Me',
    'The Voice',
    'Weeping Stays the Night, Joy Comes in the Morning',
    'Into Your Hands',
    'When I Kept Silent',
    'He Spoke, and It Was',
    'Taste and See',
    'Fight My Fight',
    'In Your Light We See Light',
    'Don\'t Get Heated',
    'My Wounds Stink',
    'A Handbreadth',
    'Out of the Mud',
    'The Friend Who Ate My Bread',
    'As the Deer Pants',
    'Send Out Your Light',
    'Wake Up! Why Are You Sleeping?',
    'The Wedding Song',
    'Be Still and Know',
    'Clap Your Hands',
    'Walk Around the City',
    'You Can\'t Take It With You',
    'I Don\'t Need Your Bulls',
    'Create in Me a Clean Heart',
    'A Green Olive Tree',
    'The Fool, Second Edition',
    'By Your Name',
    'Cast Your Burden',
    'You Keep My Tears in a Bottle',
    'Awake, My Glory',
    'Break Their Teeth',
    'The Dogs Come Back at Night',
    'Through God We Will Do Valiantly',
    'From the End of the Earth',
    'Only',
    'Better Than Life',
    'The Secret Arrows',
    'You Crown the Year',
    'Come and Hear What He Did for Me',
    'Let Your Face Shine on Us — So That',
    'Father of the Fatherless',
    'The Waters Have Come Up to My Neck',
    'Hurry',
    'Even When I\'m Old and Gray',
    'The King Who Hears the Poor',
    'I Almost Slipped',
    'They Burned Your House',
    'I Choose the Time',
    'The Warriors Couldn\'t Lift Their Hands',
    'Has His Right Hand Changed?',
    'So the Next Generation Would Know',
    'How Long, Source? Forever?',
    'Restore Us',
    'Open Your Mouth Wide',
    'You Are Gods — and You Will Die Like Men',
    'So They Will Know Your Name',
    'Better Is One Day',
    'Loyal-Love and Truth Meet',
    'Give Me an Undivided Heart',
    'This One Was Born There',
    'Darkness Is My Closest Friend',
    'Where Is the Promise?',
    'Teach Us to Number Our Days',
    'Under His Wings',
    'Still Bearing Fruit in Old Age',
    'The Source Reigns',
    'Does He Who Made the Ear Not Hear?',
    'Today, If You Hear His Voice',
    'Sing a New Song',
    'Light Is Sown for the Righteous',
    'Let the Rivers Clap Their Hands',
    'Holy, Holy, Holy',
    'Enter His Gates with Thanksgiving',
    'I Will Not Set Before My Eyes',
    'But You Remain the Same',
    'Bless the Source, O My Soul',
    'You Open Your Hand',
    'He Remembered His Covenant',
    'Many Times He Delivered Them',
    'Let the Redeemed Say So',
    'A Song Stitched from Two Others',
    'I Am Prayer',
    'Sit at My Right Hand',
    'The Beginning of Wisdom',
    'He Will Not Be Afraid of Bad News',
    'He Raises the Poor from the Dust',
    'The Mountains Skipped Like Rams',
    'Those Who Make Them Will Be Like Them',
    'I Will Lift Up the Cup of Salvation',
    'All You Nations',
    'The Stone the Builders Rejected',
    'Your Word Is a Lamp to My Feet',
    'I Am for Peace',
    'He Who Keeps You Does Not Sleep',
    'Our Feet Are Standing in Your Gates',
    'As the Eyes of Servants Look to the Hand',
    'If the Source Had Not Been on Our Side',
    'Like Mount Zion',
    'Those Who Sow in Tears',
    'Unless the Source Builds the House',
    'Your Children Like Olive Shoots',
    'Plowers Plowed My Back',
    'Out of the Depths',
    'Like a Weaned Child',
    'I Will Not Give Sleep to My Eyes',
    'How Good It Is',
    'Bless the Source, You Who Stand by Night',
    'Their Idols Have Mouths But Cannot Speak',
    'His Loyal-Love Endures Forever',
    'By the Rivers of Babylon',
    'You Made Me Bold',
    'Awesomely and Wonderfully Made',
    'Keep Me From the Hands of the Violent',
    'The Lifting of My Hands as the Evening Sacrifice',
    'No One Cares for My Soul',
    'Do Not Bring Your Servant Into Judgment',
    'What Is Man That You Care for Him',
    'You Open Your Hand',
    'Do Not Put Your Trust in Princes',
    'He Heals the Brokenhearted and Counts the Stars',
    'Praise Him, Sun and Moon',
    'Sing to the Source a New Song',
    'Let Everything That Has Breath'
  ];

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
  // BUILD BOOK DATA — uses embedded titles, no fetch needed
  // Text bodies are lazy-loaded on demand when a chapter is opened
  // ═══════════════════════════════════════════════════════════════

  function buildPsalmsData() {
    bookData.psalms = [];
    for (let i = 1; i <= PSALM_COUNT; i++) {
      bookData.psalms.push({
        num: i,
        title: PSALM_TITLES[i - 1] || `Psalm ${i}`,
        subtitle: '',
        body: '',  // lazy-loaded
        notes: '',
        available: true,  // title available; body fetched on demand
        bodyLoaded: false
      });
    }
  }

  function buildProverbsData() {
    bookData.proverbs = [];
    for (let i = 1; i <= PROVERB_COUNT; i++) {
      bookData.proverbs.push({
        num: i,
        title: PROVERB_TITLES[i - 1] || `Proverb ${i}`,
        subtitle: '',
        body: '',
        notes: '',
        available: false,  // files don't exist yet
        bodyLoaded: false
      });
    }
  }

  // Lazy-load a single chapter's text
  async function loadChapterBody(bookId, chapterNum) {
    const entry = bookData[bookId] ? bookData[bookId][chapterNum - 1] : null;
    if (!entry || entry.bodyLoaded) return entry;

    const label = bookId === 'psalms' ? 'PSALM' : 'PROVERB';
    const num = String(chapterNum).padStart(3, '0');
    const url = `${bookId}/${label}-${num}.md`;

    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const md = await r.text();
      const parsed = parseMarkdown(md);
      const titleMatch = parsed.title.match(new RegExp(`^${label}\\s+\\d+\\s+.+?\\s+(.+)$`, 'i'));
      if (titleMatch) entry.title = titleMatch[1];
      entry.subtitle = parsed.subtitle;
      entry.body = parsed.body;
      entry.notes = parsed.notes;
      entry.available = true;
      entry.bodyLoaded = true;
    } catch (err) {
      console.error(`Error loading ${label} ${chapterNum}:`, err);
      entry.bodyLoaded = true;  // don't retry
    }
    return entry;
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

    // Body — or placeholder if not yet loaded
    if (entry.available && entry.body) {
      html += `<div class="psalm-body">${renderMarkdown(entry.body)}</div>`;
    } else if (entry.available && !entry.bodyLoaded) {
      // Will be lazy-loaded — show placeholder
      html += `<div class="psalm-body"><p style="text-align:center; color:var(--ink-light); font-style:italic;">Loading…</p></div>`;
    } else if (entry.available && entry.bodyLoaded && !entry.body) {
      html += `<div class="psalm-body"><p style="text-align:center; color:var(--ink-light); font-style:italic;">Could not load this chapter.</p></div>`;
    } else {
      // Not available (e.g., Proverbs not yet written)
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

        // Lazy-load body text if not yet loaded
        if (!entry.bodyLoaded) {
          loadChapterBody(currentBookId, chapterNum).then(() => {
            // Update the page DOM in place
            const pageEl = bookContainer.querySelector(`.page-psalm[data-chapter="${chapterNum}"]`);
            if (pageEl && entry.body) {
              const bodyEl = pageEl.querySelector('.psalm-body');
              if (bodyEl && !bodyEl.innerHTML.trim()) {
                bodyEl.innerHTML = renderMarkdown(entry.body);
                // Add notes if present
                if (entry.notes) {
                  let notesEl = pageEl.querySelector('.notes-section');
                  if (!notesEl) {
                    notesEl = document.createElement('div');
                    notesEl.className = 'notes-section';
                    notesEl.innerHTML = `<div class="notes-tab" onclick="this.nextElementSibling.classList.toggle('open')">Translation Notes</div><div class="notes-content">${renderMarkdown(entry.notes)}</div>`;
                    pageEl.appendChild(notesEl);
                  }
                }
              }
            }
          });
        }
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

  async function navigateToChapter(bookId, chapterNum) {
    // If switching books, rebuild pages
    if (bookId !== currentBookId) {
      currentBookId = bookId;
      if (pageFlip) {
        pageFlip.destroy();
        pageFlip = null;
      }
      buildAllPages();
      initPageFlip();
    }

    // Pre-load the chapter body before navigating
    const entry = bookData[bookId] ? bookData[bookId][chapterNum - 1] : null;
    if (entry && !entry.bodyLoaded) {
      await loadChapterBody(bookId, chapterNum);
      // Update page DOM
      const pageEl = bookContainer.querySelector(`.page-psalm[data-chapter="${chapterNum}"]`);
      if (pageEl && entry.body) {
        const bodyEl = pageEl.querySelector('.psalm-body');
        if (bodyEl) {
          bodyEl.innerHTML = renderMarkdown(entry.body);
        }
      }
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

    try {
      // Build book data from embedded titles — instant, no fetches
      if (!bookData.psalms) {
        buildPsalmsData();
      }
      if (!bookData.proverbs) {
        buildProverbsData();
      }

      buildAllPages();
      initPageFlip();
    } catch (err) {
      console.error('openBook error:', err);
    }

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
  // BUILD DATA (while cover is showing — instant, no fetches)
  // ═══════════════════════════════════════════════════════════════

  buildPsalmsData();
  buildProverbsData();

})();