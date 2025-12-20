// Enhanced App.js - Professional Implementation

let quizStartTime = 0;
let quizTimerInterval = null;
let authToken = null;
let currentUser = null;
let debounceTimer = null;
let currentTopicId = null;
let currentTopicName = null;
let currentQuestionIndex = 0;
let topicQuestions = [];
let skippedQuestions = new Set();
let allTopics = [];
let userAnswers = {};

// Constants
const DEBOUNCE_DELAY = 300;
const MESSAGE_DURATION = 3000;
const API_TIMEOUT = 10000;

// Convert Google Drive view links to direct image URLs
function convertGoogleDriveUrl(url) {
    if (!url) return '';
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
    if (driveMatch && driveMatch[1]) {
        const fileId = driveMatch[1];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    return url;
}

// Initialize with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        checkAuth();
        loadTheme();
        setupEventListeners();
        setupKeyboardNavigation();
    } catch (error) {
        console.error('Initialization error:', error);
        showMessage('Application initialization failed. Please refresh.', 'error');
    }
});

// Enhanced Authentication Check
function checkAuth() {
    authToken = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!authToken || !userStr) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(userStr);
        updateUserInterface();
        showWelcomePopup();
        loadDataWithProgress();
    } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

// Update user interface with user data
function updateUserInterface() {
    const userNameEl = document.getElementById('userName');
    const welcomeNameEl = document.getElementById('welcomeName');
    
    if (userNameEl) userNameEl.textContent = currentUser.fullname;
    if (welcomeNameEl) welcomeNameEl.textContent = currentUser.fullname;
    
    if (currentUser.email === 'admin@zeta.com') {
        const adminBtn = document.getElementById('adminBtn');
        if (adminBtn) adminBtn.style.display = 'block';
    }
}

