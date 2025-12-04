let currentLang = 'en';
let breaksVisible = false;

// Helpers
function getTemplateStrings() {
  return TEMPLATE_TRANSLATIONS[currentLang] || TEMPLATE_TRANSLATIONS.en;
}

function getContentStrings() {
  return CONTENT_TRANSLATIONS[currentLang] || CONTENT_TRANSLATIONS.en;
}

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (typeof text === 'string') el.textContent = text;
  return el;
}

// ---- RENDERING ----

function renderSidebar(container) {
  const t = getTemplateStrings();
  const c = getContentStrings();

  const sidebar = createElement('div', 'sidebar');

  // Profile section
  const profileSection = createElement('div', 'profile-section');
  const profileImage = createElement('div', 'profile-image');
  const initials = c.fullName
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  profileImage.textContent = initials;

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
      text: c.contact.email
    },
    {
      iconPath:
        'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
      text: c.contact.phone
    },
    {
      iconPath:
        'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z',
      circle: true,
      text: c.contact.location
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

    wrapper.append(svg, document.createTextNode(item.text));
    contactSection.appendChild(wrapper);
  });

  // Skills (dynamic)
  const skillsSection = createElement('div', 'skills-section');
  const skillsTitle = createElement('h2', 'section-title', t.sectionSkills);
  skillsSection.appendChild(skillsTitle);

  c.skills.forEach((skill) => {
    const skillItem = createElement('div', 'skill-item');
    const skillName = createElement('div', 'skill-name', skill.name);
    const skillBar = createElement('div', 'skill-bar');
    const skillProgress = createElement('div', 'skill-progress');
    skillProgress.style.width = `${skill.level}%`;
    skillBar.appendChild(skillProgress);
    skillItem.append(skillName, skillBar);
    skillsSection.appendChild(skillItem);
  });

  // Languages (dynamic)
  const languagesSection = createElement('div', 'languages-section');
  const languagesTitle = createElement(
    'h2',
    'section-title',
    t.sectionLanguages
  );
  languagesSection.appendChild(languagesTitle);

  c.languages.forEach((lang) => {
    const langItem = createElement('div', 'language-item');
    const langName = createElement('div', 'language-name', lang.name);
    const langLevel = createElement('div', 'language-level', lang.level);
    langItem.append(langName, langLevel);
    languagesSection.appendChild(langItem);
  });

  // Additional info (multi-line, same style as languages)
  const additionalSection = createElement('div', 'additional-info-section');
  const additionalTitle = createElement(
    'h2',
    'section-title',
    t.sectionAdditionalInfo
  );
  additionalSection.appendChild(additionalTitle);

  if (c.additionalInfo && c.additionalInfo.length) {
    c.additionalInfo.forEach((info) => {
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
  }

  sidebar.append(
    profileSection,
    contactSection,
    skillsSection,
    languagesSection,
    additionalSection
  );
  container.appendChild(sidebar);
}

function createPageBreakPlaceholder() {
  const t = getTemplateStrings();
  const placeholder = createElement('div', 'page-break-placeholder');
  const inner = createElement('div', 'page-break-placeholder-text');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'placeholder-icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');

  const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line1.setAttribute('x1', '12');
  line1.setAttribute('y1', '5');
  line1.setAttribute('x2', '12');
  line1.setAttribute('y2', '19');
  const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line2.setAttribute('x1', '5');
  line2.setAttribute('y1', '12');
  line2.setAttribute('x2', '19');
  line2.setAttribute('y2', '12');

  svg.append(line1, line2);
  inner.append(svg, document.createTextNode(t.placeholderAddBreak));
  placeholder.appendChild(inner);
  return placeholder;
}

function renderMainContent(container) {
  const t = getTemplateStrings();
  const c = getContentStrings();

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

  // Placeholder after summary
  main.appendChild(createPageBreakPlaceholder());

  // Experience
  if (c.experiences && c.experiences.length) {
    const expSection = createElement('div', 'experience-section');
    const expTitle = createElement(
      'h2',
      'main-section-title',
      t.sectionExperience
    );
    expSection.appendChild(expTitle);

    c.experiences.forEach((exp, index) => {
      const item = createElement('div', 'experience-item');
      const header = createElement('div', 'item-header');
      const title = createElement('h3', 'item-title', exp.title);

      const p = document.createElement('p');
      const companySpan = createElement(
        'span',
        'item-subtitle',
        exp.company
      );
      const dateSpan = createElement('span', 'item-date', exp.date);
      p.append(companySpan, dateSpan);

      header.append(title, p);
      item.appendChild(header);

      if (exp.bullets && exp.bullets.length) {
        const desc = createElement('div', 'item-description');
        const ul = document.createElement('ul');
        exp.bullets.forEach((b) => {
          const li = document.createElement('li');
          li.textContent = b;
          ul.appendChild(li);
        });
        desc.appendChild(ul);
        item.appendChild(desc);
      }

      expSection.appendChild(item);

      // Page-break placeholder between experiences (not after last)
      if (index < c.experiences.length - 1) {
        expSection.appendChild(createPageBreakPlaceholder());
      }
    });

    main.appendChild(expSection);
  }

  // Single placeholder after whole experience section (between last exp and education)
  main.appendChild(createPageBreakPlaceholder());

  // Education
  if (c.education && c.education.length) {
    const eduSection = createElement('div', 'education-section');
    const eduTitle = createElement(
      'h2',
      'main-section-title',
      t.sectionEducation
    );
    eduSection.appendChild(eduTitle);

    c.education.forEach((edu) => {
      const item = createElement('div', 'education-item');
      const header = createElement('div', 'item-header');
      const title = createElement('h3', 'item-title', edu.degree);

      const p = document.createElement('p');
      const instSpan = createElement(
        'span',
        'item-subtitle',
        edu.institution
      );
      const dateSpan = createElement('span', 'item-date', edu.date);
      p.append(instSpan, dateSpan);

      header.append(title, p);
      item.appendChild(header);

      if (edu.description) {
        const desc = createElement('div', 'item-description', edu.description);
        item.appendChild(desc);
      }

      eduSection.appendChild(item);
    });

    main.appendChild(eduSection);
  }

  // Placeholder after education
  main.appendChild(createPageBreakPlaceholder());

  // Volunteering
  if (c.volunteering && c.volunteering.length) {
    const volSection = createElement('div', 'volunteering-section');
    const volTitle = createElement(
      'h2',
      'main-section-title',
      t.sectionVolunteering
    );
    volSection.appendChild(volTitle);

    c.volunteering.forEach((vol) => {
      const item = createElement('div', 'experience-item');
      const header = createElement('div', 'item-header');
      const title = createElement('h3', 'item-title', vol.title);

      const p = document.createElement('p');
      const orgSpan = createElement(
        'span',
        'item-subtitle',
        vol.organization
      );
      const dateSpan = createElement('span', 'item-date', vol.date);
      p.append(orgSpan, dateSpan);

      header.append(title, p);
      item.appendChild(header);

      if (vol.bullets && vol.bullets.length) {
        const desc = createElement('div', 'item-description');
        const ul = document.createElement('ul');
        vol.bullets.forEach((b) => {
          const li = document.createElement('li');
          li.textContent = b;
          ul.appendChild(li);
        });
        desc.appendChild(ul);
        item.appendChild(desc);
      }

      volSection.appendChild(item);
    });

    main.appendChild(volSection);
  }

  container.appendChild(main);
}

