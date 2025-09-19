import { useQuery } from "@tanstack/react-query";
import LogViewer from "@/components/LogViewer";
import { useState } from "react";
import { type LogEntry } from "@shared/schema";

export default function LiveLogs() {
  const [isStreaming, setIsStreaming] = useState(true);
  
  const { data: logs, isLoading } = useQuery<LogEntry[]>({
    queryKey: ['/api/logs'],
    refetchInterval: isStreaming ? 2000 : false
  });

  const handleToggleStreaming = () => {
    setIsStreaming(!isStreaming);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-live-logs-title">
          Live Log Stream
        </h1>
        <p className="text-muted-foreground">
          Real-time monitoring of system logs with advanced filtering
        </p>
      </div>
      
      <LogViewer 
        logs={logs || []}
        isLoading={isLoading}
        isStreaming={isStreaming}
        onToggleStreaming={handleToggleStreaming}
      />
    </div>
  );
}