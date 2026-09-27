import { useNavigate, useParams, useLocation } from "react-router-dom";
import { UserRound, MapPin, Zap, ZapOff } from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import DetailRow from "../components/report/DetailRow";
import NextStepsCard from "../components/report/NextStepsCard";
import type { PowerStatus } from "../types/dashboard";
import type { ReportSubmission } from "../types/report";

const ReportSubmitted = () => {
  const navigate = useNavigate();
  const { status } = useParams<{ status: PowerStatus }>();
  const location = useLocation();

  // Falls back to mock data if someone lands here directly without state
  const report: ReportSubmission = location.state?.report ?? {
    status: status === "on" ? "on" : "off",
    streetAddress: "15 Olamide St",
    area: "Adewole Estate, Ilorin",
  };

  const isOn = report.status === "on";

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 px-4 py-4">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <PageHeader onBack={() => navigate("/dashboard")} />

        {/* Card */}
        <div className="mt-6 flex-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0663EA]">
              <UserRound size={28} className="text-white" />
            </div>
          </div>

          {/* Text */}
          <h2 className="mt-5 text-center text-2xl font-bold text-slate-900">
            Report Submitted
            <br />
            Successfully!
          </h2>

          <p className="mx-auto mt-2 max-w-xs text-center text-sm leading-6 text-gray-500">
            Thank you for helping your community stay informed.
          </p>

          {/* Details */}
          <div className="mt-6 divide-y divide-gray-100 rounded-xl bg-gray-50 px-4">
            <DetailRow
              icon={MapPin}
              label="Reported Location"
              value={report.streetAddress}
              subValue={report.area}
            />

            <DetailRow
              icon={isOn ? Zap : ZapOff}
              label="Reported Status"
              value={isOn ? "Power is ON" : "Power is OFF"}
            />
          </div>

          <NextStepsCard />

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="h-14 w-full rounded-full bg-[#0663EA] text-base font-semibold text-white transition hover:bg-blue-700 active:scale-95"
            >
              Back to Home
            </button>

            <button
              onClick={() => navigate("/history")}
              className="h-14 w-full rounded-full bg-gray-100 text-base font-semibold text-gray-600 transition hover:bg-gray-200 active:scale-95"
            >
              View My Reports
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ReportSubmitted;