import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Users,
  Building2,
  MapPin,
  Pencil,
  Moon,
  Wifi,
  Languages,
  UserRound,
  HelpCircle,
  Info,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import SectionLabel from "../components/shared/SectionLabel";
import SettingsRow from "../components/shared/SettingsRow";
import Toggle from "../components/shared/Toggle";
import ProfileHeaderCard from "../components/Profile/ProfileHeaderCard";
import SignOutButton from "../components/Profile/SignOutButton";
import BottomNav from "../components/layout/BottomNav";
import type { UserProfile, AppPreferences } from "../types/profile";

// Replace with data fetched from your backend / auth provider
const mockProfile: UserProfile = {
  name: "Monday Ephraim",
  primaryNeighborhood: "Adewole Estate",
};

const Profile = () => {
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState<AppPreferences>({
    powerStatusAlerts: true,
    communityUpdates: false,
    darkMode: false,
    dataSaverMode: true,
    language: "English (US)",
  });

  const updatePref = <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) =>
    setPrefs((prev) => ({ ...prev, [key]: value }));

  const handleSignOut = () => {
    // TODO: clear auth session
    navigate("/login");
  };

  return (
    <main className="min-h-screen bg-white px-6 py-6 pb-24">
      <div className="mx-auto max-w-md">
        <PageHeader onBack={() => navigate(-1)} />

        <div className="mt-5">
          <ProfileHeaderCard profile={mockProfile} />
        </div>

        {/* Notification Preferences */}
        <div className="mt-6">
          <SectionLabel>Notification Preferences</SectionLabel>

          <div className="divide-y divide-gray-100">
            <SettingsRow
              icon={Bell}
              title="Power Status Alerts"
              subtitle="Alerts when power returns or goes out"
              right={
                <Toggle
                  enabled={prefs.powerStatusAlerts}
                  onChange={(v) => updatePref("powerStatusAlerts", v)}
                />
              }
            />
            <SettingsRow
              icon={Users}
              title="Community Updates"
              subtitle="Local reports and neighborhood news"
              right={
                <Toggle
                  enabled={prefs.communityUpdates}
                  onChange={(v) => updatePref("communityUpdates", v)}
                />
              }
            />
          </div>
        </div>

        {/* Neighborhood Management */}
        <div className="mt-6">
          <SectionLabel>Neighborhood Management</SectionLabel>

          <div className="divide-y divide-gray-100">
            <SettingsRow
              icon={Building2}
              title="Manage Saved Neighborhoods"
              subtitle="3 locations monitored"
              onClick={() => navigate("/neighborhoods")}
              right={<ChevronRight size={18} className="text-gray-300" />}
            />
            <SettingsRow
              icon={MapPin}
              title="Primary Location"
              subtitle={mockProfile.primaryNeighborhood}
              subtitleColor="font-semibold text-[#0663EA]"
              onClick={() => navigate("/set-location")}
              right={<Pencil size={16} className="text-gray-400" />}
            />
          </div>
        </div>

        {/* App Settings */}
        <div className="mt-6">
          <SectionLabel>App Settings</SectionLabel>

          <div className="divide-y divide-gray-100">
            <SettingsRow
              icon={Moon}
              title="Dark Mode"
              right={
                <Toggle enabled={prefs.darkMode} onChange={(v) => updatePref("darkMode", v)} />
              }
            />
            <SettingsRow
              icon={Wifi}
              title="Data Saver Mode"
              subtitle="Minimize usage on weak networks"
              right={
                <Toggle
                  enabled={prefs.dataSaverMode}
                  onChange={(v) => updatePref("dataSaverMode", v)}
                />
              }
            />
            <SettingsRow
              icon={Languages}
              title="Language"
              subtitle={prefs.language}
              onClick={() => navigate("/language")}
              right={<Languages size={16} className="text-gray-400" />}
            />
          </div>
        </div>

        {/* Account & Support */}
        <div className="mt-6">
          <SectionLabel>Account & Support</SectionLabel>

          <div className="divide-y divide-gray-100">
            <SettingsRow
              icon={UserRound}
              title="Profile Settings"
              onClick={() => navigate("/profile-settings")}
              right={<ChevronRight size={18} className="text-gray-300" />}
            />
            <SettingsRow
              icon={HelpCircle}
              title="Help & FAQ"
              onClick={() => navigate("/help")}
              right={<ExternalLink size={16} className="text-gray-400" />}
            />
            <SettingsRow
              icon={Info}
              title="About PowerWatch"
              onClick={() => navigate("/about")}
              right={<ChevronRight size={18} className="text-gray-300" />}
            />
          </div>
        </div>

        {/* Sign Out */}
        <div className="mt-6">
          <SignOutButton onSignOut={handleSignOut} />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">PowerWatch Version 1.0.1</p>
      </div>

      <BottomNav active="settings" onNavigate={(item) => navigate(`/${item === "dashboard" ? "" : item}`)} />
    </main>
  );
};

export default Profile;