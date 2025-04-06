// DOM elements
// Auth elements
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const currentProfile = document.getElementById('current-profile');
const authModal = document.getElementById('auth-modal');
const closeBtn = document.querySelector('.close');
const loginFormContainer = document.getElementById('login-form-container');
const registerFormContainer = document.getElementById('register-form-container');
const switchToRegisterBtn = document.getElementById('switch-to-register');
const switchToLoginBtn = document.getElementById('switch-to-login');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const appContent = document.getElementById('app-content');
const loginMessage = document.getElementById('login-message');
const authDebugInfo = document.getElementById('auth-debug-info');
const authDebugContainer = document.querySelector('.auth-debug');

// App elements
const alcoholForm = document.getElementById('alcohol-form');
const dateInput = document.getElementById('date');
const drinkTypeSelect = document.getElementById('drink-type');
const standardDrinksInput = document.getElementById('standard-drinks');
const calendarEl = document.getElementById('calendar');
const weeklyTotalEl = document.getElementById('weekly-total');
const monthlyAverageEl = document.getElementById('monthly-average');
const soberDaysEl = document.getElementById('sober-days');
const achievementsContainer = document.getElementById('achievements-container');
const shareBtn = document.getElementById('share-btn');
const shareLinkContainer = document.getElementById('share-link-container');
const shareLinkEl = document.getElementById('share-link');
const copyBtn = document.getElementById('copy-btn');

// Show debug info in development
const isDebugMode = true;
if (isDebugMode && authDebugContainer) {
    authDebugContainer.style.display = 'block';
}

// Global state
let currentUser = null;
let drinkEntries = [];
let achievements = [];

// Achievement definitions
const achievementDefinitions = [
    {
        id: 'first_entry',
        title: 'First Step',
        description: 'Log your first drink entry',
        icon: '🏆',
        condition: (entries) => entries.length > 0
    },
    {
        id: 'week_tracking',
        title: 'Week Tracker',
        description: 'Track your drinks for 7 consecutive days',
        icon: '📊',
        condition: (entries) => hasConsecutiveDays(entries, 7)
    },
    {
        id: 'month_tracking',
        title: 'Month Master',
        description: 'Track your drinks for 30 days',
        icon: '📅',
        condition: (entries) => entries.length >= 30
    },
    {
        id: 'three_sober_days',
        title: 'Three Day Streak',
        description: 'Stay sober for 3 consecutive days',
        icon: '🌟',
        condition: (entries) => hasSoberStreak(entries, 3)
    },
    {
        id: 'week_sober',
        title: 'Week Warrior',
        description: 'Stay sober for 7 consecutive days',
        icon: '🏅',
        condition: (entries) => hasSoberStreak(entries, 7)
    },
    {
        id: 'two_weeks_sober',
        title: 'Two Week Champion',
        description: 'Stay sober for 14 consecutive days',
        icon: '🥇',
        condition: (entries) => hasSoberStreak(entries, 14)
    },
    {
        id: 'month_sober',
        title: 'Monthly Master',
        description: 'Stay sober for 30 consecutive days',
        icon: '👑',
        condition: (entries) => hasSoberStreak(entries, 30)
    },
    {
        id: 'reduced_50',
        title: 'Halfway There',
        description: 'Reduce your weekly average by 50%',
        icon: '📉',
        condition: (entries) => hasReducedConsumption(entries, 0.5)
    },
    {
        id: 'shared_progress',
        title: 'Sharing is Caring',
        description: 'Share your progress with a friend',
        icon: '🔗',
        condition: () => sessionStorage.getItem('hasShared') === 'true'
    }
];

// Initialize date picker
flatpickr(dateInput, {
    defaultDate: 'today',
    maxDate: 'today',
    dateFormat: 'Y-m-d'
});

