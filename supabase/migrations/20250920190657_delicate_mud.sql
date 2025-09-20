-- Insert sample log data for development
INSERT INTO log_entries (timestamp, level, message, source, thread, logger) VALUES
('2024-01-15 10:00:00', 'INFO', 'Application started successfully', 'Application', 'main', 'com.loganalytics.Application'),
('2024-01-15 10:01:00', 'INFO', 'Database connection established', 'DatabaseService', 'main', 'com.loganalytics.service.DatabaseService'),
('2024-01-15 10:02:00', 'WARN', 'High memory usage detected: 75% of heap space used', 'MemoryMonitor', 'monitor-thread-1', 'com.loganalytics.monitor.MemoryMonitor'),
('2024-01-15 10:03:00', 'ERROR', 'Failed to connect to external API: Connection timeout', 'ApiService', 'http-nio-8080-exec-1', 'com.loganalytics.service.ApiService'),
('2024-01-15 10:04:00', 'INFO', 'User login successful: user@example.com', 'AuthService', 'http-nio-8080-exec-2', 'com.loganalytics.service.AuthService'),
('2024-01-15 10:05:00', 'DEBUG', 'Processing request with correlation ID: abc-123-def', 'RequestProcessor', 'http-nio-8080-exec-3', 'com.loganalytics.processor.RequestProcessor'),
('2024-01-15 10:06:00', 'WARN', 'Cache miss rate above threshold: 25%', 'CacheService', 'cache-thread-1', 'com.loganalytics.service.CacheService'),
('2024-01-15 10:07:00', 'ERROR', 'Database query failed: Table ''users'' doesn''t exist', 'UserRepository', 'http-nio-8080-exec-4', 'com.loganalytics.repository.UserRepository'),
('2024-01-15 10:08:00', 'INFO', 'Scheduled backup completed successfully', 'BackupService', 'scheduler-thread-1', 'com.loganalytics.service.BackupService'),
('2024-01-15 10:09:00', 'TRACE', 'Method entry: validateUserInput()', 'ValidationService', 'http-nio-8080-exec-5', 'com.loganalytics.service.ValidationService');