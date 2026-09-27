import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import PowerStatusCard from "../components/Dashboard/PowerStatusCard";
import ReportPowerButtons from "../components/Dashboard/ReportPowerButtons";
import NeighborhoodActivity from "../components/Dashboard/NeighborHoodActivity";
import HeatmapPreview from "../components/Dashboard/HeatmapPreview";
import BottomNav from "../components/layout/BottomNav";
import type { PowerStatusData, ActivityReport, PowerStatus } from "../types/dashboard";
import { sampleHeatmapData } from "../data/SampleHeatmapData"; 

// Replace with data fetched from your backend
const mockStatus: PowerStatusData = {
  status: "on",
  confirmedByCount: 124,
  confidence: 98,
  lastUpdate: "2m ago",
};

const mockActivity: ActivityReport[] = [
  { 
    id: "1", 
    status: "on", 
    area: "Henry Gorge Area", 
    timeAgo: "Just now",
    timestamp: "Just now",
    location: "Henry Gorge Area"
  },
  { 
    id: "2", 
    status: "off", 
    area: "Adeta Area", 
    timeAgo: "5m ago",
    timestamp: "5m ago",
    location: "Adeta Area"
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState<"dashboard" | "history" | "settings" | "maps">("dashboard");

  const handleReport = (status: PowerStatus) => {
  navigate(`/confirm/${status}`);
};

  const handleNavigate = (item: "dashboard" | "history" | "settings"| "maps") => {
    setActiveNav(item);
    navigate(`/${item === "dashboard" ? "" : item}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 pt-4 pb-28">
      <div className="mx-auto max-w-md">
        {/* Header with bottom border */}
        <div className="mb-4">
          <DashboardHeader
            neighborhood="Adewole Estate"
            onChangeNeighborhood={() => navigate("/set-location")}
          />
        </div>

        {/* Dashboard Content with consistent spacing */}
        <div className="space-y-5">
          {/* Section: Power Status */}
          <section>
            <PowerStatusCard data={mockStatus} />
          </section>

          {/* Section: Report Actions */}
          <section>
            <ReportPowerButtons onReport={handleReport} />
          </section>

          {/* Section: Activity Feed */}
          <section>
            <NeighborhoodActivity
              reports={mockActivity}
              onSeeHistory={() => navigate("/history")}
            />
          </section>

          {/* Section: Heatmap */}
          <section className="pb-4">
            <HeatmapPreview 
              onViewHeatmap={() => navigate("/heatmap")}
              heatmapData={sampleHeatmapData}
              totalNodes={3450}
              activeNodes={3438}
              offlineNodes={12}
              gridHealth={98}
              lastUpdated="2 mins ago"
            />
          </section>
        </div>
      </div>

      <BottomNav active={activeNav} onNavigate={handleNavigate} />
    </main>
  );
};

export default Dashboard;