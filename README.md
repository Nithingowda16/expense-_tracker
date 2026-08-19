# SpendWise - Personal Income & Expense Tracker

> **Track your money. Understand your spending.**

SpendWise is a polished, fully responsive personal finance dashboard built strictly using **HTML5**, **CSS3**, and **Vanilla JavaScript**. It allows users to record, categorize, filter, search, sort, and manage their income and expenses seamlessly with client-side browser persistence via `localStorage`.

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Getting Started / How to Run](#getting-started--how-to-run)
- [Data Persistence](#data-persistence)
- [JavaScript Concepts Demonstrated](#javascript-concepts-demonstrated)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Future Improvements](#future-improvements)

---

## Features

- 💰 **Financial Summary Dashboard**: Real-time display of **Total Income**, **Total Expenses**, and **Remaining Balance** (`Balance = Total Income - Total Expenses`).
- 📊 **Insight Metrics**: Tracks **Total Transactions**, **Highest Expense**, and **Average Expense**.
- ➕ **Dynamic Add Transaction**: Record both Income and Expense items with description, amount, category, and date.
- 🏷️ **Context-Aware Categories**:
  - *Expenses*: Food, Transport, Shopping, Bills, Entertainment, Health, Education, Other.
  - *Income*: Salary, Freelance, Business, Investment, Gift, Other.
- 🗑️ **Transaction Management**: Delete transactions with a confirmation dialog; immediately recalculates all financial totals without page reload.
- 🔍 **Live Search**: Instant search by transaction description or category (case-insensitive).
- 🏷️ **Multi-level Filtering**:
  - Filter by Type (*All*, *Income*, *Expenses*).
  - Filter by Category (*All Categories* or specific category).
- 🔀 **Dynamic Sorting**: Sort transactions by *Newest First*, *Oldest First*, *Highest Amount*, or *Lowest Amount*.
- 🛡️ **Robust Validation**: Form prevents empty descriptions, whitespace-only entries, negative or zero amounts, invalid dates, or missing categories.
- 💾 **Persistent Storage**: All transactions are stored locally using browser `localStorage` and persist across page refreshes.
- 📱 **Responsive & Accessible**: Mobile-first grid design optimized for mobile (320px–375px), tablets (768px), laptops (1024px), and desktops (1440px+). Includes keyboard navigation and high-contrast styling.

---

## Technologies Used

- **HTML5**: Semantic elements (`<header>`, `<main>`, `<section>`, `<form>`, `<label>`, `<button>`, `<footer>`).
- **CSS3**: Custom Property tokens, Flexbox & CSS Grid, responsive media queries, glassmorphism card styling, custom radio toggles, CSS transitions.
- **Vanilla JavaScript (ES6+)**: Pure JS DOM manipulation, array methods (`filter`, `reduce`, `map`, `sort`), event listeners, and `localStorage` API. No external frameworks or dependencies.

---

## Project Structure

```text
expense-tracker/
│
├── index.html          # Main HTML structure & dashboard layout
├── css/
│   └── style.css       # Complete CSS design system, cards, forms, animations & responsive queries
├── js/
│   └── script.js       # Application architecture, state management, calculation & DOM handlers
└── README.md           # Documentation, testing scenarios & usage instructions
```

### File Responsibilities
- `index.html`: Defines the application structure, form controls, summary cards, control bar, transaction history container, and confirmation modal.
- `css/style.css`: Establishes the design tokens, card hierarchy, typography, form styles, toast notifications, empty state graphics, and responsive breakpoints.
- `js/script.js`: Holds state array `transactions`, handles local storage save/load, executes form validation, updates financial metrics dynamically, processes filters/sorts, and securely renders DOM elements.

---

## Getting Started / How to Run

1. Clone or download the repository to your local computer.
2. Open the project root directory.
3. Open `index.html` directly in any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Apple Safari).
   - Alternatively, serve it using a local HTTP server such as VS Code Live Server or `npx serve`.

---

## Data Persistence

Transactions are automatically saved to your web browser's `localStorage` under the key:

```javascript
'spendWiseTransactions'
```

When you add or delete a transaction:
1. The transaction object is updated in the internal `transactions` array.
2. The updated array is serialized to JSON string format using `JSON.stringify()`.
3. The string is saved via `localStorage.setItem('spendWiseTransactions', ...)`
4. Upon page reloads, `localStorage.getItem()` retrieves the stored string, which is parsed with `JSON.parse()` to restore your state.

---

## JavaScript Concepts Demonstrated

- **DOM Manipulation**: Creating elements safely (`document.createElement`), setting text (`textContent`), updating class names, managing focus states.
- **Arrays & Objects**: Managing transaction objects with unique IDs, dates, descriptions, categories, and numeric amounts inside a state array.
- **Higher-Order Array Methods**:
  - `filter()`: Extracting income or expense transactions, matching search queries, and filtering categories.
  - `reduce()`: Summing total income and total expense values dynamically.
  - `sort()`: Reordering lists by date or numerical amount.
- **Form Handling & Validation**: Preventing default form submission (`e.preventDefault()`), validating input types, parsing float numbers, clearing error states.
- **Event Delegation & Listeners**: Registering input events, click events, keyboard events (ESC key to close modals), change events.
- **JSON & Storage**: Serialization and deserialization with `JSON.stringify()` and `JSON.parse()`, including error handling for corrupted data.

---

## Testing & Quality Assurance

The application was tested against the following test matrix:

| Component | Test Case | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **Form** | Submit empty form | Display inline error messages; prevent submission | Passed |
| **Form** | Enter `0` or negative amount | Display invalid amount error | Passed |
| **Form** | Whitespace-only description | Rejected as invalid | Passed |
| **Form** | Toggle Income / Expense | Category options update dynamically | Passed |
| **Summary** | Add ₹50,000 Income & ₹15,000 Expense | Income: ₹50,000.00, Expenses: ₹15,000.00, Balance: ₹35,000.00 | Passed |
| **Delete** | Click Delete on item | Modal opens, confirm deletion updates summary immediately | Passed |
| **Persistence** | Refresh browser after adding data | Data remains intact and summary recalculates automatically | Passed |
| **Search** | Type query in search bar | Transaction list updates live; case-insensitive | Passed |
| **Sort** | Select Highest Amount / Newest First | List re-orders instantly | Passed |
| **Responsive** | View on 375px & 768px screens | Single column layout, clean touch targets, no horizontal scroll | Passed |

---

## Future Improvements

Potential enhancements for future iterations:
- 📈 **Visual Expense Charts**: Interactive pie charts using standard Canvas API for visual category distribution.
- 📅 **Monthly / Range Filters**: Filter history by month, week, or custom date ranges.
- 🎯 **Budget Limits**: Set monthly spending limits per category with warning thresholds.
- 📤 **CSV Export / Import**: Export financial records to a downloadable CSV file or import backup data.
- 🌙 **Dark Mode Toggle**: Built-in theme switcher for dark/light mode preference.
