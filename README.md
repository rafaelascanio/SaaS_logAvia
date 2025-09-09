<h1 align="center">🛩️ Pilot Logbook SaaS Prototype</h1>

<p align="center">
  <img src="https://img.shields.io/badge/react-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React Badge" />
  <img src="https://img.shields.io/badge/tailwindcss-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS Badge" />
  <img src="https://img.shields.io/badge/recharts-Library-FF6384?style=for-the-badge&logo=chart&logoColor=white" alt="Recharts Badge" />
</p>

<p align="center"><span style="color:#4f46e5;">Prototype dashboard for managing pilot flight hours and certifications.</span></p>

## 📚 Table of Contents
- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Data Samples](#-data-samples)
- [Testing](#-testing)
- [License](#-license)

## 📝 About
**Pilot Logbook SaaS** is a small prototype showcasing a flight logbook dashboard built with React. It includes sample data files and a ready-to-use dashboard component that can be dropped into any Next.js/React project.

## ✨ Features
- 📊 Interactive dashboard with [Recharts](https://recharts.org/) charts
- 🎨 Styled using Tailwind CSS and shadcn/ui Card components
- 💼 CSV/XLSX sample datasets for ingestion tests
- ⚙️ Minimal setup, easy to integrate in existing projects

## 🛠 Tech Stack
- ⚛️ React & Next.js
- 🌬 Tailwind CSS
- 📈 Recharts
- ✨ lucide-react icons

## 🚀 Quick Start
1. **Install dependencies**
   ```bash
   npm i recharts lucide-react
   ```
   If you're not using shadcn/ui, replace Card components with simple `<div>`s.

2. **Copy the component**
   ```
   components/PilotLogbookDashboard.jsx
   ```

3. **Use it in your project**
   ```jsx
   import PilotLogbookDashboard from "./components/PilotLogbookDashboard";

   export default function Page() {
     return <PilotLogbookDashboard />;
   }
   ```

## 📂 Data Samples
Synthetic pilot logbook data lives in the `data/` folder:

- `pilot_logbook_populated_120.csv`
- `pilot_logbook_populated_120.xlsx`

## 🧪 Testing
Run the test script from the repository root:

```bash
npm test
```

## 📄 License
MIT

