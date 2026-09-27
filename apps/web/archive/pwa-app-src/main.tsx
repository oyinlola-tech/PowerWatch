import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.tsx";
import "./Services/mixpanel.ts";

registerSW({
  immediate: true,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);