// Debug logger
function logDebug(message, data = null) {
    if (isDebugMode && authDebugInfo) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        let logMessage = `[${timestamp}] ${message}`;
        
        if (data) {
            try {
                // If data is an error object, get its message and stack
                if (data instanceof Error) {
                    logMessage += `\nError: ${data.message}\n${data.stack || ''}`;
                } else {
                    logMessage += '\n' + JSON.stringify(data, null, 2);
                }
            } catch (e) {
                logMessage += `\nData: ${data}`;
            }
        }
        
        authDebugInfo.textContent = logMessage + '\n\n' + authDebugInfo.textContent;
        console.log(logMessage, data);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    logDebug('App initialized');
    
    try {
        // Verify Firebase is loaded
        if (typeof firebase === 'undefined') {
            logDebug('Firebase not loaded!');
        } else {
            logDebug('Firebase loaded successfully');
            // Check Firebase auth
            if (typeof firebase.auth === 'undefined') {
                logDebug('Firebase Auth not loaded!');
            } else {
                logDebug('Firebase Auth loaded successfully');
                
                // Check for redirect result
                auth.getRedirectResult()
                    .then((result) => {
                        if (result.user) {
                            logDebug('Google sign-in redirect successful', { 
                                uid: result.user.uid,
                                email: result.user.email,
                                displayName: result.user.displayName
                            });
                            
                            // Check if this is a new user
                            const isNewUser = result.additionalUserInfo.isNewUser;
                            if (isNewUser) {
                                logDebug('New user from redirect - creating profile document');
                                // Create initial user document in Firestore
                                return db.collection('users').doc(result.user.uid).set({
                                    displayName: result.user.displayName,
                                    email: result.user.email,
                                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                });
                            }
                        }
                    })
                    .catch((error) => {
                        logDebug('Google sign-in redirect result error', error);
                        // Don't show error to user for redirect result, as they may just be visiting the page
                    });
            }
        }
        
        initializeApp();
        
        // Add Google login button if it exists
        const googleLoginBtn = document.getElementById('google-login-btn');
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logDebug('Google login button clicked');
                loginWithGoogle();
            });
        } else {
            logDebug('Google login button not found!');
        }
        
        // Add Google register button if it exists
        const googleRegisterBtn = document.getElementById('google-register-btn');
        if (googleRegisterBtn) {
            googleRegisterBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logDebug('Google register button clicked');
                loginWithGoogle(); // Uses the same function as login
            });
        }
    } catch (error) {
        logDebug('Error during initialization', error);
    }
});

// Auth event listeners
loginBtn.addEventListener('click', function() {
    showAuthModal('login');
});

registerBtn.addEventListener('click', function() {
    showAuthModal('register');
});

logoutBtn.addEventListener('click', function() {
    logout();
});

closeBtn.addEventListener('click', function() {
    authModal.style.display = 'none';
});

window.addEventListener('click', function(e) {
    if (e.target === authModal) {
        authModal.style.display = 'none';
    }
});

switchToRegisterBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showAuthForm('register');
});

switchToLoginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showAuthForm('login');
});

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    login(email, password);
});

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const displayName = document.getElementById('register-name').value;
    register(email, password, displayName);
});

// App event listeners
alcoholForm.addEventListener('submit', function(e) {
    e.preventDefault();
    addDrinkEntry();
});

shareBtn.addEventListener('click', function() {
    generateShareLink();
});

copyBtn.addEventListener('click', function() {
    copyShareLink();
});

// Authentication functions
function initializeApp() {
    // Check if user is logged in
    logDebug('Setting up auth state listener');
    auth.onAuthStateChanged(async function(user) {
        if (user) {
            logDebug('User logged in', { uid: user.uid, email: user.email, displayName: user.displayName });
            currentUser = user;
            await loadUserData();
            updateUI();
        } else {
            logDebug('No user logged in');
            currentUser = null;
            showLoginScreen();
        }
    });
}

function showAuthModal(type) {
    authModal.style.display = 'block';
    showAuthForm(type);
}

