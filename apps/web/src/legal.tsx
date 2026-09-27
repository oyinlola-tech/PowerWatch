import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";
import LegalPage from "./components/LegalPage";
import { privacyPolicy, termsAndConditions } from "./content/legal";

// Entry for privacy/index.html and terms/index.html; the page picks its document
const root = document.getElementById("root")!;
const isTerms = root.dataset.document === "terms";

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      {isTerms ? (
        <LegalPage document={termsAndConditions} related={{ label: "Privacy Policy", href: "/privacy/" }} />
      ) : (
        <LegalPage document={privacyPolicy} related={{ label: "Terms & Conditions", href: "/terms/" }} />
      )}
    </ErrorBoundary>
  </StrictMode>,
);
