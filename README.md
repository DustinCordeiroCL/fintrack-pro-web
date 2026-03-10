# FinTrack Pro Web 🚀

**FinTrack Pro Web** is a robust Financial Management SPA (Single Page Application) built with **Angular 21** and **PrimeNG**. This project serves as the front-end interface for the FinTrack personal finance ecosystem, featuring a clean architecture, reactive forms, and modern state management.

## 🛠 Tech Stack

* **Framework:** Angular 21 (Standalone Components)
* **Language:** TypeScript
* **UI Library:** PrimeNG v21+ (Lara theme — blue-teal palette)
* **Styling:** SCSS & PrimeFlex
* **State Management:** Angular Signals
* **Testing:** Jest (Replacing Karma/Jasmine)
* **HTTP Client:** Fetch-based HttpClient with provideHttpClient

## 🏗 Architecture

The project follows a **Feature-Driven (Screaming) Architecture** to ensure separation of concerns and maintainability:
* **Core (`src/app/core/`):** Application shell, sidebar layout, constants, guards, and interceptors.
* **Features (`src/app/features/`):** Domain-specific modules (`transactions`, `categories`, `dashboard`) containing pages, components, and specific logic.
* **Services (`src/app/services/`):** Centralized HTTP communication logic interacting with the REST API v1.
* **Models (`src/app/models/`):** TypeScript Interfaces and Enums that strictly mirror the Java Spring Boot Backend DTOs to ensure Data Symmetry.
* **Shared/Core (`src/app/shared/`):** Reusable UI components, interceptors, and application-wide utilities.

## 🚀 Getting Started

To run the application locally:

1. Clone the repository.
2. Ensure you have Node.js and the Angular CLI installed.
3. Install the project dependencies:
```bash
   npm install
```
4. Start the development server:
```bash
   npm start
```

The application will be accessible at `http://localhost:4200`.

*(Note: Ensure the FinTrack Pro API backend is running locally via Docker on `http://localhost:8080` for data synchronization).*

## 📌 Features & Views (Quick Reference)

### App Shell & Navigation
* **Persistent Sidebar:** Dark blue-teal sidebar with logo, navigation links, and active route highlight.
* **Responsive Layout:** CSS Grid-based shell with fixed sidebar and scrollable content area.

### Dashboard
* **Financial Summary:** Three summary cards displaying Total Income, Total Expense, and Balance in CLP.
* **Bar Chart:** Dynamic Income vs Expense chart grouped by month. Shows 2 months of context before the selected start date, and up to 2 months after (capped at current month).
* **Date Range Filter:** Two date pickers with an Apply button to re-fetch data and update both cards and chart. Future dates and invalid ranges are blocked.
* **Default View:** Automatically loads current month data on initialization.

### Categories Management
* **Full CRUD:** Create, edit, and delete categories with confirmation dialog on deletion.
* **Interactive Table:** Responsive data table with skeleton loading, dynamic color indicators, and improved empty state.
* **Rich Form Fields:** Category type selection (Essential/Discretionary), CLP spending limit, and inline validation feedback.

### Transactions Management
* **Full CRUD:** Create, edit, and delete transactions with confirmation dialog on deletion.
* **Orchestrated UI:** Data table with skeleton loading, Actions column, and improved empty state.
* **Dynamic Forms:** Transaction creation and editing with inline validation, CLP formatting, and strict Enum mapping (INCOME/EXPENSE).

## 🚧 Roadmap & Issues

- [x] **Issue #1:** Frontend Bootstrap (Angular setup, SCSS, PrimeNG & Jest integration).
- [x] **Issue #2:** API Integration Infrastructure (Environments, HttpClient & CategoryService).
- [x] **Issue #3:** Category Management UI (CRUD views, Reactive Forms & Toast feedback).
- [x] **Issue #4:** Transaction UI and API Integration (Service mapping & Category orchestration).
- [x] **Issue #5:** App Shell & Sidebar Navigation (Shell layout, dark sidebar & active route highlight).
- [x] **Issue #6:** Model Synchronization & CLP Currency (Interface sync, CategoryType enum & CLP formatting).
- [x] **Issue #7:** Category CRUD Completion (Edit & Delete with ConfirmDialog).
- [x] **Issue #8:** Transaction CRUD Completion (Edit & Delete with ConfirmDialog).
- [x] **Issue #9:** Dashboard View (Financial summary cards with CLP formatting and date range filter).
- [x] **Issue #10:** UI Polish & UX Refinements (Skeleton loading, inline validation, and improved empty states).
- [x] **Issue #11:** Dashboard Bar Chart (Dynamic Income vs Expense chart with month context window, palette-aligned colors, and date validation).
- [ ] **Issue #12:** Transaction List Filters (Date, Category, Type).
- [ ] **Issue #13:** Transaction Default Sort by Date.
- [ ] **Issue #14:** Category Default Sort by Name.

## 📄 License

This project is licensed under the MIT License.