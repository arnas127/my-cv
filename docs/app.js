let currentLang = 'en';
let cvUnlocked = false;

let GLOBAL_PROFILE_IMAGE = null;
// Filled from Firebase after successful password entry
let CONTENT_TRANSLATIONS = {};

let timelineObserver = null;

const INTRO_VIDEO_SEEN_KEY = 'cvIntroVideoSeen';

// Helpers
function getTemplateStrings() {
  return TEMPLATE_TRANSLATIONS[currentLang] || TEMPLATE_TRANSLATIONS.en;
}

function getContentStrings() {
  return CONTENT_TRANSLATIONS[currentLang] || CONTENT_TRANSLATIONS.en || {};
}

function getUrlLanguageParam() {
  try {
    const params = new URLSearchParams(window.location.search);
    const lang = (params.get('lang') || '').toLowerCase();
    if (lang === 'en' || lang === 'lt') {
      return lang;
    }
  } catch (e) {
    // ignore if URLSearchParams is not supported for some reason
  }
  return null;
}

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (typeof text === 'string') el.textContent = text;
  return el;
}

function isIOSStandalone() {
  const ua = window.navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isStandalone =
    (window.matchMedia &&
      window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone;

  return isIOS && isStandalone;
}

// --- Language / translations helpers ---

function getAvailableLanguages() {
  return Object.keys(CONTENT_TRANSLATIONS || {});
}

function getCurrentLangVideoUrl() {
  const c = getContentStrings();
  const v = c.videoIntroUrl;
  return typeof v === 'string' && v.trim() ? v.trim() : '';
}

function getFirstAvailableVideoUrl() {
  const translations = CONTENT_TRANSLATIONS || {};
  for (const lang of Object.keys(translations)) {
    const v = translations[lang]?.videoIntroUrl;
    if (typeof v === 'string' && v.trim()) {
      return v.trim();
    }
  }
  return '';
}

function hasSeenIntroVideo() {
  try {
    return (
      typeof window !== 'undefined' &&
      window.localStorage &&
      window.localStorage.getItem(INTRO_VIDEO_SEEN_KEY) === '1'
    );
  } catch (e) {
    return false;
  }
}

function markIntroVideoSeen() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(INTRO_VIDEO_SEEN_KEY, '1');
    }
  } catch (e) {
    // ignore storage errors
  }
}

// Hide/show language buttons on CV page (floating controls) based on available translations
function updateLanguageAvailability() {
  const available = getAvailableLanguages();
  const languageRow = document.querySelector('.floating-language-row');
  const enBtn = document.getElementById('langEnButton');
  const ltBtn = document.getElementById('langLtButton');

  if (!languageRow || !enBtn || !ltBtn) return;

  const hasEn = available.includes('en');
  const hasLt = available.includes('lt');

  enBtn.style.display = hasEn ? '' : 'none';
  ltBtn.style.display = hasLt ? '' : 'none';

  const count = (hasEn ? 1 : 0) + (hasLt ? 1 : 0);

  // If only one (or zero) languages available, hide the language selector row on CV
  if (count <= 1) {
    languageRow.style.display = 'none';
  } else {
    languageRow.style.display = '';
  }
}

// --- Rendering: Sidebar ---