// Enhanced Theme Management
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    document.body.className = `${theme}-theme`;
    updateThemeIcon(theme);
    localStorage.setItem('theme', theme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = theme === 'light' ? '🌙' : '☀️';
        icon.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`);
    }
}

// Theme toggle with smooth transition
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', (event) => {
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        createRipple(themeToggle, event);
    });
}

// Ripple effect utility
function createRipple(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        top: ${y}px;
        left: ${x}px;
        pointer-events: none;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// Enhanced Welcome Popup
function showWelcomePopup() {
    const popup = document.getElementById('welcomePopup');
    if (popup) {
        popup.style.display = 'block';
        popup.removeAttribute('aria-hidden');
        document.body.style.overflow = 'hidden';
        
        const focusableElements = popup.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }
}

// Enhanced Message System
function showMessage(message, type = 'success') {
    const popup = document.getElementById('messagePopup');
    if (!popup) return;
    
    if (popup.timeoutId) {
        clearTimeout(popup.timeoutId);
    }
    
    popup.textContent = message;
    popup.className = `message-popup ${type} show`;
    popup.setAttribute('role', 'alert');
    popup.setAttribute('aria-live', 'polite');
    
    popup.timeoutId = setTimeout(() => {
        popup.classList.remove('show');
    }, MESSAGE_DURATION);
    
    popup.onclick = () => {
        popup.classList.remove('show');
        clearTimeout(popup.timeoutId);
    };
}

// Enhanced Event Listeners Setup
function setupEventListeners() {
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            const popup = document.getElementById('welcomePopup');
            if (popup) {
                continueBtn.blur();
                setTimeout(() => {
                    popup.style.display = 'none';
                    popup.setAttribute('aria-hidden', 'true');
                    document.body.style.overflow = '';
                    const mainContent = document.querySelector('.main-content');
                    if (mainContent) {
                        mainContent.setAttribute('tabindex', '-1');
                        mainContent.focus();
                        mainContent.removeAttribute('tabindex');
                    }
                }, 0);
            }
        });
    }

    // Account Button
    const accountBtn = document.getElementById('accountBtn');
    if (accountBtn) {
        accountBtn.addEventListener('click', () => openModal('accountModal'));
    }

    // Admin Button
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', openAdminDashboard);
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Update Password
    const updatePasswordBtn = document.getElementById('updatePasswordBtn');
    if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener('click', () => {
            closeModal('accountModal');
            openModal('updatePasswordModal');
        });
    }

    // Help
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', handleHelp);
    }

    // Delete Account
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    }

    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Update Password Form
    const updatePasswordForm = document.getElementById('updatePasswordForm');
    if (updatePasswordForm) {
        updatePasswordForm.addEventListener('submit', updatePassword);
    }

    // Show More Papers
    const showMorePapers = document.getElementById('showMorePapers');
    if (showMorePapers) {
        showMorePapers.addEventListener('click', () => openModal('allPapersModal'));
    }

    // Paper Search with debounce
    const paperSearch = document.getElementById('paperSearch');
    if (paperSearch) {
        paperSearch.addEventListener('input', (e) => {
            debounceSearch(e.target.value);
        });
    }
    // Topic Search with debounce
    const topicSearch = document.getElementById('topicSearch');
    if (topicSearch) {
        topicSearch.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                searchTopics(e.target.value);
            }, DEBOUNCE_DELAY);
        });
    }
}

// Debounced search
function debounceSearch(query) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        searchPapers(query);
    }, DEBOUNCE_DELAY);
}

// Keyboard Navigation Setup
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal[style*="display: block"]');
            openModals.forEach(modal => closeModal(modal.id));
        }
    });
}

// Modal Management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        modal.removeAttribute('aria-hidden');
        document.body.style.overflow = 'hidden';
        
        const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) {
            setTimeout(() => focusable.focus(), 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const activeElement = document.activeElement;
        if (modal.contains(activeElement)) {
            activeElement.blur();
        }
        
        setTimeout(() => {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }, 0);
    }
}

// Enhanced Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        showMessage('Logging out...', 'info');
        
        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }, 500);
    }
}

// Enhanced Update Password
async function updatePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value.trim();
    const newPassword = document.getElementById('newPasswordUpdate').value.trim();
    const confirmPassword = document.getElementById('confirmPasswordUpdate').value.trim();
    
    if (!validatePassword(newPassword, confirmPassword)) {
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    try {
        const response = await fetchWithTimeout(`${API_URL}/auth/update-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Password updated successfully!', 'success');
            closeModal('updatePasswordModal');
            document.getElementById('updatePasswordForm').reset();
        } else {
            showMessage(data.message || 'Password update failed', 'error');
        }
    } catch (error) {
        console.error('Password update error:', error);
        showMessage(error.message || 'Error updating password', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Password validation
function validatePassword(newPassword, confirmPassword) {
    if (newPassword.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return false;
    }
    
    if (newPassword !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return false;
    }
    
    return true;
}

// Enhanced Delete Account
async function handleDeleteAccount() {
    const confirmed = confirm('⚠️ WARNING: This action cannot be undone!\n\nAre you absolutely sure you want to delete your account? All your data will be permanently removed.');
    
    if (!confirmed) return;
    
    const doubleCheck = prompt('Type "DELETE" to confirm account deletion:');
    if (doubleCheck !== 'DELETE') {
        showMessage('Account deletion cancelled', 'info');
        return;
    }

    try {
        showMessage('Deleting account...', 'info');
        
        const response = await fetchWithTimeout(`${API_URL}/auth/delete-account`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            showMessage('Account deleted successfully', 'success');
            setTimeout(() => {
                localStorage.clear();
                window.location.href = 'login.html';
            }, 1500);
        } else {
            const data = await response.json();
            showMessage(data.message || 'Account deletion failed', 'error');
        }
    } catch (error) {
        console.error('Account deletion error:', error);
        showMessage('Error deleting account', 'error');
    }
}

// Enhanced Help Handler
async function handleHelp() {
    try {
        showMessage('Loading help document...', 'info');
        
        const response = await fetchWithTimeout(`${API_URL}/help`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok && data.pdfUrl) {
            window.open(data.pdfUrl, '_blank');
        } else {
            showMessage('Help document not available', 'error');
        }
    } catch (error) {
        console.error('Error fetching help:', error);
        showMessage('Error loading help document', 'error');
    }
}

// Load Data with Progress Indicator
async function loadDataWithProgress() {
    const sections = [
        { fn: loadDailyQuiz, name: 'Daily Quiz' },
        { fn: loadCompetitiveQuiz, name: 'Topics' },
        { fn: loadPapers, name: 'Papers' },
        { fn: loadChannels, name: 'Channels' },
        { fn: loadApps, name: 'Apps' },
        { fn: loadAnalytics, name: 'Analytics' }
    ];
    
    for (const section of sections) {
        try {
            await section.fn();
        } catch (error) {
            console.error(`Error loading ${section.name}:`, error);
            showMessage(`Failed to load ${section.name}`, 'error');
        }
    }
}

// Enhanced Fetch with Timeout
async function fetchWithTimeout(url, options = {}, timeout = API_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. Please check your connection.');
        }
        throw error;
    }
}

