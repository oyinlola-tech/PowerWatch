import { useEffect } from "react";
import Navbar from "./components/Navbar";
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

  return (
    <>
      <Navbar />
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
