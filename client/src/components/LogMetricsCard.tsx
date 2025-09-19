import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Info, Bug } from "lucide-react";
import { type LogStats } from "@shared/schema";

interface LogMetricsCardProps {
  stats: LogStats;
  isLoading?: boolean;
}

export default function LogMetricsCard({ stats, isLoading = false }: LogMetricsCardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-1"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Logs",
      value: stats.totalLogs.toLocaleString(),
      icon: Activity,
      trend: "neutral" as const,
      description: "All log entries"
    },
    {
      title: "Errors",
      value: stats.errorCount.toLocaleString(),
      icon: Bug,
      trend: stats.errorCount > 0 ? "down" as const : "neutral" as const,
      description: `${((stats.errorCount / stats.totalLogs) * 100 || 0).toFixed(1)}% of total`
    },
    {
      title: "Warnings",
      value: stats.warnCount.toLocaleString(),
      icon: AlertTriangle,
      trend: stats.warnCount > 0 ? "down" as const : "neutral" as const,
      description: `${((stats.warnCount / stats.totalLogs) * 100 || 0).toFixed(1)}% of total`
    },
    {
      title: "Info Logs",
      value: stats.infoCount.toLocaleString(),
      icon: Info,
      trend: "up" as const,
      description: `${((stats.infoCount / stats.totalLogs) * 100 || 0).toFixed(1)}% of total`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const IconComponent = metric.icon;
        const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : Activity;
        
        return (
          <Card key={metric.title} data-testid={`card-metric-${metric.title.toLowerCase().replace(' ', '-')}`} className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-${metric.title.toLowerCase().replace(' ', '-')}-count`}>
                {metric.value}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <TrendIcon className="h-3 w-3" />
                <span>{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}