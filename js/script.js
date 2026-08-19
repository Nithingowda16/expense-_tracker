/**
 * SpendWise - Personal Income & Expense Tracker Logic
 * Pure Vanilla JavaScript (ES6+)
 */

// --- 1. Application Constants & State ---
const STORAGE_KEY = 'spendWiseTransactions';

const CATEGORIES = {
    expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'],
    income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other']
};

let transactions = [];
let currentFilterType = 'all';
let currentFilterCategory = 'all';
let currentSearchQuery = '';
let currentSortOption = 'newest';
let pendingDeleteId = null;

// --- 2. DOM Element Selectors ---
const formElement = document.getElementById('transaction-form');
const formErrorAlert = document.getElementById('form-error-alert');
const typeIncomeRadio = document.getElementById('type-income');
const typeExpenseRadio = document.getElementById('type-expense');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const dateInput = document.getElementById('date');

const totalIncomeEl = document.getElementById('total-income-val');
const totalExpenseEl = document.getElementById('total-expense-val');
const remainingBalanceEl = document.getElementById('remaining-balance-val');
const balanceCardEl = document.querySelector('.balance-card');

const metricTxCountEl = document.getElementById('metric-tx-count');
const metricHighestExpenseEl = document.getElementById('metric-highest-expense');
const metricAvgExpenseEl = document.getElementById('metric-avg-expense');

const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const filterTabsContainer = document.querySelector('.type-filter-tabs');
const categoryFilterSelect = document.getElementById('category-filter');
const sortSelect = document.getElementById('sort-select');
const transactionListContainer = document.getElementById('transaction-list');
const historyTxBadge = document.getElementById('history-tx-badge');

const toastEl = document.getElementById('toast');
const currentDateDisplay = document.getElementById('current-date-display');
const deleteModal = document.getElementById('delete-modal');
const modalTxPreview = document.getElementById('modal-tx-preview');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');

// --- 3. Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // 1. Display current date in header
    renderHeaderDate();

    // 2. Set default date picker to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // 3. Load stored transactions
    loadTransactions();

    // 4. Update category options based on default checked type (Income)
    updateCategoryOptions();

    // 5. Populate Category Filter Dropdown
    populateCategoryFilterDropdown();

    // 6. Add Event Listeners
    setupEventListeners();

    // 7. Initial Calculation & Render
    updateDashboard();
}

