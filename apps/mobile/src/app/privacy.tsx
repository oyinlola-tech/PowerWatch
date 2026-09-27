import LegalDocumentView from "../components/legal/LegalDocumentView";
import { privacyPolicy } from "../content/legal";

// Privacy Policy (public; also published on the website at /privacy)
const Privacy = () => (
  <LegalDocumentView document={privacyPolicy} related={{ label: "Terms & Conditions", href: "/terms" }} />
);

export default Privacy;
