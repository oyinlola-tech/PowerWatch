import { useEffect } from "react";
import AndroidAppBanner from "./components/AndroidAppBanner";
import SiteHeader from "./components/SiteHeader";
import Hero from "./components/Hero";
import About from "./components/About";
import HowItWorks from "./components/HowItWorks";
import Screens from "./components/Screens";
import Faq from "./components/Faq";
import DownloadCta from "./components/DownloadCta";
import Footer from "./components/Footer";
import { track } from "./services/mixpanel";

function App() {
  useEffect(() => {
    track("landing_viewed");
  }, []);

  // The browser tries to scroll to the URL fragment (e.g. the owner's
  // "https://powerwatch.oyinlola.site/#download" app-update link) once, when
  // the document first loads -- before this client-rendered page has mounted
  // the target section. Retry it once mounted so a direct link to `#download`
  // (or any other section) still lands correctly.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    document.getElementById(hash)?.scrollIntoView({ behavior: "instant", block: "start" });
  }, []);

  return (
    <>
      <AndroidAppBanner />
      <SiteHeader variant="home" />
      <main>
        <Hero />
        <About />
        <HowItWorks />
        <Screens />
        <Faq />
        <DownloadCta />
      </main>
      <Footer />
    </>
  );
}

export default App;
