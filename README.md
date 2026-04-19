# FinTrack Pro Web

**FinTrack Pro** is a personal finance management SPA built with **Angular 21** and **PrimeNG**, targeted at the Chilean market. The interface is fully in Chilean Spanish and integrates with the FinTrack Pro API for transaction tracking, category management, and financial dashboards.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (Standalone Components) |
| Language | TypeScript |
| UI Library | PrimeNG v21+ |
| Styling | SCSS (custom dark theme) |
| State | Angular Signals |
| HTTP | `HttpClient` with functional interceptors |
| Currency / Locale | CLP — `es-CL` |

## Architecture

Feature-driven structure with a shared core layer:

```
src/app/
  core/
    layout/       # Shell, Sidebar, Topbar
    guards/       # Auth guard (CanActivateFn)
    interceptors/ # JWT interceptor (HttpInterceptorFn)
  features/
    auth/         # Login page
    dashboard/    # Summary cards + line chart + category donut
    transactions/ # Full CRUD with filters
    categories/   # Full CRUD with color picker
  models/
    interfaces/   # TypeScript interfaces mirroring API DTOs
    enums/        # TransactionType, CategoryType
  services/       # HTTP services (transaction, category, auth)
```

## Getting Started

Requires Node.js 20+ and Angular CLI.

```bash
npm install
npm start
```

App available at `http://localhost:4200`.
Expects the API running at `http://localhost:8080` (dev profile).

## Features

- JWT authentication with automatic token refresh via interceptor
- Dashboard with income/expense line chart (gradient fill) and expense donut by category
- Transaction list with date range, category and type filters
- Category management with color picker (color reflected in donut chart)
- Dark theme throughout — `#0f172a` background, `#1e293b` cards, teal accent `#0d9488`
- All UI in Chilean Spanish (`dd/mm/yy` date format, CLP currency)

## Environment

| File | Purpose |
|---|---|
| `environment.dev.ts` | Points to `localhost:8080` |
| `environment.ts` | Points to production API URL (updated after deploy) |

## License

MIT
