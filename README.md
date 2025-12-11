# 📄 my-cv

A **modern**, **elegant**, and **responsive** personal CV website built with  
**static HTML** + **Firebase Firestore** (no backend required).

It supports:
- 🔐 Password-protected access  
- 🌐 Multi-language (EN / LT)  
- 🎥 Optional intro video  
- 🖨 Beautiful print-ready layout  
- 📱 Full mobile responsiveness  
- 🖼 Optional profile photo  
- 🔗 Optional CV link in print  
- 🗂 Easy JSON import tool  

---

## 🚀 Run Locally

```bash
cd docs
ruby -run -e httpd . -p 8000
```

Then open in your browser:

👉 http://localhost:8000

> **Important:**  
> YouTube embedded videos do **not** work when opening the HTML directly from disk (`file://`).  
> You *must* serve using HTTP/HTTPS.

---

## 📥 Populate Data (Import JSON)

Open the import page:

👉 http://localhost:8000/import.html

Steps:

1. Choose your **JSON data file**  
2. Enter a **key** — this becomes your **password** for accessing the CV  
3. Click **Import**  
4. JSON is uploaded to Firestore under:  
   ```text
   cvs/<passwordKey>
   ```

The import tool accepts any of these input formats:

- A plain translations map:  
  `{ "en": { ... }, "lt": { ... } }`
- An object with a `translations` property:  
  `{ "translations": { "en": { ... }, "lt": { ... } } }`
- A full CV document including top‑level fields such as `profileImage`, `allowAsBase`, `useBaseCV`,
  and `translations` (this is what the CV page actually reads).

Example JSON file is included in:  
📁 `examples/example-data.json`

---

## 🔥 Firebase Setup

Follow these steps to set up Firebase Firestore so the CV can fetch translations securely.

### 1. Create a Firebase Project

Go to: https://console.firebase.google.com  
→ Create project → Continue.

### 2. Enable Firestore

Firebase console → **Firestore Database** →  
Click **Create database** → choose **Production mode** → Continue.

### 3. Add a Web App

Firebase console →  
**Project Settings** → **General** → **Your Apps** → “Web App”.

Copy the generated Firebase config:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Paste it into your project’s:

```text
firebaseConfig.js
```

### 4. Add "cvs" Collection in Firestore

In Firestore:

```text
collections
└── cvs
    └── <passwordKey>
        ├── profileImage: "https://…"
        ├── allowAsBase: true
        ├── useBaseCV: "cv-base"
        └── translations: { ... }
```

Each document inside **cvs** represents one CV dataset, keyed by its password.

### 5. Firestore Security Rules

