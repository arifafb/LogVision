import LogAnalyticsDashboard from '../LogAnalyticsDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Mock the API endpoints
const mockApiResponse = {
  '/api/logs/stats': {
    totalLogs: 1247,
    errorCount: 23,
    warnCount: 45,
    infoCount: 1179,
    errorRate: 1.8
  },
  '/api/logs/timeseries': Array.from({ length: 24 }, (_, i) => {
    const timestamp = new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString();
    const error = Math.floor(Math.random() * 10);
    const warn = Math.floor(Math.random() * 15) + 5;
    const info = Math.floor(Math.random() * 50) + 20;
    return { timestamp, error, warn, info, total: error + warn + info };
  }),
  '/api/logs': [
    {
      id: 1,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      level: 'ERROR',
      message: 'Database connection timeout after 30 seconds. Connection pool exhausted.'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      level: 'WARN',
      message: 'High memory usage detected: 85% of heap space used.'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      level: 'INFO',
      message: 'User authentication successful for user: admin@example.com'
    }
  ]
};

// Mock fetch function
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url: string) => {
  const urlPath = new URL(url, 'http://localhost').pathname;
  const queryParams = new URL(url, 'http://localhost').searchParams;
  
  if (urlPath === '/api/logs/timeseries') {
    return {
      ok: true,
      json: () => Promise.resolve(mockApiResponse['/api/logs/timeseries'])
    } as Response;
  }
  
  if (mockApiResponse[urlPath as keyof typeof mockApiResponse]) {
    return {
      ok: true,
      json: () => Promise.resolve(mockApiResponse[urlPath as keyof typeof mockApiResponse])
    } as Response;
  }
  
  return originalFetch(url);
};

export default function LogAnalyticsDashboardExample() {
  return (
    <QueryClientProvider client={queryClient}>
      <LogAnalyticsDashboard />
    </QueryClientProvider>
  );
}