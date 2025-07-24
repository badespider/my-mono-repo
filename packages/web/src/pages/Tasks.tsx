import DashboardLayout from "@/components/DashboardLayout";
import TaskDashboard from "@/components/TaskDashboard";

const Tasks = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Tasks Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
            <p className="text-muted-foreground">Monitor and manage AI agent task execution</p>
          </div>
        </div>

        {/* Task Dashboard */}
        <TaskDashboard />
      </div>
    </DashboardLayout>
  );
};

export default Tasks;