# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Pothole_detection

## Navigation
- Adds a `NavBar` with links to `Dashboard`, `Graph`, and `History`.
- Routing is handled by `react-router-dom`.

### Files
- `src/components/NavBar.jsx`: Top navigation bar.
- `src/pages/Dashboard.jsx`: Dashboard page.
- `src/pages/Graph.jsx`: Graph page.
- `src/pages/History.jsx`: History page.
- `src/App.jsx`: Wires routes and renders pages.
- `src/main.jsx`: Wraps app in `BrowserRouter`.

### Setup
Install dependencies and run the dev server:

```powershell
npm install
npm run dev
```

Open the app at the URL shown in the terminal. Click the nav links to switch pages; the active page highlights in the nav.