// Enhanced Load Daily Quiz
async function loadDailyQuiz() {
    const container = document.getElementById('dailyQuizContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="skeleton" style="height: 200px; border-radius: 12px;"></div>';
    
    try {
        const response = await fetchWithTimeout(`${API_URL}/quiz/daily`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();

        if (response.ok && data) {
            if (data.hasAttempted) {
                container.innerHTML = `
                    <div class="quiz-completed">
                        <div class="completed-header">
                            <span class="completed-icon">✓</span>
                            <h4>Today's Quiz Completed!</h4>
                        </div>
                        <div class="quiz-question">
                            <p class="question-text">${escapeHtml(data.question)}</p>
                            <div class="answer-display">
                                <div class="answer-option ${data.correctOption === 'A' ? 'correct' : ''}">
                                    A. ${escapeHtml(data.optionA)}
                                </div>
                                <div class="answer-option ${data.correctOption === 'B' ? 'correct' : ''}">
                                    B. ${escapeHtml(data.optionB)}
                                </div>
                                <div class="answer-option ${data.correctOption === 'C' ? 'correct' : ''}">
                                    C. ${escapeHtml(data.optionC)}
                                </div>
                                <div class="answer-option ${data.correctOption === 'D' ? 'correct' : ''}">
                                    D. ${escapeHtml(data.optionD)}
                                </div>
                            </div>
                            <div class="correct-answer-badge">
                                Correct Answer: ${data.correctOption}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="quiz-start-container">
                        <div class="quiz-start-icon">📝</div>
                        <h4>Daily Quiz Available!</h4>
                        <p>Test your knowledge with today's question</p>
                        <button class="btn-start-quiz" onclick="startDailyQuiz('${data._id}')">
                            Start Quiz
                        </button>
                    </div>
                `;
            }
        } else {
            container.innerHTML = '<p class="empty-message">📝 No daily quiz available today</p>';
        }
    } catch (error) {
        console.error('Error loading daily quiz:', error);
        container.innerHTML = '<p class="empty-message error">⚠️ Failed to load daily quiz</p>';
    }
}

// Start Daily Quiz
window.startDailyQuiz = async function(quizId) {
    try {
        const response = await fetchWithTimeout(`${API_URL}/quiz/daily/start`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            openQuizWindow(data, 'daily');
        } else {
            showMessage('Failed to start quiz', 'error');
        }
    } catch (error) {
        console.error('Error starting daily quiz:', error);
        showMessage('Error starting quiz', 'error');
    }
};

// Open Quiz Window
function openQuizWindow(question, type) {
    quizStartTime = Date.now();
    
    const container = type === 'daily' 
        ? document.getElementById('dailyQuizContainer')
        : document.getElementById('questionsContainer');
    
    if (!container) return;
    
    let html = '<div class="quiz-window">';
    html += '<div class="quiz-timer">⏱️ <span id="quizTimer">0s</span></div>';
    html += `<div class="quiz-question">
                <p class="question-text">${escapeHtml(question.question)}</p>
                <div class="options-container">
                    <button class="option-btn" data-answer="A">A. ${escapeHtml(question.optionA)}</button>
                    <button class="option-btn" data-answer="B">B. ${escapeHtml(question.optionB)}</button>
                    <button class="option-btn" data-answer="C">C. ${escapeHtml(question.optionC)}</button>
                    <button class="option-btn" data-answer="D">D. ${escapeHtml(question.optionD)}</button>
                </div>
            </div>`;
    html += '</div>';
    
    container.innerHTML = html;
    
    startQuizTimer();
    
    container.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const answer = this.getAttribute('data-answer');
            const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000);
            
            container.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
            
            await submitQuizAnswer(question._id, answer, type, timeSpent, question.correctOption);
        });
    });
}

// Timer functions
function startQuizTimer() {
    stopQuizTimer();
    
    quizTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - quizStartTime) / 1000);
        const timerEl = document.getElementById('quizTimer');
        if (timerEl) {
            timerEl.textContent = formatTime(elapsed);
        }
    }, 1000);
}

