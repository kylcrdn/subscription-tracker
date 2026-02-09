/** Application entry point. Mounts the React app into the #root element defined in index.html. */
import "./index.css";
import App from "./App.jsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Apply saved theme class before first paint to prevent flash
const saved = localStorage.getItem("theme");
if (saved === "light") document.documentElement.classList.add("light");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