Allow clients to **read one document by key**, but prevent listing or writing:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cvs/{cvId} {
      allow get: if true;                    // allow reading a single CV by password
      allow list: if false;                  // disallow listing all CVs
      allow create, update, delete: if false;// only import.html / console writes allowed
    }
  }
}
```

> You can temporarily relax `create/update` while importing initial data via the console or a trusted tool, then lock them back down.

### 6. Make Sure CORS / Localhost Works

The included `import.html` and the app both use Firebase JS SDK over HTTPS — no extra CORS config is needed.

---

## 📦 JSON Data Format

Each CV is stored as **one document** in the `cvs` collection in Firestore (see schema above).

The import tool accepts any of these input formats:

- A plain translations map:  
  `{ "en": { ... }, "lt": { ... } }`
- An object with a `translations` property:  
  `{ "translations": { "en": { ... }, "lt": { ... } } }`
- A full CV document including top‑level fields such as `profileImage`, `allowAsBase`, `useBaseCV`,
  and `translations` (this is what the CV page actually reads).

Internally, the CV page expects at least **one language block**: `"en"` or `"lt"` (or both).  
**At least one of them is required.**  
(Other languages are currently **not supported**.)

---

## 🧱 JSON Structure

Below is the full structure for a **full CV document** with explanations for each field.

```jsonc
{
  // --- Top-level CV document (one Firestore document in "cvs" collection) ---

  "profileImage": "",         // (optional) URL or base64 "data:image/png;base64,..."
                              // If missing → initials are shown

  "allowAsBase": true,        // (optional) If true, this CV may be used as a "base"
                              //           for other CVs (company‑specific variants).
                              //           Default: false.

  "useBaseCV": "cv-base",        // (optional) If present, this CV is a "nested" CV that
                              //           extends another CV whose key/password is
                              //           given here. Only one level of nesting is
                              //           supported.

  "translations": {
    "en": {                      // Language code (required: at least one: "en" or "lt")
      "documentTitle": "My CV", // (optional) Title for browser tab & PDF

      "videoIntroUrl": "",      // (optional) YouTube embed URL
                                // If empty or missing → video modal is skipped

      "cvUrl": "",              // (optional) CV URL shown only in print
                                // If missing → fallback from template is used

      "fullName": "John Doe",   // (required)
      "jobTitle": "Developer",  // (optional)

      "contact": {
        "email": "",            // (optional)
        "phone": "",            // (optional)
        "location": ""          // (optional)
      },

      "summary": "",            // (optional) Short personal summary

      "skills": [               // (optional)
        { "name": "React", "level": 90 }
      ],

      "languages": [            // (optional)
        { "name": "English", "level": "Native" }
      ],

      "additionalInfo": [       // (optional)
        { "label": "Hobbies", "value": "Photography" }
      ],

      "experiences": [          // (optional)
        {
          "title": "Developer",
          "company": "TechCorp",
          "date": "2020–Present",
          "bullets": [
            "Did something",
            "Did something else"
          ]
        }
      ],

      "education": [            // (optional)
        {
          "degree": "BSc Computer Science",
          "institution": "NYU",
          "date": "2013–2017",
          "description": "Specialization in Software Engineering"
        }
      ],

      "volunteering": [         // (optional)
        {
          "title": "Mentor",
          "organization": "Code for Good",
          "date": "2019–2021",
          "bullets": [
            "Taught HTML and CSS"
          ]
        }
      ]
    },

    "lt": {
      // Same structure as "en"
    }
  }
}
```

### Base CV & nested company-specific variants

You can reuse a **base CV** and create **company‑specific variants** without duplicating everything.

- Define a **base CV document** (for example with key/password `cv-base`) and set:

  - `"allowAsBase": true`
  - _no_ `"useBaseCV"` field

- Define one or more **nested CVs** (for example `cv-google`, `cv-meta`) and set:

  - `"useBaseCV": "cv-base"` to point to the base CV
  - optional `"profileImage"` override
  - a `translations` object that overrides / extends the base translations

At runtime the CV page:

- loads the CV document for the password you typed
- if it has a `"useBaseCV"` and the referenced document:
  - **exists**
  - has `"allowAsBase": true`
  - does **not** itself define `"useBaseCV"` (only one level allowed)

  then it merges them with these rules (per language, e.g. `en`, `lt`):

  - primitive fields (strings, numbers, booleans) in the nested CV **override** the base
  - objects (like `"contact"`) are merged by key (nested overrides base)
  - arrays (like `"experiences"`, `"education"`, `"volunteering"`, `"skills"`,
    `"languages"`, `"additionalInfo"`) are **prepended**:

    `finalArray = nestedItems + baseItems`

If `"useBaseCV"` is missing, invalid, or not allowed as base, the CV document is used **as‑is**.

---

## ℹ️ Important Notes

### Supported languages

- ✔ English (`en`)
- ✔ Lithuanian (`lt`)
- ❌ Other languages are **not supported** (ignored if present)

### Required

- At least **one** of the languages must be present (`en` or `lt`)
- Inside a language block, **only `fullName` is strictly required** for rendering

Everything else is optional.

### Optional but recommended fields

- **`videoIntroUrl`**  
  If missing → video modal is skipped after password.

- **`cvUrl`**  
  Only shown in **print** mode.  
  If missing → fallback from translation template.

- **`profileImage`**  
  If missing → initials are displayed.

### Importing data

Use the built-in importer:  
👉 http://localhost:8000/import.html

Upload your JSON → enter key → done.

---

## 🧪 Example Data File

See full example:  
📁 `examples/example-data.json`

---

## 🏁 You're Ready!

Your CV now supports:

- ✨ Multi-language  
- ✨ Responsive mobile layout  
- ✨ Print-optimized PDF export  
- ✨ Secure Firestore-based content  
- ✨ Quick import tool  

Happy CV building!
