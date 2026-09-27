import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// SplashScreen.tsx
const SplashScreen = () => {
    const navigate = useNavigate();

    useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [navigate]);


  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0663EA]">
      <div className="flex flex-col items-center">
        <img
          src="/Logo.svg"
          alt="PowerWatch Logo"
          className="w-48 md:w-56"  // Increased from w-28 to w-48
        />

        <p className="mt-2 text-sm font-normal text-white/90">
          Monitoring your energy in real-time
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;