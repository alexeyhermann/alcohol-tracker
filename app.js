// Initialize data structures
let drinkEntries = JSON.parse(localStorage.getItem('drinkEntries')) || [];
let achievements = JSON.parse(localStorage.getItem('achievements')) || [];

// Define achievement list
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
        condition: () => localStorage.getItem('hasShared') === 'true'
    }
];

// DOM elements
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

// Initialize date picker
flatpickr(dateInput, {
    defaultDate: 'today',
    maxDate: 'today',
    dateFormat: 'Y-m-d'
});

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

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

// Functions
function initializeApp() {
    renderCalendar();
    updateStats();
    renderAchievements();
    checkForSharedData();
}

function addDrinkEntry() {
    const date = dateInput.value;
    const drinkType = drinkTypeSelect.value;
    const standardDrinks = parseFloat(standardDrinksInput.value);
    
    // Check if there's already an entry for this date
    const existingEntryIndex = drinkEntries.findIndex(entry => entry.date === date);
    
    if (existingEntryIndex !== -1) {
        // Update existing entry
        drinkEntries[existingEntryIndex].drinks.push({
            type: drinkType,
            amount: standardDrinks
        });
    } else {
        // Create new entry
        drinkEntries.push({
            date,
            drinks: [{
                type: drinkType,
                amount: standardDrinks
            }]
        });
    }
    
    // Sort entries by date
    drinkEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Save to localStorage
    localStorage.setItem('drinkEntries', JSON.stringify(drinkEntries));
    
    // Update UI
    renderCalendar();
    updateStats();
    checkAchievements();
    
    // Reset form
    alcoholForm.reset();
    dateInput._flatpickr.setDate('today');
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

function checkAchievements() {
    let newAchievements = false;
    
    achievementDefinitions.forEach(def => {
        if (!achievements.includes(def.id) && def.condition(drinkEntries)) {
            achievements.push(def.id);
            newAchievements = true;
        }
    });
    
    if (newAchievements) {
        localStorage.setItem('achievements', JSON.stringify(achievements));
        renderAchievements();
    }
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
    // Create shareable data
    const shareData = {
        achievements,
        stats: {
            weeklyTotal: weeklyTotalEl.textContent,
            monthlyAverage: monthlyAverageEl.textContent,
            soberDays: soberDaysEl.textContent
        }
    };
    
    // Encode data
    const encodedData = btoa(JSON.stringify(shareData));
    
    // Create link
    const shareLink = `${window.location.href.split('?')[0]}?share=${encodedData}`;
    
    // Update UI
    shareLinkEl.value = shareLink;
    shareLinkContainer.style.display = 'flex';
    
    // Mark as shared
    localStorage.setItem('hasShared', 'true');
    
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

function checkForSharedData() {
    // Check URL for shared data
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('share');
    
    if (sharedData) {
        try {
            const decodedData = JSON.parse(atob(sharedData));
            
            // Show shared achievements and stats
            alert('Viewing shared progress! This is view-only mode.');
            
            // Could implement showing the shared data here
            console.log('Shared data:', decodedData);
            
            // For now, just show a simple alert with stats
            alert(
                `Shared Stats:\n` +
                `Weekly Total: ${decodedData.stats.weeklyTotal}\n` +
                `Monthly Average: ${decodedData.stats.monthlyAverage}\n` +
                `Sober Days: ${decodedData.stats.soberDays}\n` +
                `Achievements: ${decodedData.achievements.length} unlocked`
            );
        } catch (e) {
            console.error('Error parsing shared data:', e);
        }
    }
} 