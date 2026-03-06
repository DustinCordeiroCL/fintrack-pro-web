# FinTrack Pro Web 🚀

**FinTrack Pro Web** is a robust Financial Management SPA (Single Page Application) built with **Angular 21** and **PrimeNG**. This project serves as the front-end interface for the FinTrack personal finance ecosystem, featuring a clean architecture, reactive forms, and modern state management.

## 🛠 Tech Stack

* **Framework:** Angular 21 (Standalone Components)
* **Language:** TypeScript
* **UI Library:** PrimeNG v18+
* **Styling:** SCSS & PrimeFlex
* **State Management:** Angular Signals
* **Testing:** Jest (Replacing Karma/Jasmine)
* **HTTP Client:** Fetch-based HttpClient with provideHttpClient

## 🏗 Architecture

The project follows a **Feature-Driven (Screaming) Architecture** to ensure separation of concerns and maintainability:
* **Features (`src/app/features/`):** Domain-specific modules (`transactions`, `categories`) containing pages, components, and specific logic.
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

### Categories Management
* **Interactive Table:** Responsive data table using p-table with dynamic indicators.
* **Reactive Creation** Modal-based form (p-dialog) with real-time validation and feedback via p-toast.

### Transactions Management
* **Orchestrated UI:** Complex data table featuring sorting, filtering, and localized currency/date pipes.
* **Dynamic Forms:** Transaction creation with dynamic category loading via CategoryService and strict Enum mapping (INCOME/EXPENSE).
* **Advanced Components:** Integration with p-datepicker, p-inputNumber, and p-select for data normalization.

## 🚧 Roadmap & Issues

- [x] **Issue #1:** Frontend Bootstrap (Angular setup, SCSS, PrimeNG & Jest integration).
- [x] **Issue #2:** API Integration Infrastructure (Environments, HttpClient & CategoryService).
- [x] **Issue #3:** Category Management UI (CRUD views, Reactive Forms & Toast feedback).
- [x] **Issue #4:** Transaction UI and API Integration (Service mapping & Category orchestration).

## 📄 License

This project is licensed under the MIT License.