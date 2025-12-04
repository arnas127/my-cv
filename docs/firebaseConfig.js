// firebaseConfig.js
// 1) Replace the firebaseConfig values with the config from your Firebase console
// 2) Make sure you enabled Firestore for this project

// Your web app's Firebase configuration
// (copy from Firebase console -> Project settings -> General -> Your apps -> Web app)
const firebaseConfig = {
  apiKey: "AIzaSyBw_QSIdqNOfPHV4zMZy-8RclLlnXYjeB4",
  authDomain: "cv-store-3d5fc.firebaseapp.com",
  projectId: "cv-store-3d5fc",
  storageBucket: "cv-store-3d5fc.firebasestorage.app",
  messagingSenderId: "817568074674",
  appId: "1:817568074674:web:5dba388120a7bdd30ff2ab",
  measurementId: "G-J0KP37Q1J2"
};

// Initialize Firebase (using compat SDK)
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

/**
 * Fetch CV translations by password.
 * - `password` is used as document ID in the `cvs` collection.
 * - Each document should have a field `translations` which is the old CONTENT_TRANSLATIONS object.
 *   Example document data structure:
 *   {
 *     translations: {
 *       en: { ... },
 *       lt: { ... }
 *     }
 *   }
 *
 * Returns:
 *   - translations object (for all languages) if found
 *   - null if no document exists (wrong password)
 */
window.fetchCvByPassword = async function fetchCvByPassword(password) {
  const docRef = db.collection('cvs').doc(password);
  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();

  console.log(data);
  return data.translations || null;
};
