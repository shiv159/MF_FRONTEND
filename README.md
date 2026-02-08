# PlanMyFunds Frontend

Angular frontend for **PlanMyFunds**, a mutual fund planning and portfolio diagnostics application with an integrated AI chat assistant.

It supports:
- user authentication (email/password + Google OAuth)
- guided risk profiling wizard
- manual portfolio analysis workflow
- interactive analytics dashboards and charts
- in-app chat assistant
- dark/light theme
- responsive desktop + mobile UI

## Tech Stack

- Angular 20 (standalone components, signals, modern control flow)
- TypeScript 5
- Tailwind CSS + custom design system (`src/styles.css`)
- ng2-charts + Chart.js
- ngx-markdown
- RxStomp + SockJS (WebSocket/STOMP client support)

## Project Structure

```text
src/
  app/
    core/                    # auth, guards, interceptors, models, ws config
    features/
      auth/                  # login, register, oauth callback
      home/                  # guest landing page
      landing/               # authenticated dashboard page
      risk-profile/          # 5-step onboarding + result insights
      portfolio-diagnostic/  # manual fund selection + diagnostics
      chat/                  # floating chat assistant
    shared/                  # reusable UI, charts, insights, theme service
  environments/              # environment.ts / environment.prod.ts
  styles.css                 # global theme + shared layout utilities
```

## Prerequisites

- Node.js **20+** (Angular 20 compatible)
- npm **10+**

## Setup

```bash
npm install
```

Run development server:

```bash
npm start
```

App URL:

`http://localhost:4200`

## Environment Configuration

The frontend reads API base URL from:

- `src/environments/environment.ts` (dev)
- `src/environments/environment.prod.ts` (prod)

Current defaults:

- development: `http://localhost:8080`
- production: `https://mutual-fund-api-xmpa4gy2rq-uc.a.run.app`

Update `apiUrl` as needed for your backend deployment.

## Available Scripts

- `npm start` - start dev server
- `npm run build` - production build
- `npm run watch` - development build in watch mode
- `npm test` - unit tests (Karma)

## Main Routes

- `/` - guest home page
- `/auth/login` - login
- `/auth/register` - register
- `/auth/callback` - Google OAuth callback (`?token=...`)
- `/landing` - authenticated landing
- `/risk-profile` - risk profiling wizard
- `/manual-selection` - portfolio diagnostic flow

Route protection:

- `authGuard` protects authenticated routes
- `guestGuard` prevents logged-in users from auth/guest pages

## Backend API Expectations

Configured services call:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/auth/me`
- `GET /oauth2/authorization/google`
- `POST /api/onboarding/risk-profile`
- `GET /api/funds?query=...&limit=20`
- `POST /api/portfolio/manual-selection`
- `POST /api/chat/message`
- `GET/CONNECT /ws` (SockJS/STOMP endpoint)

`jwtInterceptor` automatically attaches:

`Authorization: Bearer <token>`

## Auth and Session Storage

`localStorage` keys:

- `auth-token`
- `auth-user`
- `theme-preference`

`sessionStorage` key:

- `chat_conversation_id`

## Chat Assistant Behavior

- Hidden on landing, shown after analysis results are available
- Stores a conversation ID in session storage
- Supports predefined prompt shortcuts
- Renders assistant messages with Markdown

## Build Notes

If you work across Windows and WSL/Linux, avoid reusing `node_modules` between platforms.

Example failure:

`@esbuild/win32-x64` installed but runtime needs `@esbuild/linux-x64`.

Fix:

```bash
rm -rf node_modules package-lock.json
npm install
```

Run install/build on the same platform where you execute commands.

## Quality Checks

Type check:

```bash
./node_modules/.bin/tsc -p tsconfig.app.json --noEmit
```

Angular template/type compile:

```bash
./node_modules/.bin/ngc -p tsconfig.app.json
```

## Notes

- This app uses Angular standalone architecture (no `NgModule` app module).
- Theme is class-based (`dark`) and persisted via `ThemeService`.
- Mobile responsiveness and desktop behavior are both supported in current UI styles.
