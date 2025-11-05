import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const loanData = [
  { month: "Jan", loans: 12, contracts: 28, revenue: 450000 },
  { month: "Feb", loans: 15, contracts: 35, revenue: 520000 },
  { month: "Mar", loans: 18, contracts: 42, revenue: 680000 },
  { month: "Apr", loans: 22, contracts: 38, revenue: 750000 },
  { month: "May", loans: 25, contracts: 45, revenue: 820000 },
  { month: "Jun", loans: 28, contracts: 52, revenue: 950000 },
];

const contractStatusData = [
  { name: "Active", value: 65, color: "hsl(214 100% 60%)" },
  { name: "Completed", value: 25, color: "hsl(142 100% 50%)" },
  { name: "Pending", value: 8, color: "hsl(45 100% 65%)" },
  { name: "Cancelled", value: 2, color: "hsl(0 84% 60%)" },
];

const departmentData = [
  { department: "Infrastructure", budget: 2500000, spent: 1850000 },
  { department: "Housing", budget: 1800000, spent: 1200000 },
  { department: "Transportation", budget: 3200000, spent: 2800000 },
  { department: "Education", budget: 1500000, spent: 980000 },
  { department: "Healthcare", budget: 2100000, spent: 1650000 },
];

export function OverviewChart() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Loans & Contracts Trend */}
      <Card className="col-span-full lg:col-span-2 bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Loans & Contracts Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={loanData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 15%)" />
              <XAxis dataKey="month" stroke="hsl(220 10% 65%)" />
              <YAxis stroke="hsl(220 10% 65%)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(220 15% 9%)", 
                  border: "1px solid hsl(220 15% 15%)",
                  borderRadius: "8px"
                }} 
              />
              <Bar dataKey="loans" fill="hsl(214 100% 60%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="contracts" fill="hsl(45 100% 65%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Contract Status Distribution */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Contract Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={contractStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {contractStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(220 15% 9%)", 
                  border: "1px solid hsl(220 15% 15%)",
                  borderRadius: "8px"
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {contractStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.name}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Budget Analysis */}
      <Card className="col-span-full bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Department Budget Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentData.map((dept) => (
              <div key={dept.department} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground font-medium">{dept.department}</span>
                  <span className="text-muted-foreground">
                    ${dept.spent.toLocaleString()} / ${dept.budget.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(dept.spent / dept.budget) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {((dept.spent / dept.budget) * 100).toFixed(1)}% utilized
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}