function renderSidebar(container) {
  const t = getTemplateStrings();
  const c = getContentStrings();

  if (!c.fullName) return;

  const sidebar = createElement('div', 'sidebar');

  // Profile section
  const profileSection = createElement('div', 'profile-section');
  const profileImage = createElement('div', 'profile-image');

  // If profileImage is set in content translations (URL or base64),
  // show that image; otherwise show initials.
  const imageSrc =
    typeof GLOBAL_PROFILE_IMAGE === 'string' && GLOBAL_PROFILE_IMAGE.trim()
      ? GLOBAL_PROFILE_IMAGE.trim()
      : '';

  if (imageSrc) {
    const img = document.createElement('img');
    img.src = imageSrc; // can be normal URL or data:base64
    img.alt = c.fullName || '';
    img.className = 'profile-image-img';
    profileImage.appendChild(img);

    // Make it clickable only when there is a real photo
    profileImage.classList.add('profile-image--clickable');
    profileImage.addEventListener('click', () => openPhotoModal(imageSrc));
  } else {
    const initials = (c.fullName || '')
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    profileImage.textContent = initials;
  }


  const nameEl = createElement('h1', 'name', c.fullName);
  const jobEl = createElement('p', 'job-title', c.jobTitle);
  profileSection.append(profileImage, nameEl, jobEl);

  // Contact
  const contactSection = createElement('div', 'contact-section');
  const contactTitle = createElement('h2', 'section-title', t.sectionContact);
  contactSection.appendChild(contactTitle);

  const contactItems = [
    {
      iconPath:
        'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z',
      iconExtra: '22,6 12,13 2,6',
      text: c.contact?.email || ''
    },
    {
      iconPath:
        'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
      text: c.contact?.phone || ''
    },
    {
      iconPath: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z',
      circle: true,
      text: c.contact?.location || ''
    }
  ];

  contactItems.forEach((item) => {
    const wrapper = createElement('div', 'contact-item');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'contact-icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');

    const path = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    path.setAttribute('d', item.iconPath);
    svg.appendChild(path);

    if (item.iconExtra) {
      const polyline = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'polyline'
      );
      polyline.setAttribute('points', item.iconExtra);
      svg.appendChild(polyline);
    }

    if (item.circle) {
      const circle = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle'
      );
      circle.setAttribute('cx', '12');
      circle.setAttribute('cy', '10');
      circle.setAttribute('r', '3');
      svg.appendChild(circle);
    }

    wrapper.append(svg, document.createTextNode(item.text || ''));
    contactSection.appendChild(wrapper);
  });

  // CV URL row: always in DOM, hidden on web, visible in print
  const cvUrl = c.cvUrl || t.defaultCvUrl || '';
  if (cvUrl) {
    const cvItem = createElement(
      'div',
      'contact-item contact-cv-link'
    );

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'contact-icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');

    // Simple "link" icon
    const path1 = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    path1.setAttribute(
      'd',
      'M10 13a5 5 0 0 1 7.07 0l1.41 1.41a3 3 0 0 1-4.24 4.24l-1.83-1.83'
    );
    const path2 = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    path2.setAttribute(
      'd',
      'M14 11a5 5 0 0 1-7.07 0L5.5 9.57a3 3 0 0 1 4.24-4.24L11.57 7'
    );
    svg.append(path1, path2);

    const textNode = document.createElement('span');
    textNode.textContent = cvUrl;

    cvItem.append(svg, textNode);
    contactSection.appendChild(cvItem);
  }

  // Skills
  const skillsSection = createElement('div', 'skills-section');
  const skillsTitle = createElement('h2', 'section-title', t.sectionSkills);
  skillsSection.appendChild(skillsTitle);

  (c.skills || []).forEach((skill, index) => {
    const skillItem = createElement('div', 'skill-item');
    const skillName = createElement('div', 'skill-name', skill.name);
    const skillBar = createElement('div', 'skill-bar');
    const skillProgress = createElement('div', 'skill-progress');

    // final width based on level
    skillProgress.style.width = `${skill.level}%`;

    // staggered animation (0s, 0.08s, 0.16s, ...)
    skillProgress.style.animationDelay = `${index * 0.08}s`;

    skillBar.appendChild(skillProgress);
    skillItem.append(skillName, skillBar);
    skillsSection.appendChild(skillItem);
  });


  // Languages
  const languagesSection = createElement('div', 'languages-section');
  const languagesTitle = createElement(
    'h2',
    'section-title',
    t.sectionLanguages
  );
  languagesSection.appendChild(languagesTitle);

  (c.languages || []).forEach((lang) => {
    const langItem = createElement('div', 'language-item');
    const langName = createElement('div', 'language-name', lang.name);
    const langLevel = createElement('div', 'language-level', lang.level);
    langItem.append(langName, langLevel);
    languagesSection.appendChild(langItem);
  });

  // Additional info
  const additionalSection = createElement('div', 'additional-info-section');
  const additionalTitle = createElement(
    'h2',
    'section-title',
    t.sectionAdditionalInfo
  );
  additionalSection.appendChild(additionalTitle);

  (c.additionalInfo || []).forEach((info) => {
    const row = createElement('div', 'additional-info-item');
    const labelEl = createElement(
      'div',
      'additional-info-label',
      info.label
    );
    const valueEl = createElement(
      'div',
      'additional-info-value',
      info.value
    );
    row.append(labelEl, valueEl);
    additionalSection.appendChild(row);
  });

  // Wrap visible content so gradient layer can sit behind it
  const sidebarInner = createElement('div', 'sidebar-inner');
  sidebarInner.append(
    profileSection,
    contactSection,
    skillsSection,
    languagesSection,
    additionalSection
  );

  // Animated gradient background layer (blobs)
  const gradientLayer = createElement('div', 'sidebar-gradient-layer');
  ['1', '2', '3', '4', '5'].forEach((suffix) => {
    const blob = createElement(
      'div',
      `sidebar-gradient sidebar-gradient--${suffix}`
    );
    gradientLayer.appendChild(blob);
  });

  // Order matters: background first, then content
  sidebar.append(gradientLayer, sidebarInner);
  container.appendChild(sidebar);
}

