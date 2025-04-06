// Your web app's Firebase configuration
// Replace this object with the configuration from your Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyArelhcucu4_hcR28RsYXoOar1tYVshkoI",
  authDomain: "alcoholtracker-1cb4b.firebaseapp.com",
  projectId: "alcoholtracker-1cb4b",
  storageBucket: "alcoholtracker-1cb4b.appspot.com",
  messagingSenderId: "560186494253",
  appId: "1:560186494253:web:1678f40f7df2064ec397a4",
  measurementId: "G-SCE5CQVX86"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Configure Firestore for simpler and more reliable syncing
// Disable persistence and caching for more immediate sync
db.settings({
  cacheSizeBytes: 0, // Disable cache for testing
  ignoreUndefinedProperties: true // More lenient data handling
});

/*
  IMPORTANT: Before using this app, you need to replace the placeholder 
  Firebase configuration above with your own Firebase project configuration.
  
  Instructions:
  1. Go to https://firebase.google.com/ and sign in with your Google account
  2. Click "Go to console" and select your project
  3. Click on the gear icon (⚙️) next to "Project Overview"
  4. Select "Project settings"
  5. Scroll down to the "Your apps" section
  6. Copy the configuration object and replace the one above
  7. Enable Email/Password authentication in the Firebase console
     (Authentication > Sign-in method > Email/Password)
  8. Create Firestore database in the Firebase console
     (Firestore Database > Create database)
*/ 

/*
  Next steps:
  1. Set up authentication methods in Firebase console:
     a. Email/Password authentication:
        - Go to Authentication > Sign-in method
        - Enable Email/Password provider
     
     b. Google authentication:
        - Go to Authentication > Sign-in method
        - Enable Google provider
        - Add your support email
  
  2. Create Firestore database in the Firebase console:
     - Go to Firestore Database > Create database
     - Start in test mode for development
     - Choose your preferred location
  
  3. Push your updated code to GitHub:
     - Commit and push all changes to your repository
  
  4. Your app should now connect to Firebase when accessed via GitHub Pages!
*/ 