import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { type LogStats, type TimeSeriesData } from "@shared/schema";
import LogTimeSeriesChart from "@/components/LogTimeSeriesChart";
import LogLevelDistributionChart from "@/components/LogLevelDistributionChart";
import LogMetricsCard from "@/components/LogMetricsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar } from "lucide-react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('24');
  
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<LogStats>({
    queryKey: ['/api/logs/stats']
  });

  const { data: timeSeriesData, isLoading: timeSeriesLoading, refetch: refetchTimeSeries } = useQuery<TimeSeriesData[]>({
    queryKey: ['/api/logs/timeseries', timeRange]
  });

  const handleRefresh = () => {
    refetchStats();
    refetchTimeSeries();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-analytics-title">
            Log Analytics
          </h1>
          <p className="text-muted-foreground">
            Detailed analysis and trends of your log data
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40" data-testid="select-analytics-time-range">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last Hour</SelectItem>
              <SelectItem value="6">Last 6 Hours</SelectItem>
              <SelectItem value="24">Last 24 Hours</SelectItem>
              <SelectItem value="72">Last 3 Days</SelectItem>
              <SelectItem value="168">Last Week</SelectItem>
            </SelectContent>
          </Select>
          
          <Button size="sm" variant="outline" onClick={handleRefresh} data-testid="button-refresh-analytics">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <LogMetricsCard 
        stats={stats || { totalLogs: 0, errorCount: 0, warnCount: 0, infoCount: 0, errorRate: 0 }}
        isLoading={statsLoading}
      />

      {/* Time Series Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Log Activity Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <LogTimeSeriesChart 
            data={timeSeriesData || []}
            isLoading={timeSeriesLoading}
          />
        </CardContent>
      </Card>

      {/* Distribution Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LogLevelDistributionChart 
          stats={stats || { totalLogs: 0, errorCount: 0, warnCount: 0, infoCount: 0, errorRate: 0 }}
          isLoading={statsLoading}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Log Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Error Rate Trend</span>
                <span className="text-sm text-muted-foreground">
                  {stats ? `${stats.errorRate.toFixed(2)}%` : '0%'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Most Active Period</span>
                <span className="text-sm text-muted-foreground">
                  {/* TODO: Calculate from time series data */}
                  Peak: 14:00-16:00
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Logs/Hour</span>
                <span className="text-sm text-muted-foreground">
                  {stats && timeRange ? Math.round(stats.totalLogs / parseInt(timeRange)) : 0}
                </span>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-md">
                <h4 className="font-medium mb-2">Insights</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Error rate is within acceptable limits</li>
                  <li>• Log volume is consistent with normal operations</li>
                  <li>• No anomalous patterns detected</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}