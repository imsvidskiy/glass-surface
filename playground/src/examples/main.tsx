import "@svidskiy/glass-surface-react/style.css";
import "../playground.css";
import "./examples.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Examples } from "./examples";

const root = document.querySelector("#root");

if (!root) {
  throw new Error("Root element is missing");
}

createRoot(root).render(
  <StrictMode>
    <Examples />
  </StrictMode>
);
