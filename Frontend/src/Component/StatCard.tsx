import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx";
import { LucideIcon } from "lucide-react";
import { cn } from "../lib/utils.ts";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  variant?: "default" | "primary" | "accent" | "success";
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon, 
  variant = "default",
  className 
}: StatCardProps) {
  const variantStyles = {
    default: "bg-gradient-card border-border",
    primary: "bg-gradient-primary border-primary/20 shadow-glow",
    accent: "bg-gradient-accent border-accent/20",
    success: "bg-gradient-success border-success/20"
  };

  const changeStyles = {
    positive: "text-success",
    negative: "text-destructive", 
    neutral: "text-muted-foreground"
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-card",
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn(
          "h-5 w-5",
          variant === "primary" ? "text-primary-foreground" : 
          variant === "accent" ? "text-accent-foreground" :
          variant === "success" ? "text-white" : "text-primary"
        )} />
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold",
          variant === "primary" ? "text-primary-foreground" :
          variant === "accent" ? "text-accent-foreground" :
          variant === "success" ? "text-white" : "text-foreground"
        )}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {change && (
          <p className={cn("text-xs mt-1", changeStyles[changeType])}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}