function renderCv() {
  const root = document.getElementById('cv-root');
  root.innerHTML = '';

  const c = getContentStrings();
  document.title = c.documentTitle || 'CV';

  const cvContainer = createElement('div', 'cv-container');
  renderSidebar(cvContainer);
  renderMainContent(cvContainer);

  root.appendChild(cvContainer);

  // After DOM is built, wire placeholders for page breaks
  initPageBreakPlaceholders();

  updateLanguageButtonsUi();
}

// ---- PAGE BREAK LOGIC ----

let breakCounter = 0;

function createPageBreak() {
  const t = getTemplateStrings();
  const pageBreak = createElement('div', 'page-break');
  pageBreak.dataset.breakId = breakCounter++;

  const inner = createElement('div', 'page-break-text');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'page-break-icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', '5');
  line.setAttribute('y1', '12');
  line.setAttribute('x2', '19');
  line.setAttribute('y2', '12');

  const poly = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'polyline'
  );
  poly.setAttribute('points', '12 5 19 12 12 19');

  svg.append(line, poly);

  const textNode = document.createTextNode('Page Break');
  const removeSpan = createElement('span', 'remove-break', 'Remove');

  inner.append(svg, textNode, removeSpan);
  pageBreak.appendChild(inner);

  removeSpan.addEventListener('click', (e) => {
    e.stopPropagation();
    const placeholder = pageBreak.nextElementSibling;
    if (
      placeholder &&
      placeholder.classList.contains('page-break-placeholder') &&
      breaksVisible
    ) {
      placeholder.style.display = 'block';
    }
    pageBreak.remove();
  });

  return pageBreak;
}

function initPageBreakPlaceholders() {
  const placeholders = document.querySelectorAll('.page-break-placeholder');
  placeholders.forEach((placeholder) => {
    placeholder.style.display = breaksVisible ? 'block' : 'none';
    placeholder.onclick = () => {
      if (!breaksVisible) return;
      const breakEl = createPageBreak();
      placeholder.style.display = 'none';
      placeholder.parentNode.insertBefore(breakEl, placeholder);
    };
  });
}

// ---- LANGUAGE + BUTTONS ----

function updateButtonTranslations() {
  const t = getTemplateStrings();

  const toggleLabel = document.getElementById('toggleBreaksLabel');
  if (toggleLabel) {
    toggleLabel.textContent = breaksVisible
      ? t.btnPageBreaksHide
      : t.btnPageBreaksShow;
  }

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

function setLanguage(lang) {
  if (!CONTENT_TRANSLATIONS[lang]) {
    lang = 'en';
  }
  currentLang = lang;
  renderCv();
  updateButtonTranslations();
}

function initButtons() {
  const toggleBtn = document.getElementById('toggleBreaksButton');
  const exportBtn = document.getElementById('exportButton');
  const enBtn = document.getElementById('langEnButton');
  const ltBtn = document.getElementById('langLtButton');
  const menuBtn = document.getElementById('menuToggleButton');
  const actionsPanel = document.getElementById('actionsPanel');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      breaksVisible = !breaksVisible;
      document.body.classList.toggle('show-breaks', breaksVisible);
      updateButtonTranslations();
      initPageBreakPlaceholders();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => window.print());
  }

  if (enBtn) enBtn.addEventListener('click', () => setLanguage('en'));
  if (ltBtn) ltBtn.addEventListener('click', () => setLanguage('lt'));

  if (menuBtn && actionsPanel) {
    menuBtn.addEventListener('click', () => {
      actionsPanel.classList.toggle('actions-panel--visible');
    });
  }
}

// ---- INIT ----

document.addEventListener('DOMContentLoaded', () => {
  initButtons();
  renderCv();
  updateButtonTranslations();
});