// --- Timeline helpers & rendering ---

function getTimelineConfigs() {
  const raw = window.TIMELINE_CONFIG;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object') {
    return Object.keys(raw)
      .map((key) => raw[key])
      .filter(Boolean);
  }
  return [];
}

// Generic timeline item: works for experience, education, volunteering, etc.
// Accepts both a description string and bullets array, or either one.
// When both are present: description first, then bullets.
function createTimelineItem(entry, config) {
  const fields = config.fields || {};
  const itemClasses = ['timeline-item'];
  if (config.itemClass) itemClasses.push(config.itemClass);

  const item = createElement('div', itemClasses.join(' '));

  const dotClasses = ['timeline-dot'];
  if (config.dotClass) dotClasses.push(config.dotClass);
  const dot = createElement('span', dotClasses.join(' '));

  const contentClasses = ['timeline-content'];
  if (config.contentClass) contentClasses.push(config.contentClass);
  const content = createElement('div', contentClasses.join(' '));

  const header = createElement('div', 'item-header');

  const titleKey = fields.title;
  const subtitleKey = fields.subtitle;
  const dateKey = fields.date;
  const descriptionKey = fields.description;
  const bulletsKey = fields.bullets;

  const titleText = titleKey && entry[titleKey] ? entry[titleKey] : '';
  const subtitleText =
    subtitleKey && entry[subtitleKey] ? entry[subtitleKey] : '';
  const dateText = dateKey && entry[dateKey] ? entry[dateKey] : '';

  if (titleText) {
    const titleEl = createElement('h3', 'item-title', titleText);
    header.appendChild(titleEl);
  }

  if (subtitleText || dateText) {
    const p = document.createElement('p');

    if (subtitleText) {
      const subtitleSpan = createElement('span', 'item-subtitle', subtitleText);
      p.appendChild(subtitleSpan);
    }

    if (dateText) {
      const dateSpan = createElement('span', 'item-date', dateText);
      p.appendChild(dateSpan);
    }

    header.appendChild(p);
  }

  content.appendChild(header);

  const descriptionText =
    descriptionKey && typeof entry[descriptionKey] === 'string'
      ? entry[descriptionKey]
      : '';

  const bullets =
    bulletsKey && Array.isArray(entry[bulletsKey])
      ? entry[bulletsKey].filter(Boolean)
      : [];

  if (descriptionText) {
    const desc = createElement('div', 'item-description');
    const p = createElement('p', '', descriptionText);
    desc.appendChild(p);
    content.appendChild(desc);
  }

  if (bullets.length) {
    const desc = createElement(
      'div',
      descriptionText
        ? 'item-description item-description--bullets'
        : 'item-description'
    );
    const ul = document.createElement('ul');
    bullets.forEach((b) => {
      const li = document.createElement('li');
      li.textContent = b;
      ul.appendChild(li);
    });
    desc.appendChild(ul);
    content.appendChild(desc);
  }

  item.append(dot, content);
  return item;
}

