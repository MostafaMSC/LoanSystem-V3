import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx";
import { Badge } from "../ui/badge.tsx";
import { Clock, DollarSign, FileText, User } from "lucide-react";

const recentActivities = [
  {
    id: 1,
    type: "contract",
    title: "Infrastructure Contract #2024-001 Signed",
    description: "New infrastructure contract worth $2.5M approved",
    amount: 2500000,
    time: "2 hours ago",
    status: "completed",
    department: "Infrastructure"
  },
  {
    id: 2,
    type: "payment",
    title: "Payment Received",
    description: "Housing project payment of $850K received",
    amount: 850000,
    time: "4 hours ago",
    status: "received",
    department: "Housing"
  },
  {
    id: 3,
    type: "loan",
    title: "New Loan Application",
    description: "Transportation department submitted new loan request",
    amount: 3200000,
    time: "6 hours ago",
    status: "pending",
    department: "Transportation"
  },
  {
    id: 4,
    type: "contract",
    title: "Education Contract Completed",
    description: "School construction project finished ahead of schedule",
    amount: 1200000,
    time: "1 day ago",
    status: "completed",
    department: "Education"
  },
  {
    id: 5,
    type: "revenue",
    title: "Non-Sovereign Revenue",
    description: "Monthly revenue collection from various departments",
    amount: 450000,
    time: "2 days ago",
    status: "received",
    department: "Finance"
  }
];

export function RecentActivity() {
  const getIcon = (type: string) => {
    switch (type) {
      case "contract":
        return <FileText className="h-4 w-4" />;
      case "payment":
        return <DollarSign className="h-4 w-4" />;
      case "loan":
        return <User className="h-4 w-4" />;
      case "revenue":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success border-success/20";
      case "received":
        return "bg-primary/10 text-primary border-primary/20";
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg bg-secondary/20 border border-border/50 hover:bg-secondary/30 transition-colors duration-200">
              <div className="flex-shrink-0 p-2 rounded-full bg-primary/10 text-primary">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">
                      {activity.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {activity.department}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-accent">
                      ${activity.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}