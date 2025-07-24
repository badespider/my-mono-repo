import DashboardLayout from "@/components/DashboardLayout";
import PortfolioSummary from "@/components/PortfolioSummary";
import AgentStatusGrid from "@/components/AgentStatusGrid";
import TaskDashboard from "@/components/TaskDashboard";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Portfolio Summary Cards */}
        <PortfolioSummary />
        
        {/* AI Agents Status Grid */}
        <AgentStatusGrid />
        
        {/* Live Tasks Dashboard */}
        <TaskDashboard />
      </div>
    </DashboardLayout>
  );
};

export default Index;