function showAuthForm(type) {
    if (type === 'login') {
        loginFormContainer.style.display = 'block';
        registerFormContainer.style.display = 'none';
    } else {
        loginFormContainer.style.display = 'none';
        registerFormContainer.style.display = 'block';
    }
}

function login(email, password) {
    logDebug('Attempting to login with email', { email });
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            logDebug('Email login successful');
            authModal.style.display = 'none';
            loginForm.reset();
        })
        .catch(error => {
            logDebug('Email login failed', error);
            showAlert(loginFormContainer, error.message, 'error');
        });
}

function loginWithGoogle() {
    logDebug('Attempting Google sign-in');
    try {
        if (!firebase.auth) {
            logDebug('Firebase Auth not available');
            showAlert(loginFormContainer, 'Firebase Auth not available', 'error');
            return;
        }
        
        if (!firebase.auth.GoogleAuthProvider) {
            logDebug('Google Auth Provider not available');
            showAlert(loginFormContainer, 'Google Auth Provider not available', 'error');
            return;
        }
        
        const provider = new firebase.auth.GoogleAuthProvider();
        logDebug('Google Auth Provider created');
        
        // Close the modal before redirect
        authModal.style.display = 'none';
        
        // Use redirect instead of popup
        auth.signInWithRedirect(provider)
            .catch(error => {
                logDebug('Google sign-in redirect failed', error);
                showAlert(loginFormContainer, error.message, 'error');
            });
    } catch (error) {
        logDebug('Error in Google sign-in', error);
        showAlert(loginFormContainer, 'Error initializing Google sign-in: ' + error.message, 'error');
    }
}