function renderMainContent(container) {
  const t = getTemplateStrings();
  const c = getContentStrings();

  if (!c.fullName) return;

  const main = createElement('div', 'main-content');

  // Summary
  const summarySection = createElement('div', 'summary-section');
  const summaryTitle = createElement(
    'h2',
    'main-section-title',
    t.sectionSummary
  );
  const summaryText = createElement('p', 'summary-text', c.summary);
  summarySection.append(summaryTitle, summaryText);
  main.appendChild(summarySection);

  // Generic timeline groups (experience, education, volunteering, etc.)
  const timelineConfigs = getTimelineConfigs();

  timelineConfigs.forEach((config) => {
    if (!config || !config.dataKey) return;

    const items = c[config.dataKey];
    if (!Array.isArray(items) || !items.length) return;

    const sectionClassNames = ['timeline-section'];
    if (config.sectionClass) {
      sectionClassNames.push(config.sectionClass);
    }
    const section = createElement('div', sectionClassNames.join(' '));

    const sectionTitleKey = config.titleTranslationKey;
    const sectionTitleText =
      (sectionTitleKey && t[sectionTitleKey]) ||
      config.fallbackTitle ||
      '';

    const sectionTitleEl = createElement(
      'h2',
      'main-section-title',
      sectionTitleText
    );

    const headBlockClassNames = ['section-head-block'];
    if (config.headBlockClass) {
      headBlockClassNames.push(config.headBlockClass);
    }
    const headBlock = createElement('div', headBlockClassNames.join(' '));
    headBlock.appendChild(sectionTitleEl);

    // First item is rendered inside the head block to keep title + first item together
    headBlock.appendChild(createTimelineItem(items[0], config));
    section.appendChild(headBlock);

    // Remaining items follow the head block
    for (let i = 1; i < items.length; i++) {
      section.appendChild(createTimelineItem(items[i], config));
    }

    main.appendChild(section);
  });

  container.appendChild(main);
}

function initTimelineScrollAnimations() {
  const main = document.querySelector('.main-content');
  if (!main) return;

  const items = main.querySelectorAll('.timeline-item');
  if (!items.length) return;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // If no IntersectionObserver or user prefers reduced motion -> show all immediately
  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    items.forEach((item) => {
      item.classList.add('timeline-item--visible');
    });
    return;
  }

  // Clean up previous observer on re-render (language switch, etc.)
  if (timelineObserver) {
    timelineObserver.disconnect();
    timelineObserver = null;
  }

  timelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('timeline-item--visible');
          timelineObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.25,
      root: null,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  items.forEach((item) => {
    timelineObserver.observe(item);
  });
}

function renderCv() {
  const root = document.getElementById('cv-root');
  if (!root) return;

  const c = getContentStrings();
  if (!c.fullName) return;

  root.innerHTML = '';

  document.title = c.documentTitle || 'CV';

  const cvContainer = createElement('div', 'cv-container');
  cvContainer.id = 'cvContainer';

  if (cvUnlocked) {
    cvContainer.classList.add('visible');
  }

  renderSidebar(cvContainer);
  renderMainContent(cvContainer);

  root.appendChild(cvContainer);

  updateLanguageButtonsUi();
  initTimelineScrollAnimations();
}

// --- Modal translations ---

function updateModalTranslations() {
  const t = getTemplateStrings();

  const passwordTitle = document.getElementById('passwordModalTitle');
  const passwordSubtitle = document.getElementById('passwordModalSubtitle');
  const passwordInput = document.getElementById('passwordInput');
  const errorMessage = document.getElementById('errorMessage');
  const submitLabel = document.getElementById('submitPasswordLabel');
  const continueLabel = document.getElementById('continueButtonLabel');
  const reopenLabel = document.getElementById('reopenVideoButtonLabel');
  //iOS export modal texts
  const iosTitle = document.getElementById('iosExportTitle');
  const iosSubtitle = document.getElementById('iosExportSubtitle');
  const iosButtonLabel = document.getElementById('iosExportButtonLabel');

  if (passwordTitle) {
    passwordTitle.textContent = t.modalPasswordTitle;
  }
  if (passwordSubtitle) {
    passwordSubtitle.textContent = t.modalPasswordSubtitle;
  }
  if (passwordInput) {
    passwordInput.placeholder = t.modalPasswordPlaceholder;
  }
  if (errorMessage) {
    errorMessage.textContent = t.modalPasswordError;
  }
  if (submitLabel) {
    submitLabel.textContent = t.modalPasswordButton;
  }
  if (continueLabel) {
    continueLabel.textContent = t.modalVideoContinueButton;
  }
  if (reopenLabel) {
    reopenLabel.textContent = t.modalReopenVideoButton;
  }

  const videoTitle = document.getElementById('videoModalTitle');
  const videoSubtitle = document.getElementById('videoModalSubtitle');
  if (videoTitle) {
    videoTitle.textContent = t.modalVideoTitle;
  }
  if (videoSubtitle) {
    videoSubtitle.textContent = t.modalVideoSubtitle;
  }

  // iOS export modal texts
  if (iosTitle) {
    iosTitle.textContent = t.iosExportTitle || '';
  }
  if (iosSubtitle) {
    iosSubtitle.textContent = t.iosExportSubtitle || '';
  }
  if (iosButtonLabel) {
    iosButtonLabel.textContent = t.iosExportButton || 'OK';
  }
}

