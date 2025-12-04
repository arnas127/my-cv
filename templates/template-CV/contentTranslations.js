// Content translations: actual CV data
const CONTENT_TRANSLATIONS = {
  en: {
    documentTitle: 'John Doe CV',
    fullName: 'John Doe',
    jobTitle: 'Senior Product Designer',
    contact: {
      email: 'john.doe@email.com',
      phone: '+1 234 567 8900',
      location: 'San Francisco, CA'
    },
    summary:
      'Creative and detail-oriented Senior Product Designer with 8+ years of experience crafting intuitive digital experiences. Passionate about solving complex problems through user-centered design and data-driven decisions. Proven track record of leading design teams and delivering successful products that drive business growth.',
    skills: [
      { name: 'UI/UX Design', level: 95 },
      { name: 'Figma & Sketch', level: 90 },
      { name: 'Prototyping', level: 85 },
      { name: 'HTML/CSS', level: 80 },
      { name: 'User Research', level: 88 }
    ],
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'Spanish', level: 'Professional' },
      { name: 'French', level: 'Intermediate' }
    ],
    additionalInfo: [
      {
        label: "Driver's license",
        value: 'A, B categories'
      },
      {
        label: 'Certifications',
        value: 'C++ Pro'
      }
    ],
    experiences: [
      {
        title: 'Senior Product Designer',
        company: 'TechCorp Inc.',
        date: 'Jan 2020 – Present',
        bullets: [
          'Led design initiatives for a SaaS platform serving 100k+ users, improving user satisfaction by 40%.',
          'Collaborated with cross-functional teams to define product strategy and roadmap.',
          'Established and maintained a comprehensive design system used across multiple product lines.',
          'Mentored junior designers and conducted design critiques to elevate team output.'
        ]
      },
      {
        title: 'Product Designer',
        company: 'StartupXYZ',
        date: 'Mar 2017 – Dec 2019',
        bullets: [
          'Designed and shipped mobile and web experiences for an e-commerce platform.',
          'Conducted user research and usability testing to inform design decisions.',
          'Created wireframes, prototypes, and high-fidelity mockups.',
          'Increased conversion rate by 25% through iterative design improvements.'
        ]
      },
      {
        title: 'Junior UI/UX Designer',
        company: 'Design Studio Co.',
        date: 'Jun 2015 – Feb 2017',
        bullets: [
          'Worked on diverse client projects ranging from mobile apps to enterprise software.',
          'Developed responsive web designs and interactive prototypes.',
          'Collaborated with developers to ensure design implementation quality.'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Fine Arts in Graphic Design',
        institution: 'University of Arts',
        date: '2011 – 2015',
        description:
          'Graduated with honors. Focused on digital design, typography, and user experience.'
      }
    ],
    volunteering: [
      {
        title: 'Design Mentor',
        organization: 'DesignForGood Initiative',
        date: '2021 – Present',
        bullets: [
          'Mentor aspiring designers from underrepresented communities.',
          'Conduct monthly workshops on design principles and career development.',
          'Review portfolios and provide constructive feedback to mentees.'
        ]
      },
      {
        title: 'UX Design Volunteer',
        organization: 'Local Non-Profit Organization',
        date: '2019 – 2020',
        bullets: [
          "Redesigned the organization's website to improve accessibility and user engagement.",
          'Increased online donations by 35% through improved user experience.'
        ]
      }
    ]
  },

  lt: {
    documentTitle: 'John Doe CV',
    fullName: 'John Doe',
    jobTitle: 'Vyresnysis produkto dizaineris',
    contact: {
      email: 'john.doe@email.com',
      phone: '+1 234 567 8900',
      location: 'San Franciskas, JAV'
    },
    summary:
      'Kūrybiškas ir į detales orientuotas vyresnysis produkto dizaineris, turintis daugiau nei 8 metų patirtį kuriant intuityvias skaitmenines patirtis. Domiuosi sudėtingų problemų sprendimu, remiantis vartotoju ir duomenimis grįstais sprendimais. Turiu patirties vadovaujant dizaino komandoms ir kuriant verslo augimą skatinančius produktus.',
    skills: [
      { name: 'UI/UX dizainas', level: 95 },
      { name: 'Figma ir Sketch', level: 90 },
      { name: 'Prototipų kūrimas', level: 85 },
      { name: 'HTML/CSS', level: 80 },
      { name: 'Vartotojų tyrimai', level: 88 }
    ],
    languages: [
      { name: 'Anglų', level: 'Gimtoji' },
      { name: 'Ispanų', level: 'Profesinė' },
      { name: 'Prancūzų', level: 'Vidutinė' }
    ],
    additionalInfo: [
      {
        label: 'Vairuotojo pažymėjimas',
        value: 'A, B kategorijos'
      },
      {
        label: 'Sertifikatai',
        value: 'C++ Pro'
      }
    ],
    experiences: [
      {
        title: 'Vyresnysis produkto dizaineris',
        company: 'TechCorp Inc.',
        date: '2020 m. sausis – dabar',
        bullets: [
          'Vadovavau SaaS platformos dizaino iniciatyvoms, aptarnaujančioms daugiau nei 100 tūkst. naudotojų, ir padidinau jų pasitenkinimą 40 %.',
          'Bendradarbiavau su įvairių sričių komandomis, siekiant apibrėžti produkto strategiją ir vystymo planą.',
          'Sukūriau ir palaikiau išsamią dizaino sistemą, naudojamą keliose produktų linijose.',
          'Mentoravau jaunesniuosius dizainerius ir vedžiau dizaino peržiūras siekiant gerinti komandos rezultatą.'
        ]
      },
      {
        title: 'Produkto dizaineris',
        company: 'StartupXYZ',
        date: '2017 m. kovas – 2019 m. gruodis',
        bullets: [
          'Kūriau ir įgyvendinau mobiliąsias ir žiniatinklio patirtis el. prekybos platformai.',
          'Vykdžiau vartotojų tyrimus ir naudotojų testavimą, kad pagrįsčiau dizaino sprendimus.',
          'Kūriau wireframe’us, prototipus ir aukštos raiškos maketus.',
          'Padidinau konversijų rodiklį 25 % nuosekliai gerinant dizainą.'
        ]
      },
      {
        title: 'Jaunesnysis UI/UX dizaineris',
        company: 'Design Studio Co.',
        date: '2015 m. birželis – 2017 m. vasaris',
        bullets: [
          'Dirbau su įvairiais klientų projektais – nuo mobiliųjų programėlių iki įmonių programinės įrangos.',
          'Kūriau adaptyvius žiniatinklio dizainus ir interaktyvius prototipus.',
          'Bendradarbiavau su programuotojais, kad būtų užtikrinta aukšta dizaino įgyvendinimo kokybė.'
        ]
      }
    ],
    education: [
      {
        degree: 'Dailės bakalauro laipsnis, grafikos dizainas',
        institution: 'Meno universitetas',
        date: '2011 – 2015 m.',
        description:
          'Baigiau su pagyrimu. Daugiausia dėmesio skyriau skaitmeniniam dizainui, tipografijai ir vartotojo patirčiai.'
      }
    ],
    volunteering: [
      {
        title: 'Dizaino mentorius',
        organization: 'DesignForGood iniciatyva',
        date: '2021 m. – dabar',
        bullets: [
          'Mentoruoju dizainerius iš nepakankamai atstovaujamų bendruomenių.',
          'Vedžiau mėnesinius seminarus apie dizaino principus ir karjeros planavimą.',
          'Peržiūriu portfelius ir teikiu konstruktyvų grįžtamąjį ryšį mentee.'
        ]
      },
      {
        title: 'UX dizaino savanoris',
        organization: 'Vietinė nevyriausybinė organizacija',
        date: '2019 – 2020 m.',
        bullets: [
          'Atnaujinau organizacijos svetainės dizainą, kad pagerinčiau prieinamumą ir įsitraukimą.',
          'Padidinau internetinių aukų kiekį 35 %, pagerinus vartotojo patirtį.'
        ]
      }
    ]
  }
};
