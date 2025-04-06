# Alcohol Tracker

A web application to help you track your alcohol consumption and earn achievements for drinking less.

## Features

- **Calendar View**: See on which days you consumed alcohol
- **Achievement System**: Earn achievements for maintaining sobriety streaks and reducing consumption
- **Manual Input**: Log your drinks with amount and type
- **Statistics**: View weekly totals, monthly averages, and sober day counts
- **User Profiles**: Create your own account to save your data
- **Real-time Database**: Data stored in Firebase cloud database
- **Sharing**: Share your progress with friends via a special link

## Setup Instructions

### 1. Create a Firebase Project

1. Go to https://firebase.google.com/ and sign in with your Google account
2. Click "Go to console" and create a new project (give it a name like "alcohol-tracker")
3. Add a web app to your project by clicking the web icon (</>)
4. Register your app with a nickname (e.g., "alcohol-tracker")
5. Copy the Firebase configuration object

### 2. Update Firebase Configuration

1. Open the `firebase-config.js` file
2. Replace the placeholder configuration with your Firebase project configuration
3. Save the file

### 3. Set Up Firebase Authentication

1. In the Firebase console, navigate to "Authentication"
2. Click "Get started"
3. Enable the "Email/Password" sign-in method
4. Save your changes

### 4. Set Up Firestore Database

1. In the Firebase console, navigate to "Firestore Database"
2. Click "Create database"
3. Start in production mode or test mode (as preferred)
4. Choose a location closest to you
5. Click "Enable"

### 5. Deploy Your App

You can deploy your app to Firebase Hosting:

1. Install Firebase CLI (requires Node.js): `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize your project: `firebase init` (select Hosting)
4. Deploy: `firebase deploy`

Or you can use GitHub Pages as shown previously.

## How to Use

1. **Register an Account**: Create your own profile to start tracking
2. **Log Your Drinks**: Use the form to add drink entries for any date
3. **View Calendar**: The calendar shows days with and without drinks
4. **Track Achievements**: Earn achievements for drinking less and maintaining sober streaks
5. **Share Progress**: Generate a share link to show friends your achievements

## Achievements

The app includes several achievements you can unlock:

- First Step: Log your first drink entry
- Week Tracker: Track your drinks for 7 consecutive days
- Month Master: Track your drinks for 30 days
- Three Day Streak: Stay sober for 3 consecutive days
- Week Warrior: Stay sober for 7 consecutive days
- Two Week Champion: Stay sober for 14 consecutive days
- Monthly Master: Stay sober for 30 consecutive days
- Halfway There: Reduce your weekly average by 50%
- Sharing is Caring: Share your progress with a friend

## Privacy

Your data is stored in Firebase's secure cloud database. You have full control over your data and can delete your profile at any time.

## Disclaimer

This app is for informational purposes only. If you need help with alcohol dependency, please seek professional support. 