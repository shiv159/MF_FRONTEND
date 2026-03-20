# 📈 PlanMyFunds

[![Live Demo](https://img.shields.io/badge/Live_Demo-PlanMyFunds-blue?style=for-the-badge)](https://reviewmymf.netlify.app/)
[![Angular](https://img.shields.io/badge/Angular-20-dd0031?style=for-the-badge&logo=angular)](https://angular.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**PlanMyFunds** is a comprehensive, data-driven mutual fund planning and portfolio diagnostics application. It takes the guesswork out of investing by allowing users to analyze risk, detect portfolio overlap, evaluate growth potential, and get real-time guidance from an integrated AI chat assistant.

---

## 🎯 Key Features

* **🛡️ User Authentication:** Secure email/password login and Google OAuth integration.
* **🧭 Guided Risk Profiling:** A 5-step onboarding wizard to determine the user's risk appetite and investment style.
* **📊 Portfolio Diagnostics:** Manual portfolio analysis workflow with interactive analytics dashboards and charts.
* **🤖 AI Chat Assistant:** A contextual, in-app floating assistant that uses Markdown to provide instant, actionable portfolio guidance.
* **🌓 Adaptive UI:** Fully responsive design for desktop and mobile, complete with persistent Dark/Light theme toggling.

---

## 📸 Demo

> **Note to self:** Replace the image path below with the actual path to your GIF or screenshot once uploaded!

![PlanMyFunds Demo](./public/demo-walkthrough.gif)

---

## 💻 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Angular 20 (Standalone Components, Signals, Control Flow) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS + Custom Design System |
| **Data Visualization** | ng2-charts + Chart.js |
| **Markdown Rendering** | ngx-markdown |
| **Backend API** | [MF_Backend Repository](https://github.com/shiv159/MF_Backend) (Java, Spring AI) |

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* **Node.js:** version 20+ (Angular 20 compatible)
* **npm:** version 10+

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/shiv159/MF_FRONTEND.git](https://github.com/shiv159/MF_FRONTEND.git)
    cd MF_FRONTEND
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm start
    ```
    The app will be available at `http://localhost:4200`.

---

## ⚙️ Environment Configuration

The frontend expects a running instance of the backend API. You can configure the API base URLs in the environment files:

* **Development:** `src/environments/environment.ts` (Defaults to `http://localhost:8080`)
* **Production:** `src/environments/environment.prod.ts` (Points to Cloud Run deployment)

---

## 📂 Project Structure

A quick overview of the core architectural directories:

```text
src/
 └── app/
      ├── core/                   # Auth guards, HTTP interceptors, core models
      ├── features/
      │    ├── auth/              # Login, Register, OAuth handling
      │    ├── home/              # Guest landing view
      │    ├── landing/           # Authenticated dashboard
      │    ├── risk-profile/      # 5-step onboarding wizard
      │    ├── portfolio/         # Fund selection & diagnostics
      │    └── chat/              # Floating AI assistant logic
      └── shared/                 # Reusable UI components, charts, theme services
