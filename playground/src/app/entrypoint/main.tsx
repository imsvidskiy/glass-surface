import "@imsvidskiy/glass-surface-react/style.css";
import "../styles/global.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PlaygroundPage } from "@/pages/playground";

const root = document.querySelector("#root");

if (root === null) {
  throw new Error("Root element is missing");
}

createRoot(root).render(
  <StrictMode>
    <PlaygroundPage />
  </StrictMode>
);
