# FinTrack Pro Web 🚀

**FinTrack Pro Web** is a robust Financial Management SPA (Single Page Application) built with **Angular 21** and **PrimeNG**. This project serves as the front-end interface for the FinTrack personal finance ecosystem, featuring a clean architecture, reactive forms, and modern state management.

## 🛠 Tech Stack

* **Framework:** Angular 21 (Standalone Components)
* **Language:** TypeScript
* **UI Library:** PrimeNG v18+
* **Styling:** SCSS & PrimeFlex
* **State Management:** Angular Signals
* **Testing:** Jest

## 🏗 Architecture

The project follows a **Feature-Driven (Screaming) Architecture** to ensure separation of concerns and maintainability:
* **Features (`src/app/features/`):** Domain-specific modules (e.g., `transactions`, `categories`) containing their respective pages, components, and logic.
* **Services (`src/app/services/`):** Centralized HTTP communication logic interacting with the REST API.
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

### Categories Management
* **List:** Responsive data table displaying all categories with dynamic color indicators.
* **Create:** Modal interface with reactive forms for creating new financial categories.

### Transactions Management
* **List:** Real-time data table of transactions with ISO-compliant date formatting and localized USD currency pipes.
* **Create:** Dual-service orchestration loading categories dynamically. Uses advanced PrimeNG components (`p-datepicker`, `p-inputNumber`, `p-select`) for strict data normalization and Enum mapping (`INCOME` / `EXPENSE`).

## 🚧 Roadmap & Issues

- [x] **Issue #1:** Project Bootstrap & Standalone Architecture Setup.
- [x] **Issue #2:** PrimeNG Integration & Theming Configuration.
- [x] **Issue #3:** Category Management Implementation (UI & Services).
- [x] **Issue #4:** Transaction Management, Enum Mapping & Service Layer.
- [x] **Issue #5:** Unit Testing Setup with Jest & Component Mocks.
- [ ] **Issue #6:** Dashboard & Financial Analytics Visualization.

## 📄 License

This project is licensed under the MIT License.