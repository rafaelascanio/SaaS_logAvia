# Pilot Logbook SaaS — Prototype

This repo contains:
- `components/PilotLogbookDashboard.jsx`: a React dashboard sketch (uses Tailwind, lucide-react, and recharts).
- `data/`: sample CSV/XLSX generated for ingestion testing.

> Note: The component references shadcn/ui and Tailwind utility classes. It is meant as a **UI sketch**, not a standalone app. 
> To run it inside your app, copy the component into your React/Next.js project and ensure the dependencies are installed.

## Quick Start (add to an existing Next.js/React project)
1. Install deps in your project:
   ```bash
   npm i recharts lucide-react
   ```
   (If you use shadcn/ui, keep the imports. Otherwise replace the wrapper Cards with `div` containers.)
2. Copy `components/PilotLogbookDashboard.jsx` into your project.
3. Import and render it anywhere:
   ```jsx
   import PilotLogbookDashboard from "./components/PilotLogbookDashboard";
   export default function Page() { return <PilotLogbookDashboard />; }
   ```

## Data
You can find synthetic data ready for ingestion in `data/`:
- `pilot_logbook_populated_120.csv`
- `pilot_logbook_populated_120.xlsx`

## License
MIT
