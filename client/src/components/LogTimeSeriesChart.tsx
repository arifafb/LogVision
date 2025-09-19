import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { type TimeSeriesData } from "@shared/schema";

interface LogTimeSeriesChartProps {
  data: TimeSeriesData[];
  isLoading?: boolean;
}

export default function LogTimeSeriesChart({ data, isLoading = false }: LogTimeSeriesChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-32"></div>
            <div className="h-8 bg-muted rounded w-20"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Format data for better display
  const formattedData = data.map(item => ({
    ...item,
    time: new Date(item.timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit'
    })
  }));

  const ChartComponent = chartType === 'line' ? LineChart : BarChart;

  return (
    <Card className="col-span-2" data-testid="card-timeseries-chart">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Log Activity Timeline</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={chartType === 'line' ? 'default' : 'outline'}
              onClick={() => setChartType('line')}
              data-testid="button-chart-line"
            >
              Line
            </Button>
            <Button
              size="sm"
              variant={chartType === 'bar' ? 'default' : 'outline'}
              onClick={() => setChartType('bar')}
              data-testid="button-chart-bar"
            >
              Bar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <ChartComponent
            data={formattedData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              labelStyle={{ 
                color: 'hsl(var(--foreground))',
                backgroundColor: 'hsl(var(--background))'
              }}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            
            {chartType === 'line' ? (
              <>
                <Line 
                  type="monotone" 
                  dataKey="error" 
                  stroke="hsl(var(--chart-5))" 
                  strokeWidth={2}
                  name="Errors"
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="warn" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  name="Warnings"
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="info" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  name="Info"
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={3}
                  name="Total"
                  dot={{ r: 4 }}
                />
              </>
            ) : (
              <>
                <Bar dataKey="error" stackId="a" fill="hsl(var(--chart-5))" name="Errors" />
                <Bar dataKey="warn" stackId="a" fill="hsl(var(--chart-3))" name="Warnings" />
                <Bar dataKey="info" stackId="a" fill="hsl(var(--chart-2))" name="Info" />
              </>
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}