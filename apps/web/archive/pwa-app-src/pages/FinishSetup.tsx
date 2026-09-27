import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Zap, Megaphone, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ToggleRowProps {
  icon: LucideIcon;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}

const ToggleRow = ({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
}: ToggleRowProps) => (
  <div className="flex items-start justify-between rounded-2xl border border-gray-200 px-4 py-3 transition hover:border-gray-300">
    <div className="flex gap-3 pr-4">
      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0663EA]/10">
        <Icon size={18} className="text-[#0663EA]" />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
      </div>
    </div>

    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative mt-1 h-7 w-14 flex-shrink-0 rounded-full transition-colors duration-300 ${
        enabled ? "bg-[#0663EA]" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300 ${
          enabled ? "left-7" : "left-0.5"
        }`}
      />
    </button>
  </div>
);

const NotificationSetup = () => {
  const navigate = useNavigate();

  const [permissionStatus, setPermissionStatus] = useState<
    NotificationPermission | "unsupported"
  >(
    typeof Notification !== "undefined"
      ? Notification.permission
      : "unsupported",
  );

  const [prefs, setPrefs] = useState({
    outageAlerts: true,
    restorationAlerts: true,
    communityReports: false,
  });

  const updatePref = (key: keyof typeof prefs) => (value: boolean) =>
    setPrefs((prev) => ({ ...prev, [key]: value }));

  const handleFinishSetup = async () => {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      const result = await Notification.requestPermission();
      setPermissionStatus(result);
    }

    navigate("/dashboard");
  };

  return (
    <main className="flex min-h-screen flex-col bg-white px-6 py-8">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2 border-b border-gray-200 pb-3">
          <img
            src="/icon.svg"
            alt="PowerWatch"
            className="h-7 w-7 rounded-md"
          />

          <h1 className="text-xl font-semibold text-slate-700">
            <span className="font-bold">Power</span>Watch
          </h1>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-slate-900">Stay updated</h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Get notified immediately when there is a change in your neighborhood's
          power status.
        </p>

        {/* Notification Preview */}
        <div className="mt-6 flex h-44 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0663EA]/10">
            <Bell size={28} className="text-[#0663EA]" />
          </div>

          <div className="text-center">
            <span className="text-sm font-medium text-gray-600">
              Notification Preview
            </span>

            <p className="mt-1 text-xs text-gray-400">
              You'll see alerts like this when power changes.
            </p>
          </div>
        </div>

        {/* Notification Options */}
        <div className="mt-8 space-y-3">
          <ToggleRow
            icon={Zap}
            title="Outage Alerts"
            description="Be the first to know when power goes out."
            enabled={prefs.outageAlerts}
            onChange={updatePref("outageAlerts")}
          />

          <ToggleRow
            icon={Megaphone}
            title="Restoration Alerts"
            description="Get notified as soon as power is back on."
            enabled={prefs.restorationAlerts}
            onChange={updatePref("restorationAlerts")}
          />

          <ToggleRow
            icon={Users}
            title="Community Reports"
            description="See real-time updates from your neighbors."
            enabled={prefs.communityReports}
            onChange={updatePref("communityReports")}
          />
        </div>

        {/* Permission Messages */}
        {permissionStatus === "denied" && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs text-red-600">
              ⚠️ Notifications are blocked in your browser settings. You can
              still use PowerWatch, but you won't receive push alerts.
            </p>
          </div>
        )}

        {permissionStatus === "granted" && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-xs text-green-600">
              ✅ Notifications enabled! You'll receive real-time alerts.
            </p>
          </div>
        )}

        {/* Finish Button */}
        <button
          onClick={handleFinishSetup}
          className="mt-auto h-14 w-full rounded-full bg-[#0663EA] text-lg font-semibold text-white transition hover:bg-blue-700"
        >
          Finish Setup
        </button>
      </div>
    </main>
  );
};

export default NotificationSetup;
