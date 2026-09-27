import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
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

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
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