function renderHeaderDate() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    currentDateDisplay.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <span>${now.toLocaleDateString('en-US', options)}</span>
    `;
}

// --- 4. LocalStorage Handling ---
function loadTransactions() {
    try {
        const rawData = localStorage.getItem(STORAGE_KEY);
        if (rawData) {
            const parsed = JSON.parse(rawData);
            if (Array.isArray(parsed)) {
                transactions = parsed.filter(item => isValidTransactionObject(item));
            } else {
                transactions = [];
            }
        } else {
            transactions = [];
        }
    } catch (e) {
        console.error("Error reading transactions from localStorage:", e);
        transactions = [];
        showToast("Corrupted data found in storage. Initialized empty state.", "error");
    }
}

function saveTransactions() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
        console.error("Error saving transactions to localStorage:", e);
        showToast("Failed to save transaction to storage.", "error");
    }
}

function isValidTransactionObject(obj) {
    return obj && 
        typeof obj.id === 'string' &&
        (obj.type === 'income' || obj.type === 'expense') &&
        typeof obj.description === 'string' &&
        typeof obj.amount === 'number' && !isNaN(obj.amount) &&
        typeof obj.category === 'string' &&
        typeof obj.date === 'string';
}

// --- 5. Helper Functions & Utilities ---
function generateUniqueId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDateDisplay(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateString;
}

function showToast(message, type = 'success') {
    toastEl.textContent = message;
    toastEl.className = `toast ${type}`;
    toastEl.classList.remove('hidden');

    setTimeout(() => {
        toastEl.classList.add('hidden');
    }, 3500);
}

// --- 6. Form Logic & Dynamic Category population ---
function updateCategoryOptions() {
    const selectedType = getSelectedType();
    const availableCategories = CATEGORIES[selectedType] || [];

    categorySelect.innerHTML = '<option value="" disabled selected>Select category</option>';

    availableCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

function populateCategoryFilterDropdown() {
    const allCategories = Array.from(new Set([...CATEGORIES.expense, ...CATEGORIES.income]));
    
    // Save current selection if exists
    const currentVal = categoryFilterSelect.value || 'all';

    categoryFilterSelect.innerHTML = '<option value="all">All Categories</option>';

    allCategories.sort().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilterSelect.appendChild(option);
    });

    categoryFilterSelect.value = currentVal;
}

function getSelectedType() {
    return typeIncomeRadio.checked ? 'income' : 'expense';
}

// --- 7. Validation & Form Submission ---
function clearValidationErrors() {
    formErrorAlert.classList.add('hidden');
    formErrorAlert.textContent = '';
    
    document.querySelectorAll('.field-error-text').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('is-invalid'));
}

function validateForm() {
    clearValidationErrors();
    let isValid = true;

    const descriptionVal = descriptionInput.value.trim();
    const amountVal = parseFloat(amountInput.value);
    const categoryVal = categorySelect.value;
    const dateVal = dateInput.value;

    // Validate Description
    if (!descriptionVal) {
        setFieldError(descriptionInput, 'desc-error', 'Description is required');
        isValid = false;
    } else if (descriptionVal.length > 100) {
        setFieldError(descriptionInput, 'desc-error', 'Description cannot exceed 100 characters');
        isValid = false;
    }

    // Validate Amount
    if (amountInput.value.trim() === '') {
        setFieldError(amountInput, 'amount-error', 'Amount is required');
        isValid = false;
    } else if (isNaN(amountVal) || amountVal <= 0) {
        setFieldError(amountInput, 'amount-error', 'Please enter a valid amount greater than 0');
        isValid = false;
    }

    // Validate Category
    if (!categoryVal) {
        setFieldError(categorySelect, 'category-error', 'Please select a category');
        isValid = false;
    }

    // Validate Date
    if (!dateVal) {
        setFieldError(dateInput, 'date-error', 'Please select a valid date');
        isValid = false;
    }

    if (!isValid) {
        formErrorAlert.textContent = 'Please correct the highlighted errors in the form.';
        formErrorAlert.classList.remove('hidden');
    }

    return isValid;
}

function setFieldError(inputEl, errorElId, message) {
    inputEl.classList.add('is-invalid');
    const errorEl = document.getElementById(errorElId);
    if (errorEl) {
        errorEl.textContent = message;
    }
}

function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const type = getSelectedType();
    const description = descriptionInput.value.trim();
    const amount = Math.round(parseFloat(amountInput.value) * 100) / 100; // 2 decimal precision
    const category = categorySelect.value;
    const date = dateInput.value;

    const newTransaction = {
        id: generateUniqueId(),
        type,
        description,
        amount,
        category,
        date
    };

    transactions.unshift(newTransaction);
    saveTransactions();
    updateDashboard();

    // Reset Form fields
    descriptionInput.value = '';
    amountInput.value = '';
    categorySelect.value = '';
    clearValidationErrors();

    showToast(`Added ${type === 'income' ? 'income' : 'expense'}: ${description}`, 'success');
}

// --- 8. Dynamic Calculations & Dashboard Updates ---
function updateDashboard() {
    calculateSummaryAndMetrics();
    renderTransactionsList();
}

function calculateSummaryAndMetrics() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const remainingBalance = totalIncome - totalExpense;

    // Render Main Summary Cards
    totalIncomeEl.textContent = formatCurrency(totalIncome);
    totalExpenseEl.textContent = formatCurrency(totalExpense);
    remainingBalanceEl.textContent = formatCurrency(remainingBalance);

    // Dynamic color class for balance card
    balanceCardEl.classList.remove('positive', 'negative');
    if (remainingBalance < 0) {
        balanceCardEl.classList.add('negative');
    } else if (remainingBalance > 0) {
        balanceCardEl.classList.add('positive');
    }

    // Render Additional Metrics
    const expenseTxList = transactions.filter(t => t.type === 'expense');
    const txCount = transactions.length;
    const highestExpense = expenseTxList.length > 0 
        ? Math.max(...expenseTxList.map(t => t.amount))
        : 0;
    const avgExpense = expenseTxList.length > 0 
        ? totalExpense / expenseTxList.length 
        : 0;

    metricTxCountEl.textContent = txCount.toString();
    metricHighestExpenseEl.textContent = formatCurrency(highestExpense);
    metricAvgExpenseEl.textContent = formatCurrency(avgExpense);
}

// --- 9. Filtering, Searching, Sorting & Rendering Transaction List ---
function getFilteredAndSortedTransactions() {
    return transactions.filter(tx => {
        // Type Filter
        if (currentFilterType !== 'all' && tx.type !== currentFilterType) {
            return false;
        }

        // Category Filter
        if (currentFilterCategory !== 'all' && tx.category !== currentFilterCategory) {
            return false;
        }

        // Search Query Filter
        if (currentSearchQuery) {
            const query = currentSearchQuery.toLowerCase();
            const matchDesc = tx.description.toLowerCase().includes(query);
            const matchCat = tx.category.toLowerCase().includes(query);
            if (!matchDesc && !matchCat) {
                return false;
            }
        }

        return true;
    }).sort((a, b) => {
        if (currentSortOption === 'newest') {
            return new Date(b.date) - new Date(a.date);
        } else if (currentSortOption === 'oldest') {
            return new Date(a.date) - new Date(b.date);
        } else if (currentSortOption === 'highest') {
            return b.amount - a.amount;
        } else if (currentSortOption === 'lowest') {
            return a.amount - b.amount;
        }
        return 0;
    });
}

function renderTransactionsList() {
    const filteredList = getFilteredAndSortedTransactions();
    
    // Update badge count
    historyTxBadge.textContent = `${filteredList.length} ${filteredList.length === 1 ? 'item' : 'items'}`;

    // Clear list container safely
    transactionListContainer.innerHTML = '';

    if (filteredList.length === 0) {
        renderEmptyState();
        return;
    }

    filteredList.forEach(tx => {
        const itemEl = createTransactionDOMElement(tx);
        transactionListContainer.appendChild(itemEl);
    });
}

function renderEmptyState() {
    const isFiltered = currentFilterType !== 'all' || currentFilterCategory !== 'all' || currentSearchQuery !== '';

    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';

    const iconDiv = document.createElement('div');
    iconDiv.className = 'empty-icon';
    iconDiv.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    const titleEl = document.createElement('h3');
    titleEl.className = 'empty-title';
    titleEl.textContent = isFiltered ? 'No matching transactions' : 'No transactions yet';

    const descEl = document.createElement('p');
    descEl.className = 'empty-desc';
    descEl.textContent = isFiltered 
        ? 'Try resetting your search query or filters to see more results.'
        : 'Start tracking your finances by recording your first income or expense above.';

    emptyDiv.appendChild(iconDiv);
    emptyDiv.appendChild(titleEl);
    emptyDiv.appendChild(descEl);

    transactionListContainer.appendChild(emptyDiv);
}

function createTransactionDOMElement(tx) {
    const itemDiv = document.createElement('div');
    itemDiv.className = `tx-item ${tx.type}`;
    itemDiv.setAttribute('data-id', tx.id);

    // Left Container
    const leftDiv = document.createElement('div');
    leftDiv.className = 'tx-left';

    const badgeIcon = document.createElement('div');
    badgeIcon.className = 'tx-badge-icon';
    badgeIcon.innerHTML = tx.type === 'income'
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'tx-details';

    const descSpan = document.createElement('span');
    descSpan.className = 'tx-desc';
    descSpan.textContent = tx.description; // Safe textContent insertion

    const metaDiv = document.createElement('div');
    metaDiv.className = 'tx-meta';

    const categoryTag = document.createElement('span');
    categoryTag.className = 'tx-category-tag';
    categoryTag.textContent = tx.category; // Safe textContent insertion

    const dotSpan = document.createElement('span');
    dotSpan.textContent = '•';

    const dateSpan = document.createElement('span');
    dateSpan.textContent = formatDateDisplay(tx.date);

    metaDiv.appendChild(categoryTag);
    metaDiv.appendChild(dotSpan);
    metaDiv.appendChild(dateSpan);

    detailsDiv.appendChild(descSpan);
    detailsDiv.appendChild(metaDiv);

    leftDiv.appendChild(badgeIcon);
    leftDiv.appendChild(detailsDiv);

    // Right Container
    const rightDiv = document.createElement('div');
    rightDiv.className = 'tx-right';

    const amountSpan = document.createElement('span');
    amountSpan.className = 'tx-amount';
    amountSpan.textContent = `${tx.type === 'income' ? '+' : '-'} ${formatCurrency(tx.amount)}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.setAttribute('aria-label', `Delete transaction ${tx.description}`);
    deleteBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

    deleteBtn.addEventListener('click', () => {
        openDeleteModal(tx);
    });

    rightDiv.appendChild(amountSpan);
    rightDiv.appendChild(deleteBtn);

    itemDiv.appendChild(leftDiv);
    itemDiv.appendChild(rightDiv);

    return itemDiv;
}

