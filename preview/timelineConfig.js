// timelineConfig.js
// Central configuration for all timeline-based sections.
// You can add new groups (e.g. "courses") here later without touching app.js.

window.TIMELINE_CONFIG = [
  {
    id: 'experience',
    // key in your Firestore content JSON, e.g. translations[lang].experiences
    dataKey: 'experiences',
    // key from TEMPLATE_TRANSLATIONS for section title
    titleTranslationKey: 'sectionExperience',
    // optional extra classes for styling
    sectionClass: 'timeline-section--experience',
    headBlockClass: 'timeline-head-block--experience',
    itemClass: 'timeline-item--experience',
    dotClass: 'timeline-dot--experience',
    contentClass: 'timeline-content--experience',
    // mapping from generic timeline fields -> actual JSON fields
    fields: {
      title: 'title',
      subtitle: 'company',
      date: 'date',
      description: 'description', // optional, currently unused but supported
      bullets: 'bullets'
    }
  },
  {
    id: 'education',
    dataKey: 'education',
    titleTranslationKey: 'sectionEducation',
    sectionClass: 'timeline-section--education',
    headBlockClass: 'timeline-head-block--education',
    itemClass: 'timeline-item--education',
    dotClass: 'timeline-dot--education',
    contentClass: 'timeline-content--education',
    fields: {
      title: 'degree',
      subtitle: 'institution',
      date: 'date',
      description: 'description',
      bullets: 'bullets' // optional, in case you want bullets later
    }
  },
  {
    id: 'volunteering',
    dataKey: 'volunteering',
    titleTranslationKey: 'sectionVolunteering',
    sectionClass: 'timeline-section--volunteering',
    headBlockClass: 'timeline-head-block--volunteering',
    itemClass: 'timeline-item--volunteering',
    dotClass: 'timeline-dot--volunteering',
    contentClass: 'timeline-content--volunteering',
    fields: {
      title: 'title',
      subtitle: 'organization',
      date: 'date',
      description: 'description', // optional, supported
      bullets: 'bullets'
    }
  }
];
