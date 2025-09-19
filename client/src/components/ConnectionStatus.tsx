import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Activity } from "lucide-react";

interface ConnectionStatusProps {
  isConnected: boolean;
  isStreaming: boolean;
  lastUpdateTime?: Date;
  springBootUrl?: string;
  connectionError?: string | null;
  reconnectAttempts?: number;
}

export default function ConnectionStatus({ 
  isConnected, 
  isStreaming, 
  lastUpdateTime, 
  springBootUrl,
  connectionError,
  reconnectAttempts = 0 
}: ConnectionStatusProps) {
  const getStatusBadge = () => {
    if (!isConnected && isStreaming) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1" data-testid="badge-status-disconnected">
          <WifiOff className="h-3 w-3" />
          {reconnectAttempts > 0 ? `Reconnecting... (${reconnectAttempts})` : 'Disconnected'}
        </Badge>
      );
    }
    
    if (!isConnected && !isStreaming) {
      return (
        <Badge variant="outline" className="flex items-center gap-1" data-testid="badge-status-idle">
          <Wifi className="h-3 w-3" />
          Ready
        </Badge>
      );
    }

    if (isStreaming) {
      return (
        <Badge variant="default" className="flex items-center gap-1 animate-pulse" data-testid="badge-status-streaming">
          <Activity className="h-3 w-3" />
          Live Streaming
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="flex items-center gap-1" data-testid="badge-status-connected">
        <Wifi className="h-3 w-3" />
        Connected
      </Badge>
    );
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        {springBootUrl && isStreaming && (
          <span className="text-xs text-muted-foreground" data-testid="text-endpoint">
            {(() => {
              try {
                return new URL(springBootUrl).host;
              } catch {
                return springBootUrl.replace(/^https?:\/\//, '').split('/')[0];
              }
            })()}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {connectionError && (
          <span className="text-xs text-red-500 max-w-64 truncate" data-testid="text-connection-error">
            {connectionError}
          </span>
        )}
        {lastUpdateTime && !connectionError && (
          <span className="text-xs text-muted-foreground" data-testid="text-last-update">
            Last update: {lastUpdateTime.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}