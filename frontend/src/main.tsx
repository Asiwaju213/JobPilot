/**
 * JobPilot frontend — Phase 0 React + Vite entry point.
 *
 * Mounts the React application into the DOM. Sets up routing via React
 * Router and renders the root App component.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
