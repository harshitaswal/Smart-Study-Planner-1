// Local Storage utilities for Smart Study Planner

const STORAGE_KEY = 'smart-study-planner-goals';

// Load goals from localStorage
function loadGoalsFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading goals from localStorage:', error);
        return [];
    }
}

// Save goals to localStorage
function saveGoalsToStorage(goals) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    } catch (error) {
        console.error('Error saving goals to localStorage:', error);
    }
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Export functions to global scope for use in script.js
window.StorageAPI = {
    loadGoalsFromStorage,
    saveGoalsToStorage,
    generateId
};