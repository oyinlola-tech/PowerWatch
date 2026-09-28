import { BrowserRouter, Route, Routes } from "react-router";
import { LoadingState } from "./components/DataState";
import Layout from "./components/Layout";
import { ToastProvider } from "./components/Toast";
import { AuthProvider } from "./lib/auth";
import { useAuth } from "./lib/authContext";
import { LocationsProvider } from "./lib/locations";
import Account from "./pages/Account";
import Analytics from "./pages/Analytics";
import Broadcast from "./pages/Broadcast";
import Health from "./pages/Health";
import LiveStatus from "./pages/LiveStatus";
import Locations from "./pages/Locations";
import Login from "./pages/Login";
import NeighborhoodStats from "./pages/NeighborhoodStats";
import NotFound from "./pages/NotFound";
import Outages from "./pages/Outages";
import Overview from "./pages/Overview";
import Reports from "./pages/Reports";
import Summaries from "./pages/Summaries";
import Users from "./pages/Users";

function Gate() {
  const { status } = useAuth();
  if (status === "checking") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingState label="Restoring your session…" />
      </div>
    );
  }
  // Any URL shows the sign-in form while signed out; the URL is kept, so the page opens after sign-in.
  if (status === "signedOut") return <Login />;
  return (
    <LocationsProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="neighborhood-stats" element={<NeighborhoodStats />} />
          <Route path="status" element={<LiveStatus />} />
          <Route path="users" element={<Users />} />
          <Route path="reports" element={<Reports />} />
          <Route path="outages" element={<Outages />} />
          <Route path="locations" element={<Locations />} />
          <Route path="broadcast" element={<Broadcast />} />
          <Route path="summaries" element={<Summaries />} />
          <Route path="health" element={<Health />} />
          <Route path="account" element={<Account />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </LocationsProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Gate />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