// --- Language + Buttons ---

function updateButtonTranslations() {
  const t = getTemplateStrings();

  const exportLabel = document.getElementById('exportLabel');
  if (exportLabel) {
    exportLabel.textContent = t.btnExportPdf;
  }

  const langEnLabel = document.getElementById('langEnLabel');
  const langLtLabel = document.getElementById('langLtLabel');
  if (langEnLabel) langEnLabel.textContent = t.langEnLabel;
  if (langLtLabel) langLtLabel.textContent = t.langLtLabel;
}

function updateLanguageButtonsUi() {
  const enBtn = document.getElementById('langEnButton');
  const ltBtn = document.getElementById('langLtButton');
  if (!enBtn || !ltBtn) return;

  enBtn.classList.toggle('language-button--active', currentLang === 'en');
  ltBtn.classList.toggle('language-button--active', currentLang === 'lt');
}

function updateModalLanguageButtonsUi() {
  const modalEn = document.getElementById('modalLangEn');
  const modalLt = document.getElementById('modalLangLt');
  if (!modalEn || !modalLt) return;

  modalEn.classList.toggle('active', currentLang === 'en');
  modalLt.classList.toggle('active', currentLang === 'lt');
}

// IMPORTANT: allow language switching in modal even before content is loaded
function setLanguage(lang) {
  if (cvUnlocked && CONTENT_TRANSLATIONS && !CONTENT_TRANSLATIONS[lang]) {
    // After unlock, only allow languages we actually have translations for
    const available = getAvailableLanguages();
    if (available.includes('en')) {
      lang = 'en';
    } else if (available.length > 0) {
      lang = available[0];
    } else {
      lang = 'en';
    }
  }

  currentLang = lang;

  updateButtonTranslations();
  updateModalTranslations();
  updateModalLanguageButtonsUi();

  if (cvUnlocked) {
    renderCv();
    updateLanguageAvailability();
  }
}

function initButtons() {
  const exportBtn = document.getElementById('exportButton');
  const enBtn = document.getElementById('langEnButton');
  const ltBtn = document.getElementById('langLtButton');

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      // On iOS standalone (Home Screen app), window.print() often does nothing.
      if (isIOSStandalone()) {
        const modal = document.getElementById('iosExportInfoModal');
        if (modal) {
          modal.classList.remove('hidden');
        }
      } else {
        window.print();
      }
    });
  }

  if (enBtn) enBtn.addEventListener('click', () => setLanguage('en'));
  if (ltBtn) ltBtn.addEventListener('click', () => setLanguage('lt'));
}

function setPasswordLoading(isLoading) {
  const loadingSpinner = document.getElementById('passwordLoadingSpinner');
  const submitLabel = document.getElementById('submitPasswordLabel');
  const submitButton = document.getElementById('submitPassword');
  const t = getTemplateStrings();

  if (!loadingSpinner || !submitLabel || !submitButton) return;

  if (isLoading) {
    submitButton.disabled = true;
    loadingSpinner.classList.remove('hidden');
    submitLabel.textContent = t.modalPasswordLoading;
  } else {
    submitButton.disabled = false;
    loadingSpinner.classList.add('hidden');
    submitLabel.textContent = t.modalPasswordButton;
  }
}