// --- 10. Deletion & Modal Logic ---
function openDeleteModal(tx) {
    pendingDeleteId = tx.id;
    modalTxPreview.innerHTML = `
        <strong>${escapeHTML(tx.description)}</strong> (${tx.category})<br>
        <span style="color: ${tx.type === 'income' ? 'var(--income-600)' : 'var(--expense-600)'}">
            ${tx.type === 'income' ? '+' : '-'} ${formatCurrency(tx.amount)}
        </span> • ${formatDateDisplay(tx.date)}
    `;
    deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
    pendingDeleteId = null;
    deleteModal.classList.add('hidden');
}

function confirmDeleteTransaction() {
    if (!pendingDeleteId) return;

    const targetTx = transactions.find(t => t.id === pendingDeleteId);
    const targetDesc = targetTx ? targetTx.description : 'Transaction';

    transactions = transactions.filter(t => t.id !== pendingDeleteId);
    saveTransactions();
    updateDashboard();

    closeDeleteModal();
    showToast(`Deleted: "${targetDesc}"`, 'error');
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// --- 11. Event Listeners Wiring ---
function setupEventListeners() {
    // Form Submit
    formElement.addEventListener('submit', handleFormSubmit);

    // Form Radio Switch (Income / Expense)
    typeIncomeRadio.addEventListener('change', updateCategoryOptions);
    typeExpenseRadio.addEventListener('change', updateCategoryOptions);

    // Search Input
    searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.trim();
        if (currentSearchQuery.length > 0) {
            clearSearchBtn.classList.remove('hidden');
        } else {
            clearSearchBtn.classList.add('hidden');
        }
        renderTransactionsList();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentSearchQuery = '';
        clearSearchBtn.classList.add('hidden');
        renderTransactionsList();
    });

    // Type Filter Tabs
    filterTabsContainer.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.filter-tab');
        if (!tabBtn) return;

        document.querySelectorAll('.filter-tab').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });

        tabBtn.classList.add('active');
        tabBtn.setAttribute('aria-selected', 'true');

        currentFilterType = tabBtn.getAttribute('data-filter');
        renderTransactionsList();
    });

    // Category Filter Dropdown
    categoryFilterSelect.addEventListener('change', (e) => {
        currentFilterCategory = e.target.value;
        renderTransactionsList();
    });

    // Sort Dropdown
    sortSelect.addEventListener('change', (e) => {
        currentSortOption = e.target.value;
        renderTransactionsList();
    });

    // Modal Action Listeners
    modalCancelBtn.addEventListener('click', closeDeleteModal);
    modalConfirmBtn.addEventListener('click', confirmDeleteTransaction);
    
    // Close modal on backdrop click
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });

    // Keyboard ESC to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !deleteModal.classList.contains('hidden')) {
            closeDeleteModal();
        }
    });
}
