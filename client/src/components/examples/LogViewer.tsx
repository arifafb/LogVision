import LogViewer from '../LogViewer';

export default function LogViewerExample() {
  const mockLogs = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      level: 'ERROR' as const,
      message: 'Database connection timeout after 30 seconds. Connection pool exhausted.\n\tat com.example.DatabasePool.getConnection(DatabasePool.java:145)\n\tat com.example.UserService.findUser(UserService.java:67)'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      level: 'WARN' as const,
      message: 'High memory usage detected: 85% of heap space used. Consider increasing memory allocation.'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      level: 'INFO' as const,
      message: 'User authentication successful for user: admin@example.com'
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      level: 'ERROR' as const,
      message: 'Failed to process payment transaction ID: txn_1234567890\nReason: Invalid credit card number\nUser ID: usr_9876543210'
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      level: 'WARN' as const,
      message: 'API rate limit approaching: 950/1000 requests in current window'
    },
    {
      id: 6,
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      level: 'INFO' as const,
      message: 'System backup completed successfully. Backup size: 2.3GB, Duration: 45 minutes'
    }
  ];

  const handleToggleStreaming = () => {
    console.log('Toggle streaming triggered');
  };

  return (
    <LogViewer 
      logs={mockLogs} 
      isStreaming={true}
      onToggleStreaming={handleToggleStreaming}
    />
  );
}