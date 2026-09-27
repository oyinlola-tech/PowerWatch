import { useNavigate } from "react-router-dom";
import { Zap, Megaphone, Map } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: Zap,
    title: "Real-time Updates",
    description:
      "Get instant alerts when power goes out or is restored in your grid.",
  },
  {
    icon: Megaphone,
    title: "Report Outages",
    description:
      "Easily log an outage with one tap to help neighbors stay informed.",
  },
  {
    icon: Map,
    title: "Community Map",
    description:
      "Visualize outages across the city with our interactive live map.",
  },
];

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen flex-col bg-white px-6 py-8">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* Header */}
        <div className="mb-8 flex items-center gap-2 border-b border-gray-200 pb-3">
          <img src="/icon.svg" alt="PowerWatch" className="h-7 w-7 rounded-md" />
          <h1 className="text-xl font-semibold text-slate-700">
            <span className="font-bold">Power</span>Watch
          </h1>
        </div>

        {/* Content - Added pt-8 to push everything down */}
        <div className="flex flex-1 flex-col pt-8">
          {/* Heading */}
          <h2 className="text-3xl font-bold text-slate-900">How it works</h2>

          {/* Steps - Added mt-8 for more spacing */}
          <div className="mt-8 space-y-4">
            {steps.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-2xl border border-gray-200 p-4"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#0663EA]">
                  <Icon size={20} className="text-white" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => navigate("/location")}
            className="mt-auto h-14 w-full rounded-full bg-[#0663EA] text-lg font-semibold text-white transition hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
};

export default HowItWorks;