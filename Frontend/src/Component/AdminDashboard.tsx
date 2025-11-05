import { StatCard } from "./StatCard.tsx";
import { OverviewChart } from "./OverviewChart.tsx";
import { RecentActivity } from "./RecentActivity.tsx";
import {
  DollarSign,
  FileText,
  TrendingUp,
  Users,
  Building2,
  PieChart,
  Clock,
  CheckCircle
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="container py-5">
      {/* Header */}
      <div className="mb-4">
        <h1 className="display-6 fw-bold">Loan Management Dashboard</h1>
        <p className="text-muted">
          Comprehensive overview of loans, contracts, and financial performance
        </p>
      </div>

      {/* Key Statistics */}
      <div className="row g-4 mb-4">
        <StatCard title="Total Loans" value={156} icon={FileText} />
        <StatCard title="Active Contracts" value={89} icon={Building2} />
        <StatCard title="Total Revenue" value="$12.8M" icon={DollarSign} />
        <StatCard title="Departments" value={24} icon={Users} />
      </div>

      {/* Financial Overview */}
      <div className="row g-4 mb-4">
        <StatCard title="Contract Amount" value="$8.2M" icon={TrendingUp} />
        <StatCard title="Payments Received" value="$5.6M" icon={CheckCircle} />
        <StatCard title="Pending Approvals" value={23} icon={Clock} />
        <StatCard title="Budget Utilization" value="74%" icon={PieChart} />
      </div>

      {/* Overview Chart */}
      <div className="mb-4">
        <OverviewChart />
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <RecentActivity />
        </div>
        <div className="col-lg-4">
          <StatCard title="Avg Contract Value" value="$892K" icon={DollarSign} />
          <StatCard title="Completion Rate" value="94%" icon={CheckCircle} />
          <StatCard title="Revenue Growth" value="15.8%" icon={TrendingUp} />
        </div>
      </div>

      {/* Department Performance Summary */}
      <div className="card p-4">
        <h3 className="h5 fw-semibold mb-4">Department Performance Summary</h3>
        <div className="row g-4">
          {[
            { name: "Infrastructure", projects: 12, budget: "$3.2M", utilization: 87 },
            { name: "Housing", projects: 8, budget: "$1.8M", utilization: 67 },
            { name: "Transportation", projects: 15, budget: "$4.1M", utilization: 92 },
            { name: "Education", projects: 6, budget: "$1.2M", utilization: 73 },
            { name: "Healthcare", projects: 9, budget: "$2.1M", utilization: 81 }
          ].map((dept) => (
            <div className="col-md-6 col-lg-4 col-xl-2" key={dept.name}>
              <div className="card p-3 h-100">
                <h5 className="fw-bold">{dept.name}</h5>
                <p className="mb-1">Projects: {dept.projects}</p>
                <p className="mb-1">Budget: {dept.budget}</p>
                <p className="mb-1">Utilization: {dept.utilization}%</p>
                <div className="progress" style={{ height: "5px" }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${dept.utilization}%` }}
                    aria-valuenow={dept.utilization} aria-valuemin={0} aria-valuemax={100}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


