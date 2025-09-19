import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Server } from "lucide-react";

interface SettingsDialogProps {
  springBootUrl: string;
  onUpdateUrl: (url: string) => void;
}

export default function SettingsDialog({ springBootUrl, onUpdateUrl }: SettingsDialogProps) {
  const [url, setUrl] = useState(springBootUrl);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');

  const validateUrl = (urlToValidate: string): boolean => {
    try {
      const parsedUrl = new URL(urlToValidate);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (!validateUrl(url)) {
      setError('Please enter a valid HTTP or HTTPS URL');
      return;
    }
    setError('');
    onUpdateUrl(url);
    setIsOpen(false);
  };

  const handleReset = () => {
    setUrl('http://localhost:8080');
    setError('');
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          data-testid="button-settings"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Spring Boot Configuration
          </DialogTitle>
          <DialogDescription>
            Configure the connection to your Spring Boot application's WebSocket endpoint.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="springboot-url">Spring Boot WebSocket URL</Label>
            <Input
              id="springboot-url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="http://localhost:8080"
              data-testid="input-springboot-url"
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-xs text-red-500" data-testid="text-url-error">
                {error}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Your Spring Boot app should expose a STOMP WebSocket endpoint at /ws-logs
            </p>
          </div>

          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-medium mb-2">Expected Spring Boot WebSocket setup:</p>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li>• STOMP endpoint: <code>/ws-logs</code></li>
              <li>• Topic: <code>/topic/logs</code></li>
              <li>• Message format: JSON with LogEntry structure</li>
              <li>• CORS configured for frontend origin</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            data-testid="button-reset-url"
          >
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              data-testid="button-save-settings"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}