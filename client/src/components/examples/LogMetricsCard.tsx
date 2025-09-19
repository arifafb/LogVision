import LogMetricsCard from '../LogMetricsCard';

export default function LogMetricsCardExample() {
  const mockStats = {
    totalLogs: 1247,
    errorCount: 23,
    warnCount: 45,
    infoCount: 1179,
    errorRate: 1.8
  };

  return <LogMetricsCard stats={mockStats} />;
}