// --- Language warning modal ---

function showLanguageWarningModal(missingLang, fallbackLang) {
  const modal = document.getElementById('languageWarningModal');
  const msgEl = document.getElementById('languageWarningMessage');
  const btn = document.getElementById('languageWarningButton');
  const t = getTemplateStrings();

  if (!modal || !msgEl || !btn) {
    // Fallback: if modal missing, just switch and continue
    setLanguage(fallbackLang);
    proceedAfterSuccessfulLogin();
    return;
  }

  msgEl.textContent = t.languageWarningUnavailableMessage;
  btn.textContent = t.languageWarningUnavailableButton;

  btn.onclick = () => {
    modal.classList.add('hidden');
    setLanguage(fallbackLang);
    proceedAfterSuccessfulLogin();
  };

  modal.classList.remove('hidden');
}

// --- After successful login: decide CV vs video ---
// --- After successful login: decide CV vs video ---

function proceedAfterSuccessfulLogin() {
  const videoModal = document.getElementById('videoModal');
  const videoIframe = document.getElementById('videoIframe');
  const reopenVideoButton = document.getElementById('reopenVideoButton');

  const available = getAvailableLanguages();
  if (!available.length) {
    console.error('No translations available in CONTENT_TRANSLATIONS.');
    return;
  }

  // Make sure currentLang is something we actually have now
  if (!available.includes(currentLang)) {
    const fallback = available.includes('en') ? 'en' : available[0];
    setLanguage(fallback);
  } else {
    setLanguage(currentLang);
  }

  const anyVideoUrl = getFirstAvailableVideoUrl();

  if (!anyVideoUrl) {
    // No video in any language: go straight to CV, hide video UI
    if (videoModal) videoModal.classList.add('hidden');
    if (reopenVideoButton) reopenVideoButton.classList.add('hidden');
    if (videoIframe) videoIframe.src = '';
    renderCv();
    updateLanguageAvailability();
    return;
  }

  // There is at least one video. Prefer current language if it has a URL.
  const currentVideoUrl = getCurrentLangVideoUrl() || anyVideoUrl;

  // Always render the CV first
  renderCv();
  updateLanguageAvailability();

  const alreadySeen = hasSeenIntroVideo();

  if (!alreadySeen) {
    // First time in this browser: auto-open video modal
    if (videoIframe && currentVideoUrl) {
      videoIframe.src = currentVideoUrl;
    }
    if (videoModal) {
      videoModal.classList.remove('hidden');
    }
    if (reopenVideoButton) {
      // Hide "reopen" while the modal is open
      reopenVideoButton.classList.add('hidden');
    }
    // Remember that we've shown it once in this browser
    markIntroVideoSeen();
  } else {
    // Video was already shown before in this browser:
    // go straight to CV and allow manual re-watch via button
    if (videoModal) {
      videoModal.classList.add('hidden');
    }
    if (reopenVideoButton) {
      reopenVideoButton.classList.remove('hidden');
    }
    if (videoIframe) {
      videoIframe.src = '';
    }
  }
}

// --- Init password + video ---

