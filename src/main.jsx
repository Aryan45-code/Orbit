import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { applyTheme, readStoredMode, resolveTheme } from "./utils/theme.js";
import "./index.css";

// Before first paint, so the app never flashes the wrong theme on launch.
applyTheme(resolveTheme(readStoredMode()));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