function register(email, password, displayName) {
    logDebug('Attempting to register', { email, displayName });
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            logDebug('User created successfully');
            // Set display name
            return userCredential.user.updateProfile({
                displayName: displayName
            });
        })
        .then(() => {
            logDebug('Display name updated');
            // Create initial user document in Firestore
            return db.collection('users').doc(auth.currentUser.uid).set({
                displayName: displayName,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            logDebug('User document created in Firestore');
            authModal.style.display = 'none';
            registerForm.reset();
        })
        .catch(error => {
            logDebug('Registration failed', error);
            showAlert(registerFormContainer, error.message, 'error');
        });
}

function logout() {
    logDebug('Logging out');
    auth.signOut()
        .then(() => {
            logDebug('Logout successful');
            showLoginScreen();
        })
        .catch(error => {
            logDebug('Logout failed', error);
            console.error('Logout error:', error);
        });
}

function showAlert(container, message, type) {
    // Remove any existing alert
    const existingAlert = container.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Insert at the top of the container
    container.insertBefore(alert, container.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Data functions
async function loadUserData() {
    try {
        // Load user drink entries
        const entriesSnapshot = await db.collection('users').doc(currentUser.uid)
            .collection('drinkEntries').orderBy('date').get();
        
        drinkEntries = entriesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                date: data.date,
                drinks: data.drinks
            };
        });
        
        // Load user achievements
        const achievementsDoc = await db.collection('users').doc(currentUser.uid)
            .collection('userData').doc('achievements').get();
        
        if (achievementsDoc.exists) {
            achievements = achievementsDoc.data().list || [];
        } else {
            achievements = [];
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function addDrinkEntry() {
    if (!currentUser) return;
    
    const date = dateInput.value;
    const drinkType = drinkTypeSelect.value;
    const standardDrinks = parseFloat(standardDrinksInput.value);
    
    try {
        // Check if there's already an entry for this date
        const existingEntryIndex = drinkEntries.findIndex(entry => entry.date === date);
        
        if (existingEntryIndex !== -1) {
            // Update existing entry
            const existingEntry = drinkEntries[existingEntryIndex];
            const updatedDrinks = [...existingEntry.drinks, {
                type: drinkType,
                amount: standardDrinks
            }];
            
            // Update in Firestore
            await db.collection('users').doc(currentUser.uid)
                .collection('drinkEntries').doc(existingEntry.id)
                .update({
                    drinks: updatedDrinks
                });
            
            // Update local state
            drinkEntries[existingEntryIndex].drinks = updatedDrinks;
        } else {
            // Create new entry
            const newEntry = {
                date,
                drinks: [{
                    type: drinkType,
                    amount: standardDrinks
                }]
            };
            
            // Add to Firestore
            const docRef = await db.collection('users').doc(currentUser.uid)
                .collection('drinkEntries').add(newEntry);
            
            // Update local state
            drinkEntries.push({
                id: docRef.id,
                ...newEntry
            });
            
            // Sort entries by date
            drinkEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
        
        // Update UI
        renderCalendar();
        updateStats();
        checkAchievements();
        
        // Reset form
        alcoholForm.reset();
        dateInput._flatpickr.setDate('today');
    } catch (error) {
        console.error('Error adding drink entry:', error);
        alert('Error adding drink entry: ' + error.message);
    }
}

async function checkAchievements() {
    if (!currentUser) return;
    
    let newAchievements = false;
    
    for (const def of achievementDefinitions) {
        if (!achievements.includes(def.id) && def.condition(drinkEntries)) {
            achievements.push(def.id);
            newAchievements = true;
        }
    }
    
    if (newAchievements) {
        try {
            // Save achievements to Firestore
            await db.collection('users').doc(currentUser.uid)
                .collection('userData').doc('achievements')
                .set({
                    list: achievements,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            
            renderAchievements();
        } catch (error) {
            console.error('Error saving achievements:', error);
        }
    }
}

// UI functions
function updateUI() {
    // Show user's display name
    currentProfile.textContent = currentUser.displayName || currentUser.email;
    
    // Show logout button instead of login/register
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    
    // Show app content
    appContent.style.display = 'block';
    loginMessage.style.display = 'none';
    
    // Render data
    renderCalendar();
    updateStats();
    renderAchievements();
}

function showLoginScreen() {
    // Hide app content
    appContent.style.display = 'none';
    loginMessage.style.display = 'block';
    
    // Show login/register buttons
    loginBtn.style.display = 'inline-block';
    registerBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    
    // Update profile display
    currentProfile.textContent = 'Not logged in';
    
    // Clear data
    drinkEntries = [];
    achievements = [];
}

function renderCalendar() {
    // Clear calendar
    calendarEl.innerHTML = '';
    
    // Get current month
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Add day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day calendar-day-header';
        dayHeader.textContent = day;
        calendarEl.appendChild(dayHeader);
    });
    
    // Get first day of month
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    // Get number of days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Add empty cells for days before first of month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarEl.appendChild(emptyDay);
    }
    
    // Add days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        
        // Check if there's an entry for this day
        const entry = drinkEntries.find(entry => entry.date === date);
        
        if (entry) {
            // Calculate total drinks for this day
            const totalDrinks = entry.drinks.reduce((sum, drink) => sum + drink.amount, 0);
            
            if (totalDrinks > 0) {
                dayEl.classList.add('has-drinks');
                
                // Add drinks count
                const drinksCount = document.createElement('span');
                drinksCount.className = 'drinks-count';
                drinksCount.textContent = totalDrinks;
                dayEl.appendChild(drinksCount);
            } else {
                dayEl.classList.add('no-drinks');
            }
        }
        
        // Highlight today
        if (day === today.getDate()) {
            dayEl.style.border = '2px solid var(--primary-color)';
        }
        
        calendarEl.appendChild(dayEl);
    }
}

function updateStats() {
    // Calculate weekly total
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weeklyDrinks = drinkEntries
        .filter(entry => new Date(entry.date) >= weekStart)
        .reduce((sum, entry) => {
            return sum + entry.drinks.reduce((entrySum, drink) => entrySum + drink.amount, 0);
        }, 0);
    
    weeklyTotalEl.textContent = `${weeklyDrinks.toFixed(1)} drinks`;
    
    // Calculate monthly average
    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 30);
    
    const monthlyEntries = drinkEntries.filter(entry => new Date(entry.date) >= monthStart);
    const monthlyDrinks = monthlyEntries.reduce((sum, entry) => {
        return sum + entry.drinks.reduce((entrySum, drink) => entrySum + drink.amount, 0);
    }, 0);
    
    const monthlyAverage = monthlyDrinks / 30;
    monthlyAverageEl.textContent = `${monthlyAverage.toFixed(1)} drinks/day`;
    
    // Calculate sober days
    const soberDays = calculateSoberDays();
    soberDaysEl.textContent = `${soberDays} days`;
}

function calculateSoberDays() {
    // Get dates from past 30 days
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const formattedDate = date.toISOString().split('T')[0];
        dates.push(formattedDate);
    }
    
    // Count days with no drinks
    let soberDays = 0;
    
    dates.forEach(date => {
        const entry = drinkEntries.find(entry => entry.date === date);
        
        if (!entry || entry.drinks.reduce((sum, drink) => sum + drink.amount, 0) === 0) {
            soberDays++;
        }
    });
    
    return soberDays;
}

