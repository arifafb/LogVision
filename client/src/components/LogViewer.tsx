import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, RefreshCw, AlertCircle, AlertTriangle, Info, Bug, Play, Pause } from "lucide-react";
import { format } from "date-fns";
import { type LogEntry, type LogLevel } from "@shared/schema";

interface LogViewerProps {
  logs: LogEntry[];
  isLoading?: boolean;
  isStreaming?: boolean;
  onToggleStreaming?: () => void;
}

interface LogFilters {
  search: string;
  level: LogLevel | 'ALL';
  dateRange: string;
}

export default function LogViewer({ logs, isLoading = false, isStreaming = false, onToggleStreaming }: LogViewerProps) {
  const [filters, setFilters] = useState<LogFilters>({
    search: '',
    level: 'ALL',
    dateRange: 'all'
  });
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR': return <Bug className="h-4 w-4" />;
      case 'WARN': return <AlertTriangle className="h-4 w-4" />;
      case 'INFO': return <Info className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'destructive';
      case 'WARN': return 'secondary';
      case 'INFO': return 'default';
      default: return 'outline';
    }
  };

  // Filter logs based on current filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = filters.search === '' || 
      log.message.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.level.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesLevel = filters.level === 'ALL' || log.level === filters.level;
    
    return matchesSearch && matchesLevel;
  });

  const formatMessage = (message: string) => {
    // Split by newlines and create proper formatting for stack traces
    const lines = message.split('\n');
    return lines.map((line, index) => {
      const isStackTrace = line.trim().startsWith('at ');
      return (
        <div key={index} className={`${isStackTrace ? 'text-muted-foreground pl-4 text-sm' : ''}`}>
          {line || '\u00A0'} {/* Non-breaking space for empty lines */}
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-24"></div>
            <div className="h-8 bg-muted rounded w-32"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-log-viewer">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <span>Log Stream</span>
            {isStreaming && (
              <Badge variant="default" className="animate-pulse">
                LIVE
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-8 w-64"
                data-testid="input-log-search"
              />
            </div>
            
            <Select value={filters.level} onValueChange={(value: LogLevel | 'ALL') => setFilters(prev => ({ ...prev, level: value }))}>
              <SelectTrigger className="w-32" data-testid="select-log-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Levels</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="WARN">Warning</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
              </SelectContent>
            </Select>
            
            {onToggleStreaming && (
              <Button
                size="sm"
                variant={isStreaming ? "default" : "outline"}
                onClick={onToggleStreaming}
                data-testid="button-toggle-streaming"
              >
                {isStreaming ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isStreaming ? 'Pause' : 'Stream'}
              </Button>
            )}
            
            <Button size="sm" variant="outline" onClick={() => window.location.reload()} data-testid="button-refresh-logs">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {filters.search || filters.level !== 'ALL' ? 'No logs match your filters' : 'No logs available'}
              </div>
            ) : (
              filteredLogs.map((log) => (
                <Dialog key={log.id}>
                  <DialogTrigger asChild>
                    <div 
                      className="p-3 border rounded-md hover-elevate cursor-pointer transition-colors"
                      data-testid={`row-log-${log.id}`}
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Badge 
                            variant={getLevelColor(log.level) as any}
                            className="flex items-center gap-1 shrink-0"
                          >
                            {getLevelIcon(log.level)}
                            {log.level}
                          </Badge>
                          
                          <span className="text-sm text-muted-foreground shrink-0">
                            {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                          </span>
                          
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-mono truncate" data-testid={`text-log-message-${log.id}`}>
                              {log.message.split('\n')[0]}
                            </p>
                            {log.message.includes('\n') && (
                              <p className="text-xs text-muted-foreground mt-1">
                                +{log.message.split('\n').length - 1} more lines...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Badge variant={getLevelColor(log.level) as any} className="flex items-center gap-1">
                          {getLevelIcon(log.level)}
                          {log.level}
                        </Badge>
                        <span className="text-muted-foreground">
                          {format(new Date(log.timestamp), 'PPpp')}
                        </span>
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-96">
                      <div className="font-mono text-sm whitespace-pre-wrap bg-muted p-4 rounded-md">
                        {formatMessage(log.message)}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}