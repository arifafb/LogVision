import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import LogMetricsCard from "./LogMetricsCard";
import LogTimeSeriesChart from "./LogTimeSeriesChart";
import LogLevelDistributionChart from "./LogLevelDistributionChart";
import LogViewer from "./LogViewer";
import ConnectionStatus from "./ConnectionStatus";
import SettingsDialog from "./SettingsDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Download } from "lucide-react";
import { type LogEntry, type LogStats, type TimeSeriesData } from "@shared/schema";
import { Client } from "@stomp/stompjs";

interface DashboardState {
  isStreaming: boolean;
  timeRange: string;
  isConnected: boolean;
  lastUpdate: Date | null;
  stompClient: Client | null;
  springBootUrl: string;
  connectionError: string | null;
  reconnectAttempts: number;
}

export default function LogAnalyticsDashboard() {
  const [state, setState] = useState<DashboardState>({
    isStreaming: false,
    timeRange: '24',
    isConnected: false,
    lastUpdate: new Date(),
    stompClient: null,
    springBootUrl: typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https://localhost:8080' : 'http://localhost:8080',
    connectionError: null,
    reconnectAttempts: 0
  });

  // Fetch log statistics
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<LogStats>({
    queryKey: ['/api/logs/stats'],
    refetchInterval: state.isStreaming ? 5000 : false
  });

  // Fetch time series data
  const { data: timeSeriesData, isLoading: timeSeriesLoading, refetch: refetchTimeSeries } = useQuery<TimeSeriesData[]>({
    queryKey: ['/api/logs/timeseries', state.timeRange],
    refetchInterval: state.isStreaming ? 10000 : false
  });

  // Fetch recent logs
  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useQuery<LogEntry[]>({
    queryKey: ['/api/logs'],
    refetchInterval: state.isStreaming ? 3000 : false
  });

  // Cleanup WebSocket connection on component unmount
  useEffect(() => {
    return () => {
      if (state.stompClient) {
        console.log('🧹 Cleaning up WebSocket connection on unmount');
        state.stompClient.deactivate();
      }
    };
  }, [state.stompClient]);

  const handleToggleStreaming = () => {
    if (!state.isStreaming) {
      console.log('🔄 Starting WebSocket streaming...');
      setState(prev => ({ ...prev, isStreaming: true }));
      connectToWebSocket(state.springBootUrl);
    } else {
      // Stop WebSocket connection
      console.log('🛑 Stopping WebSocket connection...');
      if (state.stompClient) {
        state.stompClient.deactivate();
      }
      setState(prev => ({ 
        ...prev, 
        isStreaming: false,
        stompClient: null,
        isConnected: false,
        connectionError: null,
        lastUpdate: new Date() 
      }));
      console.log('⏹️ Streaming stopped');
    }
  };

  const connectToWebSocket = (url: string) => {
    // Build proper WebSocket URL
    const currentUrl = (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http:'))
      ? url.replace('http:', 'https:')
      : url;
    const wsUrl = currentUrl.replace(/^https?/, (match) => match === 'https' ? 'wss' : 'ws');
    const endpoint = `${wsUrl}/ws-logs`;
    console.log('Connecting to WebSocket endpoint:', endpoint);
    
    const client = new Client({
      webSocketFactory: () => new WebSocket(endpoint),
      reconnectDelay: 1000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log('STOMP:', str),
      
      onConnect: () => {
        console.log('✅ Connected to Spring Boot WebSocket');
        setState(prev => ({ ...prev, isConnected: true, connectionError: null, reconnectAttempts: 0 }));
        
        // Subscribe to log topic
        client.subscribe('/topic/logs', (message) => {
          try {
            const logData: LogEntry = JSON.parse(message.body);
            console.log('📥 Received log from Spring Boot:', logData);
            
            // Optimistically update query cache with new log entry
            queryClient.setQueryData(['/api/logs'], (oldData: LogEntry[] | undefined) => {
              if (!oldData) return [logData];
              return [logData, ...oldData].slice(0, 1000);
            });
            
            // Update stats cache incrementally
            queryClient.setQueryData(['/api/logs/stats'], (oldStats: LogStats | undefined) => {
              if (!oldStats) return {
                totalLogs: 1,
                errorCount: logData.level === 'error' ? 1 : 0,
                warnCount: logData.level === 'warn' ? 1 : 0,
                infoCount: logData.level === 'info' ? 1 : 0,
                errorRate: logData.level === 'error' ? 100 : 0
              };
              
              const newTotalLogs = oldStats.totalLogs + 1;
              const newErrorCount = oldStats.errorCount + (logData.level === 'error' ? 1 : 0);
              const newWarnCount = oldStats.warnCount + (logData.level === 'warn' ? 1 : 0);
              const newInfoCount = oldStats.infoCount + (logData.level === 'info' ? 1 : 0);
              const newErrorRate = newTotalLogs > 0 ? (newErrorCount / newTotalLogs) * 100 : 0;
              
              return {
                totalLogs: newTotalLogs,
                errorCount: newErrorCount,
                warnCount: newWarnCount,
                infoCount: newInfoCount,
                errorRate: newErrorRate
              };
            });
            
            queryClient.invalidateQueries({ queryKey: ['/api/logs/timeseries', state.timeRange] });
            setState(prev => ({ ...prev, lastUpdate: new Date() }));
          } catch (error) {
            console.error('Error parsing log message:', error);
          }
        });
      },
      
      onDisconnect: () => {
        console.log('❌ Disconnected from Spring Boot WebSocket');
        setState(prev => ({ ...prev, isConnected: false }));
      },
      
      onStompError: (frame) => {
        const errorMsg = `STOMP error: ${frame.headers?.message || 'Unknown error'}`;
        console.error('🚫', errorMsg, frame);
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          connectionError: errorMsg,
          reconnectAttempts: prev.reconnectAttempts + 1
        }));
      },
      
      onWebSocketError: (error) => {
        console.error('🚫 WebSocket error:', error);
        const errorMsg = `Connection failed to ${url}. Verify Spring Boot is running with WebSocket/STOMP support.`;
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          connectionError: errorMsg,
          reconnectAttempts: prev.reconnectAttempts + 1
          // Keep isStreaming as is - it represents user intent, not connection status
        }));
      },
      
      onWebSocketClose: (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        if (event.code !== 1000) {
          setState(prev => ({ 
            ...prev, 
            connectionError: `Connection lost: ${event.reason || 'Unknown reason'}` 
          }));
        }
      }
    });
    
    client.activate();
    
    setState(prev => ({ 
      ...prev, 
      stompClient: client,
      lastUpdate: new Date() 
    }));
  };
  
  const handleUpdateSpringBootUrl = async (newUrl: string) => {
    console.log('🔧 Updating Spring Boot URL to:', newUrl);
    
    // If currently streaming, gracefully reconnect
    if (state.isStreaming && state.stompClient) {
      console.log('Disconnecting from current endpoint...');
      
      try {
        await state.stompClient.deactivate();
        console.log('Successfully disconnected');
      } catch (error) {
        console.warn('Disconnect error (continuing):', error);
      }
      
      // Update state and reconnect immediately
      setState(prev => ({ 
        ...prev, 
        springBootUrl: newUrl, 
        isConnected: false, 
        connectionError: null, 
        stompClient: null,
        reconnectAttempts: 0
      }));
      
      // Connect directly to new URL
      connectToWebSocket(newUrl);
    } else {
      setState(prev => ({ ...prev, springBootUrl: newUrl }));
    }
  };

  const handleRefreshAll = () => {
    refetchStats();
    refetchTimeSeries();
    refetchLogs();
    setState(prev => ({ ...prev, lastUpdate: new Date() }));
    console.log('Dashboard refreshed');
  };

  const handleTimeRangeChange = (value: string) => {
    setState(prev => ({ ...prev, timeRange: value }));
    console.log('Time range changed to:', value, 'hours');
  };

  const handleExportLogs = () => {
    // TODO: Implement actual export functionality
    console.log('Export logs triggered');
    if (logs && logs.length > 0) {
      const csvContent = [
        ['Timestamp', 'Level', 'Message'],
        ...logs.map(log => [
          new Date(log.timestamp).toISOString(),
          log.level,
          log.message.replace(/\n/g, ' ')
        ])
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `logs-${new Date().toISOString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6 p-6" data-testid="container-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">
            Log Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring and analysis of system logs
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <ConnectionStatus 
            isConnected={state.isConnected}
            isStreaming={state.isStreaming}
            lastUpdateTime={state.lastUpdate}
            springBootUrl={state.springBootUrl}
            connectionError={state.connectionError}
            reconnectAttempts={state.reconnectAttempts}
          />
          
          <div className="flex items-center gap-2">
            <Select value={state.timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-32" data-testid="select-time-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last Hour</SelectItem>
                <SelectItem value="6">Last 6 Hours</SelectItem>
                <SelectItem value="24">Last 24 Hours</SelectItem>
                <SelectItem value="168">Last Week</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefreshAll}
              data-testid="button-refresh-dashboard"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportLogs}
              data-testid="button-export-logs"
              disabled={!logs || logs.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <SettingsDialog 
              springBootUrl={state.springBootUrl}
              onUpdateUrl={handleUpdateSpringBootUrl}
            />
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <LogMetricsCard 
        stats={stats || { totalLogs: 0, errorCount: 0, warnCount: 0, infoCount: 0, errorRate: 0 }}
        isLoading={statsLoading}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LogTimeSeriesChart 
          data={timeSeriesData || []}
          isLoading={timeSeriesLoading}
        />
        
        <LogLevelDistributionChart 
          stats={stats || { totalLogs: 0, errorCount: 0, warnCount: 0, infoCount: 0, errorRate: 0 }}
          isLoading={statsLoading}
        />
      </div>

      {/* Log Viewer */}
      <LogViewer 
        logs={logs || []}
        isLoading={logsLoading}
        isStreaming={state.isStreaming}
        onToggleStreaming={handleToggleStreaming}
      />

      {/* Health Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats ? (100 - stats.errorRate).toFixed(1) : '0'}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {state.isStreaming ? 'Active' : 'Paused'}
              </div>
              <div className="text-sm text-muted-foreground">Monitoring Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {state.lastUpdate ? state.lastUpdate.toLocaleTimeString() : '-'}
              </div>
              <div className="text-sm text-muted-foreground">Last Update</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}