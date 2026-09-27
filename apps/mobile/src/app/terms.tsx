import LegalDocumentView from "../components/legal/LegalDocumentView";
import { termsAndConditions } from "../content/legal";

// Terms & Conditions (public; also published on the website at /terms)
const Terms = () => (
  <LegalDocumentView document={termsAndConditions} related={{ label: "Privacy Policy", href: "/privacy" }} />
);

export default Terms;
