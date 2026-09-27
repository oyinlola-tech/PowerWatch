import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react"
import mixpanel from "./Services/mixpanel";

// Lazy load all page components
const SplashScreen = lazy(() => import("./pages/SplashScreen"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const OtpVerification = lazy(() => import("./pages/Verification"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const SetMonitoringArea = lazy(() => import("./pages/MonitoringArea"));
const NotificationSetup = lazy(() => import("./pages/FinishSetup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ConfirmPowerStatus = lazy(() => import("./pages/ConfirmPowerStatus"));
const History = lazy(() => import("./pages/WeeklyHistory"));
const ReportSubmitted = lazy(() => import("./pages/ReportSubmitted"));
const Profile = lazy (() => import("./pages/Profile"));

// Optional: Loading component
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0663EA] border-t-transparent"></div>
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  </div>
);

function App() {

   useEffect(() => {
    mixpanel.track("app_opened");
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<OtpVerification />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/location" element={<SetMonitoringArea />} />
        <Route path="/notifications" element={<NotificationSetup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/confirm/:status" element={<ConfirmPowerStatus />} />
        <Route path="/report-submitted/:status" element={<ReportSubmitted />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Profile />} />
      </Routes>
    </Suspense>
  );
}

export default App;