function initPasswordAndVideo() {
  const passwordModal = document.getElementById('passwordModal');
  const videoModal = document.getElementById('videoModal');
  const passwordForm = document.getElementById('passwordForm');
  const passwordInput = document.getElementById('passwordInput');
  const errorMessage = document.getElementById('errorMessage');
  const continueButton = document.getElementById('continueButton');
  const reopenVideoButton = document.getElementById('reopenVideoButton');
  const videoIframe = document.getElementById('videoIframe');

  const modalLangEn = document.getElementById('modalLangEn');
  const modalLangLt = document.getElementById('modalLangLt');

  if (!passwordModal || !passwordForm) return;

  if (passwordInput) {
    passwordInput.focus();
  }

  if (modalLangEn) {
    modalLangEn.addEventListener('click', () => setLanguage('en'));
  }
  if (modalLangLt) {
    modalLangLt.addEventListener('click', () => setLanguage('lt'));
  }

  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const enteredPassword = (passwordInput.value || '').trim();

    if (!enteredPassword) {
      if (errorMessage) {
        errorMessage.classList.remove('hidden');
      }
      if (passwordInput) {
        passwordInput.classList.add('error');
        setTimeout(() => passwordInput.classList.remove('error'), 500);
      }
      return;
    }

    if (typeof window.fetchCvByPassword !== 'function') {
      console.error('fetchCvByPassword is not defined. Check firebaseConfig.js.');
      if (errorMessage) {
        errorMessage.classList.remove('hidden');
      }
      return;
    }

    if (errorMessage) errorMessage.classList.add('hidden');
    if (passwordInput) passwordInput.classList.remove('error');
    setPasswordLoading(true);

    try {
      const responseData = await window.fetchCvByPassword(enteredPassword);

      if (!responseData) {
        if (errorMessage) {
          errorMessage.classList.remove('hidden');
        }
        if (passwordInput) {
          passwordInput.classList.add('error');
          passwordInput.value = '';
          passwordInput.focus();
          setTimeout(() => passwordInput.classList.remove('error'), 500);
        }
        return;
      }

      CONTENT_TRANSLATIONS = responseData.translations || {};
      GLOBAL_PROFILE_IMAGE = responseData.profileImage || null;
      cvUnlocked = true;

      // Hide password modal now
      passwordModal.classList.add('hidden');

      const available = getAvailableLanguages();
      if (!available.length) {
        console.error('Translations object is empty.');
        return;
      }

      // If user pre-selected a language that is NOT available => show warning modal
      if (!available.includes(currentLang)) {
        const fallback = available.includes('en') ? 'en' : available[0];
        showLanguageWarningModal(currentLang, fallback);
      } else {
        // Language is available, go directly
        proceedAfterSuccessfulLogin();
      }
    } catch (err) {
      console.error(err);
      if (errorMessage) {
        errorMessage.classList.remove('hidden');
      }
    } finally {
      setPasswordLoading(false);
    }
  });

  if (continueButton) {
    continueButton.addEventListener('click', () => {
      if (videoModal) videoModal.classList.add('hidden');
      if (reopenVideoButton) reopenVideoButton.classList.remove('hidden');
      if (videoIframe) videoIframe.src = '';
    });
  }

  if (reopenVideoButton) {
    reopenVideoButton.addEventListener('click', () => {
      const url =
        getCurrentLangVideoUrl() || getFirstAvailableVideoUrl();
      if (videoIframe && url) {
        videoIframe.src = url;
      }
      if (videoModal) videoModal.classList.remove('hidden');
      reopenVideoButton.classList.add('hidden');
    });
  }

  updateModalTranslations();
  updateModalLanguageButtonsUi();
}

function initExportModalClose() {
  // Close iOS export info modal
  const iosExportClose = document.getElementById('iosExportInfoClose');
  if (iosExportClose) {
    iosExportClose.addEventListener('click', () => {
      const modal = document.getElementById('iosExportInfoModal');
      if (modal) {
        modal.classList.add('hidden');
      }
    });
  }
}

function openPhotoModal(src) {
  const modal = document.getElementById('photoModal');
  const img = document.getElementById('photoModalImage');
  if (!modal || !img || !src) return;

  const c = getContentStrings();
  img.src = src;
  img.alt = c.fullName || 'Profile photo';

  modal.classList.remove('hidden');
}

function closePhotoModal() {
  const modal = document.getElementById('photoModal');
  const img = document.getElementById('photoModalImage');
  if (!modal || !img) return;

  modal.classList.add('hidden');
  img.src = '';
}

function initPhotoModal() {
  const modal = document.getElementById('photoModal');
  if (!modal) return;

  // Close on any click inside the modal (overlay or picture)
  modal.addEventListener('click', () => {
    closePhotoModal();
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (!modal.classList.contains('hidden')) {
        closePhotoModal();
      }
    }
  });
}

// --- DOM ready ---

document.addEventListener('DOMContentLoaded', () => {
  const langFromUrl = getUrlLanguageParam();
  if (langFromUrl) {
    currentLang = langFromUrl;
  }

  initButtons();
  updateButtonTranslations();
  updateModalTranslations();
  updateModalLanguageButtonsUi();
  initPasswordAndVideo();
  initExportModalClose();
  initPhotoModal();
});
