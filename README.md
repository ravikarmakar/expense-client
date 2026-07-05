# Expense Client Monorepo

[![Turborepo](https://img.shields.io/badge/built%20with-Turborepo-c1121f.svg?style=flat-square&logo=turborepo)](https://turbo.build/)
[![Package Manager](https://img.shields.io/badge/pnpm-11.x-f69220?style=flat-square&logo=pnpm)](https://pnpm.io/)
[![Expo](https://img.shields.io/badge/Expo-54.0-000000?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

A modern, high-performance monorepo housing the frontend clients for the **Expense App**. Built using **Turborepo** and **pnpm Workspaces**, this repository features a cross-platform mobile client (built with **React Native / Expo**) and a web dashboard client (built with **Next.js 15**), utilizing shared packages for consistent state management, UI components, types, and styling.

---

## 📱 Project Architecture & Workspaces

The repository leverages a modular architecture to maximize code sharing between the web and mobile platforms:

```text
├── apps/
│   ├── mobile/            # React Native/Expo mobile application
│   └── web/               # Next.js web application dashboard
└── packages/
    ├── api/               # Shared API client logic (Axios + React Query hooks)
    ├── ui/                # Shared UI system and base components
    ├── types/             # Shared TypeScript declarations and Zod validation schemas
    ├── eslint-config/     # Core shared linting standards
    └── typescript-config/ # Base compiler options for workspaces
```

---

## ✨ Features

### 1. Cross-Platform Mobile Client (`apps/mobile`)

- **Expo SDK 54 & Expo Router:** Advanced file-based routing mechanism with deep linking.
- **Complete Auth Workflow:** User Signup, Login, Password Recovery, and secure **OTP Verification**.
- **Group Split Billing:** Create groups, add friends, split bills dynamically, track who owes who, and view active shared balances.
- **Personal Wallet Tracker:** Manage multiple personal wallets, cash flow analysis, and individual transaction categories.
- **Real-time Activity Log:** Stay updated with instant balance updates, group invitations, and transaction notifications.
- **Secure Storage:** Sensitive user session storage powered by `expo-secure-store`.

### 2. Next.js Web Client (`apps/web`)

- **Next.js 15 & React 19:** Utilizing the latest Server Components and optimized rendering.
- **Dashboard View:** Visual analytics for overall finances, personal wallets, and shared group accounts.
- **Shared Design Tokens:** Reuses styling components and structures exported from the workspace UI layer.

### 3. Shared Library System (`packages/`)

- **`@workspace/api`:** Type-safe API fetching using **Axios** and cached mutations/queries with **TanStack React Query**.
- **`@workspace/ui`:** Core primitives and modular interface elements built with React 19 compatibility.
- **`@workspace/types`:** Single source of truth for runtime validation (Zod schemas) and static types across the system.

---

## 🛠️ Tech Stack

- **Monorepo Tooling:** [Turborepo](https://turbo.build/) + [pnpm](https://pnpm.io/)
- **Mobile Framework:** [Expo Router](https://docs.expo.dev/router/introduction/) + [React Native](https://reactnative.dev/)
- **Web Framework:** [Next.js 15](https://nextjs.org/) + [React 19](https://react.dev/)
- **Data Fetching:** [TanStack React Query (v5)](https://tanstack.com/query/latest) + [Axios](https://axios-http.com/)
- **Data Validation:** [Zod](https://zod.dev/)
- **Code Quality:** [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) + [Husky](https://typicode.github.io/husky/) + [Lint-Staged](https://github.com/lint-staged/lint-staged)

---

## 🚀 Getting Started

### Prerequisites

- Make sure you have **Node.js** (v20+ recommended) installed.
- Install **pnpm** (v11.x is configured in `packageManager`):
  ```bash
  npm install -g pnpm
  ```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/expense-client.git
   cd expense-client
   ```
2. Install all workspace dependencies:
   ```bash
   pnpm install
   ```

### Environment Setup

Configure local environment files in both client directories before running the servers.

- **For Mobile (`apps/mobile/.env`):**
  ```env
  # 10.0.2.2 is local host mapping for Android emulators. For iOS use localhost or your local IP.
  EXPO_PUBLIC_API_URL=http://localhost:4000
  ```
- **For Web (`apps/web/.env`):**
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:4000
  ```

---

## 💻 Running the Applications

Turborepo handles execution across all workspaces simultaneously.

### Start All Projects in Development Mode:

```bash
pnpm dev
```

_This command runs `turbo dev` which starts the Expo bundler for mobile and the Next.js dev server for web in parallel._

### Build All Workspaces:

```bash
pnpm build
```

### Run Formatting and Linting Checks:

```bash
pnpm lint
pnpm format
```

### Run TypeScript Checks:

```bash
pnpm typecheck
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