function renderAchievements() {
    // Clear container
    achievementsContainer.innerHTML = '';
    
    // Render each achievement
    achievementDefinitions.forEach(def => {
        const isUnlocked = achievements.includes(def.id);
        
        const achievementEl = document.createElement('div');
        achievementEl.className = `achievement ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        const iconEl = document.createElement('div');
        iconEl.className = 'achievement-icon';
        iconEl.textContent = def.icon;
        
        const titleEl = document.createElement('div');
        titleEl.className = 'achievement-title';
        titleEl.textContent = def.title;
        
        const descEl = document.createElement('div');
        descEl.className = 'achievement-description';
        descEl.textContent = def.description;
        
        achievementEl.appendChild(iconEl);
        achievementEl.appendChild(titleEl);
        achievementEl.appendChild(descEl);
        
        achievementsContainer.appendChild(achievementEl);
    });
}

function generateShareLink() {
    if (!currentUser) return;
    
    // Create shareable data
    const shareData = {
        achievements,
        stats: {
            weeklyTotal: weeklyTotalEl.textContent,
            monthlyAverage: monthlyAverageEl.textContent,
            soberDays: soberDaysEl.textContent
        },
        userName: currentUser.displayName || 'Anonymous'
    };
    
    // Encode data
    const encodedData = btoa(JSON.stringify(shareData));
    
    // Create link
    const shareLink = `${window.location.href.split('?')[0]}?share=${encodedData}`;
    
    // Update UI
    shareLinkEl.value = shareLink;
    shareLinkContainer.style.display = 'flex';
    
    // Mark as shared
    sessionStorage.setItem('hasShared', 'true');
    
    // Check achievements
    checkAchievements();
}

function copyShareLink() {
    shareLinkEl.select();
    document.execCommand('copy');
    
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = 'Copy';
    }, 2000);
}

// Utility functions for achievements
function hasSoberStreak(entries, days) {
    // Get all dates from past 60 days
    const allDates = [];
    const today = new Date();
    
    for (let i = 0; i < 60; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const formattedDate = date.toISOString().split('T')[0];
        allDates.push(formattedDate);
    }
    
    // Check each possible streak
    for (let i = 0; i <= allDates.length - days; i++) {
        const streak = allDates.slice(i, i + days);
        let isSoberStreak = true;
        
        for (const date of streak) {
            const entry = entries.find(entry => entry.date === date);
            
            if (entry && entry.drinks.reduce((sum, drink) => sum + drink.amount, 0) > 0) {
                isSoberStreak = false;
                break;
            }
        }
        
        if (isSoberStreak) {
            return true;
        }
    }
    
    return false;
}

function hasConsecutiveDays(entries, days) {
    // Get unique dates from entries
    const entryDates = entries.map(entry => entry.date);
    const uniqueDates = [...new Set(entryDates)];
    
    if (uniqueDates.length < days) {
        return false;
    }
    
    // Check for consecutive days
    uniqueDates.sort();
    let maxConsecutive = 1;
    let currentConsecutive = 1;
    
    for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i-1]);
        const currDate = new Date(uniqueDates[i]);
        
        const diffTime = Math.abs(currDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            currentConsecutive++;
            maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
        } else {
            currentConsecutive = 1;
        }
    }
    
    return maxConsecutive >= days;
}

function hasReducedConsumption(entries, ratio) {
    if (entries.length < 14) {
        return false;
    }
    
    // Get dates from past 60 days
    const allDates = [];
    const today = new Date();
    
    for (let i = 0; i < 60; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const formattedDate = date.toISOString().split('T')[0];
        allDates.push(formattedDate);
    }
    
    // First period (older 2 weeks)
    const firstPeriodDates = allDates.slice(30, 44);
    
    // Second period (recent 2 weeks)
    const secondPeriodDates = allDates.slice(0, 14);
    
    // Calculate totals for each period
    let firstPeriodTotal = 0;
    let secondPeriodTotal = 0;
    
    for (const date of firstPeriodDates) {
        const entry = entries.find(entry => entry.date === date);
        if (entry) {
            firstPeriodTotal += entry.drinks.reduce((sum, drink) => sum + drink.amount, 0);
        }
    }
    
    for (const date of secondPeriodDates) {
        const entry = entries.find(entry => entry.date === date);
        if (entry) {
            secondPeriodTotal += entry.drinks.reduce((sum, drink) => sum + drink.amount, 0);
        }
    }
    
    // Need entries in both periods
    if (firstPeriodTotal === 0) {
        return false;
    }
    
    // Check if consumption reduced by the specified ratio
    return secondPeriodTotal <= firstPeriodTotal * (1 - ratio);
}

// Check for shared data in URL
window.addEventListener('DOMContentLoaded', function() {
    // Check URL for shared data
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('share');
    
    if (sharedData) {
        try {
            const decodedData = JSON.parse(atob(sharedData));
            
            // Show shared data in a nice way
            const userName = decodedData.userName || 'Someone';
            
            // Create share view
            loginMessage.innerHTML = `
                <h2>${userName}'s Alcohol Tracker Progress</h2>
                <div class="shared-stats">
                    <div class="stat-card">
                        <h3>Weekly Total</h3>
                        <p>${decodedData.stats.weeklyTotal}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Monthly Average</h3>
                        <p>${decodedData.stats.monthlyAverage}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Sober Days</h3>
                        <p>${decodedData.stats.soberDays}</p>
                    </div>
                </div>
                <h3>Achievements (${decodedData.achievements.length} unlocked)</h3>
                <div class="shared-achievements">
                    ${achievementDefinitions
                        .filter(def => decodedData.achievements.includes(def.id))
                        .map(def => `
                            <div class="achievement unlocked">
                                <div class="achievement-icon">${def.icon}</div>
                                <div class="achievement-title">${def.title}</div>
                                <div class="achievement-description">${def.description}</div>
                            </div>
                        `).join('')}
                </div>
                <p class="create-own">Create your own tracker by logging in or registering!</p>
            `;
            
            // Add shared view styles
            const style = document.createElement('style');
            style.textContent = `
                .shared-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 20px 0;
                }
                .shared-achievements {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin: 20px 0;
                }
                .create-own {
                    margin-top: 30px;
                    font-weight: bold;
                    color: var(--primary-color);
                }
            `;
            document.head.appendChild(style);
        } catch (e) {
            console.error('Error parsing shared data:', e);
        }
    }
}); 