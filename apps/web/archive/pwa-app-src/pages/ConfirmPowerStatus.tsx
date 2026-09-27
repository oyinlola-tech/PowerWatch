import { useNavigate, useParams } from "react-router-dom";
import { Info, Zap, ZapOff } from "lucide-react";
import type { PowerStatus } from "../types/dashboard";
import DashboardHeader from "../components/Dashboard/DashboardHeader";

const copy: Record<
  PowerStatus,
  {
    pageLabel: string;
    prompt: string;
    confirmLabel: string;
    cancelLabel: string;
    confirmColor: string;
    confirmHoverColor: string;
    iconBg: string;
    iconColor: string;
    icon: typeof Zap;
  }
> = {
  off: {
    pageLabel: "Reporting power off",
    prompt: "Are you currently experiencing a power outage at your location in",
    confirmLabel: "Yes, Power is OFF",
    cancelLabel: "No, Cancel Report",
    confirmColor: "bg-red-500",
    confirmHoverColor: "hover:bg-red-600",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    icon: ZapOff,
  },
  on: {
    pageLabel: "Reporting power on",
    prompt: "Please confirm if electricity has been restored at your location in",
    confirmLabel: "Yes, Power is ON",
    cancelLabel: "No, Still Out",
    confirmColor: "bg-green-500",
    confirmHoverColor: "hover:bg-green-600",
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    icon: Zap,
  },
};

interface ConfirmPowerStatusProps {
  neighborhood?: string;
}

const ConfirmPowerStatus = ({ neighborhood = "Adewole Estate" }: ConfirmPowerStatusProps) => {
  const navigate = useNavigate();
  const { status } = useParams<{ status: PowerStatus }>();

  const reportType: PowerStatus = status === "on" ? "on" : "off";
  const config = copy[reportType];
  const Icon = config.icon;

  const handleConfirm = () => {
  // TODO: submit report to backend with reportType + neighborhood
  navigate(`/report-submitted/${reportType}`, {
    state: {
      report: {
        status: reportType,
        streetAddress: "15 Olamide St", // pull from actual user address once you have it
        area: `${neighborhood}, Ilorin`,
      },
    },
  });
};

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 px-4 py-4">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* Header */}
        <div className="mb-4">
          <DashboardHeader
            neighborhood="Adewole Estate"
            onChangeNeighborhood={() => navigate("/set-location")}
          />
        </div>


        {/* Card */}
        <div className="mt-6 flex-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* Status Badge */}
          <div className="flex justify-center">
            <span
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                reportType === "on" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}
            >
              {reportType === "on" ? "Reporting Power ON" : "Reporting Power OFF"}
            </span>
          </div>

          {/* Icon */}
          <div className="mt-6 flex justify-center">
            <div className={`flex h-20 w-20 items-center justify-center rounded-full ${config.iconBg} transition-all duration-300 hover:scale-105`}>
              <Icon size={32} className={config.iconColor} />
            </div>
          </div>

          {/* Text */}
          <h2 className="mt-5 text-center text-2xl font-bold text-slate-900">
            Confirm Power Status
          </h2>

          <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-6 text-gray-500">
            {config.prompt}{" "}
            <span className="font-semibold text-slate-700">{neighborhood}</span>?
          </p>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleConfirm}
              className={`h-14 w-full rounded-full text-base font-semibold text-white transition-all duration-300 ${config.confirmColor} ${config.confirmHoverColor} active:scale-95 shadow-sm hover:shadow-md`}
            >
              {config.confirmLabel}
            </button>

            <button
              onClick={() => navigate(-1)}
              className="h-14 w-full rounded-full bg-gray-100 text-base font-semibold text-gray-600 transition-all duration-300 hover:bg-gray-200 active:scale-95"
            >
              {config.cancelLabel}
            </button>
          </div>

          {/* Info note */}
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-gray-50 p-4 border border-gray-100">
            <Info size={16} className="mt-0.5 flex-shrink-0 text-[#0663EA]" />
            <div>
              <p className="text-xs leading-5 text-gray-600">
                Your report helps neighbors stay informed about power status in your area.
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                False reports may affect community standing.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Your report is anonymous and helps the community
          </p>
        </div>
      </div>
    </main>
  );
};

export default ConfirmPowerStatus;