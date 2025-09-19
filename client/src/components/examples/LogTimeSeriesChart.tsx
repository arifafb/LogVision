import LogTimeSeriesChart from '../LogTimeSeriesChart';

export default function LogTimeSeriesChartExample() {
  // Generate mock time series data for the last 24 hours
  const mockData = Array.from({ length: 24 }, (_, i) => {
    const timestamp = new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString();
    const error = Math.floor(Math.random() * 10) + (i > 18 ? Math.random() * 20 : 0); // More errors in recent hours
    const warn = Math.floor(Math.random() * 15) + 5;
    const info = Math.floor(Math.random() * 50) + 20;
    const total = error + warn + info;
    
    return {
      timestamp,
      error,
      warn,
      info,
      total
    };
  });

  return <LogTimeSeriesChart data={mockData} />;
}