function stopQuizTimer() {
    if (quizTimerInterval) {
        clearInterval(quizTimerInterval);
        quizTimerInterval = null;
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

// Submit Quiz Answer
async function submitQuizAnswer(questionId, answer, type, timeSpent, correctOption) {
    try {
        showMessage('Submitting answer...', 'info');
        
        const response = await fetchWithTimeout(`${API_URL}/quiz/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ 
                questionId, 
                answer, 
                type, 
                timeSpent,
                correctOption 
            })
        });

        const data = await response.json();

        if (response.ok) {
            const isCorrect = data.isCorrect;
            showMessage(
                isCorrect ? '✓ Correct Answer!' : '✗ Wrong Answer!', 
                isCorrect ? 'success' : 'error'
            );
            
            setTimeout(() => {
                if (type === 'daily') {
                    stopQuizTimer();
                    loadDailyQuiz();
                } else {
                    // For competitive quiz, load next question
                    loadNextCompetitiveQuestion(correctOption);
                }
                loadAnalytics();
            }, 1500);
        } else {
            showMessage(data.message || 'Failed to submit answer', 'error');
        }
    } catch (error) {
        console.error('Error submitting answer:', error);
        showMessage('Error submitting answer', 'error');
    }
}

// Load Next Competitive Question
async function loadNextCompetitiveQuestion(lastCorrectOption) {
    const container = document.getElementById('questionsContainer');
    if (!container) return;
    
    // Show previous answer briefly
    const currentQuestion = topicQuestions[currentQuestionIndex];
    container.innerHTML = `
        <div class="answer-reveal">
            <h4>Question ${currentQuestionIndex + 1}</h4>
            <p class="question-text">${escapeHtml(currentQuestion.question)}</p>
            <div class="correct-answer-display">
                <span class="correct-icon">✓</span>
                Correct Answer: <strong>${lastCorrectOption}</strong>
            </div>
        </div>
    `;
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Move to next question
    currentQuestionIndex++;
    
    if (currentQuestionIndex < topicQuestions.length) {
        displayCurrentCompetitiveQuestion();
    } else {
        // All questions completed
        stopQuizTimer();
        const totalTime = Math.floor((Date.now() - quizStartTime) / 1000);
        container.innerHTML = `
            <div class="quiz-complete">
                <div class="complete-icon">🎉</div>
                <h3>Topic Completed!</h3>
                <p>You've answered all ${topicQuestions.length} questions</p>
                <p>Total Time: ${formatTime(totalTime)}</p>
                <button class="btn-primary" onclick="backToTopics()">Back to Topics</button>
            </div>
        `;
    }
}

// Display Current Competitive Question
function displayCurrentCompetitiveQuestion() {
    const container = document.getElementById('questionsContainer');
    if (!container || currentQuestionIndex >= topicQuestions.length) return;
    
    const question = topicQuestions[currentQuestionIndex];
    
    let html = '<div class="quiz-window">';
    html += '<div class="quiz-header">';
    html += `<button class="back-to-topics" onclick="confirmBackToTopics()">← Back to Topics</button>`;
    html += '<div class="quiz-timer">⏱️ <span id="quizTimer">0s</span></div>';
    html += '</div>';
    html += `<button class="skip-question-btn" onclick="skipQuestion()">Skip Question →</button>`;
    html += `<div class="question-progress">Question ${currentQuestionIndex + 1} of ${topicQuestions.length}</div>`;
    html += `<div class="quiz-question">
                <p class="question-text">${escapeHtml(question.question)}</p>
                <div class="options-container">
                    <button class="option-btn" data-answer="A">A. ${escapeHtml(question.optionA)}</button>
                    <button class="option-btn" data-answer="B">B. ${escapeHtml(question.optionB)}</button>
                    <button class="option-btn" data-answer="C">C. ${escapeHtml(question.optionC)}</button>
                    <button class="option-btn" data-answer="D">D. ${escapeHtml(question.optionD)}</button>
                </div>
            </div>`;
    html += '</div>';
    
    container.innerHTML = html;
    
    // Continue timer
    if (!quizTimerInterval) {
        startQuizTimer();
    }
    
container.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const answer = this.getAttribute('data-answer');
            const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000);
            
            container.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
            container.querySelector('.skip-question-btn').disabled = true;
            
            // Remove from skipped if it was skipped before
            skippedQuestions.delete(question._id);
            
            await submitQuizAnswer(question._id, answer, 'competitive', timeSpent, question.correctOption);
        });
    });
}

window.skipQuestion = function() {
    const question = topicQuestions[currentQuestionIndex];
    skippedQuestions.add(question._id);
    
    showMessage('Question skipped', 'info');
    
    // Move to next unanswered question
    currentQuestionIndex++;
    
    // Find next unanswered or skipped question
    while (currentQuestionIndex < topicQuestions.length) {
        const nextQuestion = topicQuestions[currentQuestionIndex];
        if (!userAnswers[nextQuestion._id] || skippedQuestions.has(nextQuestion._id)) {
            break;
        }
        currentQuestionIndex++;
    }
    
    if (currentQuestionIndex < topicQuestions.length) {
        displayCurrentCompetitiveQuestion();
    } else {
        // Check if there are any unanswered questions
        const hasUnanswered = topicQuestions.some(q => !userAnswers[q._id]);
        
        if (hasUnanswered) {
            // Go back to first unanswered
            currentQuestionIndex = topicQuestions.findIndex(q => !userAnswers[q._id]);
            displayCurrentCompetitiveQuestion();
        } else {
            // All done
            stopQuizTimer();
            const totalTime = Math.floor((Date.now() - quizStartTime) / 1000);
            const container = document.getElementById('questionsContainer');
            container.innerHTML = `
                <div class="quiz-complete">
                    <div class="complete-icon">🎉</div>
                    <h3>Topic Completed!</h3>
                    <p>You've answered all ${topicQuestions.length} questions</p>
                    <p>Total Time: ${formatTime(totalTime)}</p>
                    <button class="btn-primary" onclick="backToTopics()">Back to Topics</button>
                </div>
            `;
        }
    }
};

// Confirm Back to Topics
function confirmBackToTopics() {
    if (confirm('Are you sure you want to go back? Your progress will be saved but the timer will reset.')) {
        stopQuizTimer();
        backToTopics();
    }
}

// Enhanced Load Competitive Quiz
async function loadCompetitiveQuiz() {
    const container = document.getElementById('topicsContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="skeleton" style="height: 150px; border-radius: 12px;"></div>'.repeat(3);
    
    try {
        const response = await fetchWithTimeout(`${API_URL}/quiz/topics`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();

        if (response.ok && data.length > 0) {
            // Sort topics alphabetically
            allTopics = data.sort((a, b) => a.name.localeCompare(b.name));
            displayTopics(allTopics);
        } else {
            container.innerHTML = '<p class="empty-message">📚 No topics available yet</p>';
        }
    } catch (error) {
        console.error('Error loading topics:', error);
        container.innerHTML = '<p class="empty-message error">⚠️ Failed to load topics</p>';
    }
}

function displayTopics(topics) {
    const container = document.getElementById('topicsContainer');
    if (!container) return;
    
    if (topics.length === 0) {
        container.innerHTML = '<p class="empty-message">🔍 No topics found</p>';
        return;
    }
    
    container.innerHTML = topics.map(topic => `
        <button class="topic-btn" onclick="loadTopicQuestions('${topic._id}', '${escapeHtml(topic.name)}')" aria-label="Load ${escapeHtml(topic.name)} quiz">
            ${escapeHtml(topic.name)}
        </button>
    `).join('');
}

function searchTopics(query) {
    const searchQuery = query.toLowerCase().trim();
    
    if (!searchQuery) {
        displayTopics(allTopics);
        return;
    }
    
    const filteredTopics = allTopics.filter(topic => 
        topic.name.toLowerCase().includes(searchQuery)
    );
    
    displayTopics(filteredTopics);
}

window.searchTopics = searchTopics;

// Load Topic Questions
window.loadTopicQuestions = async function(topicId, topicName) {
    const container = document.getElementById('questionsContainer');
    const topicsContainer = document.getElementById('topicsContainer');
    const searchBar = document.getElementById('topicSearchBar');
    
    if (!container || !topicsContainer) return;
    
    currentTopicId = topicId;
    currentTopicName = topicName;
    currentQuestionIndex = 0;
    skippedQuestions.clear();
    
    container.innerHTML = '<div class="skeleton" style="height: 300px; border-radius: 12px;"></div>';
    topicsContainer.style.display = 'none';
    if (searchBar) searchBar.style.display = 'none';
    container.style.display = 'block';
    
    try {
        const response = await fetchWithTimeout(`${API_URL}/quiz/topic/${topicId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();

        if (response.ok && data.questions && data.questions.length > 0) {
            topicQuestions = data.questions;
            
            // Get user's answers
            const answersResponse = await fetchWithTimeout(`${API_URL}/quiz/user-answers-bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    questionIds: topicQuestions.map(q => q._id),
                    type: 'competitive'
                })
            });
            
            const { answers } = await answersResponse.json();
            userAnswers = answers;
            
            // Count answered questions
            const answeredCount = Object.keys(answers).length;
            const totalCount = topicQuestions.length;
            
            // Check if all questions are answered
            if (answeredCount === totalCount) {
                // Show review option
                showReviewOption(topicId, topicName);
            } else {
                // Find first unanswered question
                currentQuestionIndex = topicQuestions.findIndex(q => !answers[q._id]);
                if (currentQuestionIndex === -1) {
                    currentQuestionIndex = 0;
                }
                
                // Start timer and display question
                quizStartTime = Date.now();
                displayCurrentCompetitiveQuestion();
            }
        } else {
            container.innerHTML = `
                <button class="back-to-topics" onclick="backToTopics()">← Back to Topics</button>
                <p class="empty-message">No questions available in this topic</p>
            `;
        }
    } catch (error) {
        console.error('Error loading topic questions:', error);
        container.innerHTML = `
            <button class="back-to-topics" onclick="backToTopics()">← Back to Topics</button>
            <p class="empty-message error">⚠️ Failed to load questions</p>
        `;
    }
};

function backToTopics() {
    const topicsContainer = document.getElementById('topicsContainer');
    const questionsContainer = document.getElementById('questionsContainer');
    const searchBar = document.getElementById('topicSearchBar');
    
    currentTopicId = null;
    currentTopicName = null;
    currentQuestionIndex = 0;
    topicQuestions = [];
    skippedQuestions.clear();
    userAnswers = {};
    
    if (topicsContainer) topicsContainer.style.display = 'grid';
    if (questionsContainer) questionsContainer.style.display = 'none';
    if (searchBar) searchBar.style.display = 'block';
}

window.backToTopics = backToTopics;

function showReviewOption(topicId, topicName) {
    const container = document.getElementById('questionsContainer');
    
    container.innerHTML = `
        <div class="review-option-screen" style="display: block !important;">
            <button class="back-to-topics" onclick="backToTopics()">← Back to Topics</button>
            <div class="review-complete-icon">✅</div>
            <h3>All Questions Completed!</h3>
            <p>You've answered all ${topicQuestions.length} questions in this topic.</p>
            <button class="btn-primary" id="reviewAnswersBtn" >
                📝 Review Your Answers
            </button>
        </div>
    `;
    
    // Add event listener instead of onclick
    setTimeout(() => {
        const btn = document.getElementById('reviewAnswersBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                console.log('Review button clicked');
                showReviewAnswers(topicId, topicName);
            });
        }
    }, 100);
}

window.showReviewAnswers = async function(topicId, topicName) {
    const container = document.getElementById('questionsContainer');
    
    // Get all questions with user answers
    const questionsWithAnswers = topicQuestions.map((q, index) => {
        const userAnswer = userAnswers[q._id];
        const isCorrect = userAnswer === q.correctOption;
        return { ...q, userAnswer, isCorrect, index: index + 1 };
    });
    
    currentQuestionIndex = 0;
    displayReviewQuestion(questionsWithAnswers);
};

function displayReviewQuestion(questionsWithAnswers) {
    const container = document.getElementById('questionsContainer');
    
    // Force display first
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    
    const current = questionsWithAnswers[currentQuestionIndex];
    const totalQuestions = questionsWithAnswers.length;
    
    let html = '<div class="review-container" style="display: block !important; visibility: visible !important;">';
    html += '<div class="review-header">';
    html += `<button class="back-to-topics" onclick="backToTopics()">← Back to Topics</button>`;
    html += '<h4>Review Your Answers</h4>';
    html += '</div>';
    html += `<div class="review-progress">${currentQuestionIndex + 1} of ${totalQuestions} Questions</div>`;
    
    html += '<div class="review-question">';
    html += `<div class="question-number">Question ${current.index}</div>`;
    html += `<p class="question-text">${escapeHtml(current.question)}</p>`;
    html += '<div class="review-options-container">';
    
    ['A', 'B', 'C', 'D'].forEach(option => {
        const optionKey = `option${option}`;
        const isUserAnswer = current.userAnswer === option;
        const isCorrect = current.correctOption === option;
        
        let className = 'review-option';
        if (isCorrect) {
            className += ' correct';
        } else if (isUserAnswer && !isCorrect) {
            className += ' wrong';
        }
        
        html += `<div class="${className}">
            ${option}. ${escapeHtml(current[optionKey])}
            ${isCorrect ? '<span class="option-badge correct-badge">✓ Correct</span>' : ''}
            ${isUserAnswer && !isCorrect ? '<span class="option-badge wrong-badge">✗ Your Answer</span>' : ''}
        </div>`;
    });
    
    html += '</div>'; // close options-container
    html += '</div>'; // close review-question
    
    // Navigation buttons
    html += '<div class="review-navigation">';
    if (currentQuestionIndex > 0) {
        html += `<button class="btn-secondary" onclick="navigateReview(-1)">← Previous</button>`;
    }
    if (currentQuestionIndex < totalQuestions - 1) {
        html += `<button class="btn-primary" onclick="navigateReview(1)">Next →</button>`;
    } else {
        html += `<button class="btn-primary" onclick="backToTopics()">Finish Review</button>`;
    }
    html += '</div>';
    
    html += '</div>'; // close review-container
    
    container.innerHTML = html;
    
    // Force display after rendering
    setTimeout(() => {
        const reviewContainer = container.querySelector('.review-container');
        if (reviewContainer) {
            reviewContainer.style.display = 'block';
            reviewContainer.style.visibility = 'visible';
        }
        console.log('✅ Review question displayed:', current.index);
    }, 10);
}

window.navigateReview = function(direction) {
    const questionsWithAnswers = topicQuestions.map((q, index) => {
        const userAnswer = userAnswers[q._id];
        const isCorrect = userAnswer === q.correctOption;
        return { ...q, userAnswer, isCorrect, index: index + 1 };
    });
    
    currentQuestionIndex += direction;
    displayReviewQuestion(questionsWithAnswers);
};
// Enhanced Load Papers
async function loadPapers() {
    const recentContainer = document.getElementById('recentPapers');
    if (!recentContainer) return;
    
    recentContainer.innerHTML = '<div class="skeleton" style="height: 200px; border-radius: 12px;"></div>'.repeat(3);
    
    try {
        const response = await fetchWithTimeout(`${API_URL}/papers`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();

        if (response.ok && data.length > 0) {
            const recentPapers = data.slice(0, 3);
            recentContainer.innerHTML = recentPapers.map(paper => `
                <div class="paper-card" onclick="openPaper('${paper.pdfUrl}')" role="button" tabindex="0" aria-label="Open ${escapeHtml(paper.topicName)}">
                    <h3 class="paper-title">${escapeHtml(paper.topicName)}</h3>
                    <p class="paper-description">${escapeHtml(paper.description)}</p>
                    <span class="paper-link-indicator">📄 Open PDF →</span>
                </div>
            `).join('');

            const showMoreBtn = document.getElementById('showMorePapers');
            if (showMoreBtn) {
                showMoreBtn.style.display = data.length > 3 ? 'inline-block' : 'none';
            }

            displayAllPapers(data);
        } else {
            recentContainer.innerHTML = '<p class="empty-message">📚 No research papers available</p>';
        }
    } catch (error) {
        console.error('Error loading papers:', error);
        recentContainer.innerHTML = '<p class="empty-message error">⚠️ Failed to load papers</p>';
    }
}

function displayAllPapers(papers) {
    const container = document.getElementById('allPapersList');
    if (!container) return;
    
    container.innerHTML = papers.map(paper => `
        <div class="paper-card" onclick="openPaper('${paper.pdfUrl}')" role="button" tabindex="0">
            <h3 class="paper-title">${escapeHtml(paper.topicName)}</h3>
            <p class="paper-description">${escapeHtml(paper.description)}</p>
            <span class="paper-link-indicator">📄 Open PDF →</span>
        </div>
    `).join('');
}

async function searchPapers(query) {
    const container = document.getElementById('allPapersList');
    if (!container) return;
    
    if (!query.trim()) {
        const response = await fetchWithTimeout(`${API_URL}/papers`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        displayAllPapers(data);
        return;
    }
    
    container.innerHTML = '<div class="skeleton" style="height: 200px; border-radius: 12px;"></div>'.repeat(3);
    
    try {
        const response = await fetchWithTimeout(
            `${API_URL}/papers/search?q=${encodeURIComponent(query)}`,
            { headers: { 'Authorization': `Bearer ${authToken}` }}
        );
        
        const data = await response.json();
        
        if (data.length > 0) {
            displayAllPapers(data);
        } else {
            container.innerHTML = '<p class="empty-message">🔍 No papers found matching your search</p>';
        }
    } catch (error) {
        console.error('Error searching papers:', error);
        container.innerHTML = '<p class="empty-message error">⚠️ Search failed</p>';
    }
}

function openPaper(url) {
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}

window.openPaper = openPaper;

// Enhanced Load Channels
async function loadChannels() {
    const container = document.getElementById('channelsContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="skeleton" style="height: 200px; border-radius: 12px;"></div>'.repeat(3);
    
    try {
        const response = await fetchWithTimeout(`${API_URL}/channels`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();

        if (response.ok && data.length > 0) {
            container.innerHTML = data.map(channel => {
                const imageUrl = convertGoogleDriveUrl(channel.photoUrl);
                return `
                    <div class="channel-card">
                        ${imageUrl && imageUrl.trim() !== '' 
                            ? `<img src="${imageUrl}" alt="${escapeHtml(channel.name)}" class="card-image" crossorigin="anonymous">` 
                            : `<div class="card-image" style="background: linear-gradient(135deg, var(--primary-600), var(--primary-700)); display: flex; align-items: center; justify-content: center; font-size: 4rem;">📺</div>`
                        }
                        <div class="card-content">
                            <h3 class="channel-name">${escapeHtml(channel.name)}</h3>
                            <p class="channel-description">${escapeHtml(channel.description)}</p>
                            <a href="${channel.url}" target="_blank" rel="noopener noreferrer" class="channel-link">
                                Visit Channel →
                            </a>
                        </div>
                    </div>
                `;
            }).join('');
            
            container.querySelectorAll('.card-image[src]').forEach(img => {
                img.addEventListener('error', function() {
                    console.error('Failed to load image:', this.src);
                    this.outerHTML = '<div class="card-image" style="background: linear-gradient(135deg, var(--primary-600), var(--primary-700)); display: flex; align-items: center; justify-content: center; font-size: 4rem;">📺</div>';
                });
            });
        } else {
            container.innerHTML = '<p class="empty-message">📺 No YouTube channels available</p>';
        }
    } catch (error) {
        console.error('Error loading channels:', error);
        container.innerHTML = '<p class="empty-message error">⚠️ Failed to load channels</p>';
    }
}

// Enhanced Load Apps
async function loadApps() {
    const container = document.getElementById('appsContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="skeleton" style="height: 200px; border-radius: 12px;"></div>'.repeat(3);
    
    try {
        const response = await fetchWithTimeout(`${API_URL}/apps`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();

        if (response.ok && data.length > 0) {
            container.innerHTML = data.map(app => {
                const imageUrl = convertGoogleDriveUrl(app.photoUrl);
                return `
                    <div class="app-card">
                        ${imageUrl && imageUrl.trim() !== '' 
                            ? `<img src="${imageUrl}" alt="${escapeHtml(app.name)}" class="card-image" crossorigin="anonymous">` 
                            : `<div class="card-image" style="background: linear-gradient(135deg, var(--primary-600), var(--primary-700)); display: flex; align-items: center; justify-content: center; font-size: 4rem;">📱</div>`
                        }
                        <div class="card-content">
                            <h3 class="app-name">${escapeHtml(app.name)}</h3>
                            <p class="app-features">${escapeHtml(app.features)}</p>
                            <a href="${app.downloadUrl}" target="_blank" rel="noopener noreferrer" class="app-link">
                                Download App →
                            </a>
                        </div>
                    </div>
                `;
            }).join('');
            
            container.querySelectorAll('.card-image[src]').forEach(img => {
                img.addEventListener('error', function() {
                    console.error('Failed to load image:', this.src);
                    this.outerHTML = '<div class="card-image" style="background: linear-gradient(135deg, var(--primary-600), var(--primary-700)); display: flex; align-items: center; justify-content: center; font-size: 4rem;">📱</div>';
                });
            });
        } else {
            container.innerHTML = '<p class="empty-message">📱 No apps available</p>';
        }
    } catch (error) {
        console.error('Error loading apps:', error);
        container.innerHTML = '<p class="empty-message error">⚠️ Failed to load apps</p>';
    }
}

// Load Analytics
async function loadAnalytics() {
    try {
        const response = await fetchWithTimeout(`${API_URL}/quiz/analytics`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('totalTime').textContent = formatTime(data.totalTimeConsumed);
            document.getElementById('totalQuestions').textContent = data.totalQuestionsAnswered;
            document.getElementById('accuracy').textContent = `${data.accuracy}%`;
            document.getElementById('dailyAttempts').textContent = data.dailyQuizAttempts;
            document.getElementById('competitiveAttempts').textContent = data.competitiveQuizAttempts;
            document.getElementById('avgTime').textContent = formatTime(data.averageTimePerQuestion);
            document.getElementById('correctAnswers').textContent = data.correctAnswers;
            document.getElementById('wrongAnswers').textContent = data.wrongAnswers;
            
            const accuracyBar = document.getElementById('accuracyBar');
            if (accuracyBar) {
                accuracyBar.style.width = `${data.accuracy}%`;
                
                if (data.accuracy >= 80) {
                    accuracyBar.style.background = 'var(--success-500)';
                } else if (data.accuracy >= 60) {
                    accuracyBar.style.background = 'var(--warning-500)';
                } else {
                    accuracyBar.style.background = 'var(--error-500)';
                }
            }
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// XSS Protection
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Admin Dashboard
function openAdminDashboard() {
    openModal('adminModal');
    if (typeof loadAdminData === 'function') {
        loadAdminData();
    }
    if (typeof setupAdminListeners === 'function') {
        setupAdminListeners();
    }
}
console.log('✨ Zeta App System Initialized');