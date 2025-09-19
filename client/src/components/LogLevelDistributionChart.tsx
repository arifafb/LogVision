import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bug, Info, Activity } from "lucide-react";
import { type LogStats } from "@shared/schema";

interface LogLevelDistributionChartProps {
  stats: LogStats;
  isLoading?: boolean;
}

const COLORS = {
  ERROR: 'hsl(var(--chart-5))',
  WARN: 'hsl(var(--chart-3))',
  INFO: 'hsl(var(--chart-2))',
  OTHER: 'hsl(var(--chart-4))'
};

export default function LogLevelDistributionChart({ stats, isLoading = false }: LogLevelDistributionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const data = [
    {
      name: 'Errors',
      value: stats.errorCount,
      color: COLORS.ERROR,
      icon: Bug,
      percentage: stats.totalLogs > 0 ? ((stats.errorCount / stats.totalLogs) * 100).toFixed(1) : 0
    },
    {
      name: 'Warnings',
      value: stats.warnCount,
      color: COLORS.WARN,
      icon: AlertTriangle,
      percentage: stats.totalLogs > 0 ? ((stats.warnCount / stats.totalLogs) * 100).toFixed(1) : 0
    },
    {
      name: 'Info',
      value: stats.infoCount,
      color: COLORS.INFO,
      icon: Info,
      percentage: stats.totalLogs > 0 ? ((stats.infoCount / stats.totalLogs) * 100).toFixed(1) : 0
    }
  ].filter(item => item.value > 0); // Only show levels that have logs

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover p-3 rounded-md border shadow-lg">
          <div className="flex items-center gap-2">
            <data.icon className="h-4 w-4" />
            <span className="font-medium">{data.name}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Count: {data.value.toLocaleString()} ({data.percentage}%)
          </div>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Card data-testid="card-log-distribution">
        <CardHeader>
          <CardTitle>Log Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No log data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-log-distribution">
      <CardHeader>
        <CardTitle>Log Level Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex flex-col gap-3">
            {data.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-sm" 
                    style={{ backgroundColor: item.color }}
                  />
                  <IconComponent className="h-4 w-4" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.value.toLocaleString()} ({item.percentage}%)
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="mt-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Logs</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}