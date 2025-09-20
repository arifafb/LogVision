package com.loganalytics.service;

import com.loganalytics.dto.LogEntryDto;
import com.loganalytics.model.LogLevel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class LogGeneratorService {
    
    @Autowired
    private LogService logService;
    
    private final Random random = new Random();
    
    private final String[] errorMessages = {
        "Database connection timeout after 30 seconds",
        "Failed to process payment transaction",
        "Authentication failed for user",
        "Memory allocation error in heap space",
        "Network connection refused",
        "File not found exception occurred",
        "Invalid JSON format in request body",
        "SQL constraint violation detected"
    };
    
    private final String[] warnMessages = {
        "High memory usage detected: 85% of heap space used",
        "API rate limit approaching: 950/1000 requests",
        "Slow database query detected (>2s execution time)",
        "Cache miss rate is above threshold (>20%)",
        "Deprecated API endpoint accessed",
        "Configuration value using default setting",
        "Connection pool size approaching maximum",
        "Disk space usage above 80%"
    };
    
    private final String[] infoMessages = {
        "User authentication successful",
        "System backup completed successfully",
        "New user registration completed",
        "Cache refreshed successfully",
        "Scheduled task executed successfully",
        "Configuration reloaded from file",
        "Health check passed for all services",
        "Data synchronization completed"
    };
    
    private final String[] debugMessages = {
        "Processing request with ID: REQ-" + System.currentTimeMillis(),
        "Cache lookup performed for key: user_session_" + random.nextInt(1000),
        "Database query executed in " + (random.nextInt(500) + 50) + "ms",
        "Method entry: processUserData()",
        "Validation completed for input parameters",
        "Thread pool status: " + (random.nextInt(10) + 1) + "/10 active threads",
        "Memory usage: " + (random.nextInt(30) + 40) + "% of allocated heap",
        "Network latency measured: " + (random.nextInt(100) + 10) + "ms"
    };
    
    private final String[] sources = {
        "UserService", "PaymentService", "AuthService", "DatabaseService", 
        "CacheService", "NotificationService", "ReportService", "ApiGateway"
    };
    
    private final String[] threads = {
        "http-nio-8080-exec-1", "http-nio-8080-exec-2", "scheduler-thread-1", 
        "async-task-executor-1", "background-worker-1", "main"
    };
    
    // Generate a log every 5-15 seconds for demo purposes
    @Scheduled(fixedDelay = 8000) // 8 seconds
    public void generateRandomLog() {
        LogLevel level = getRandomLogLevel();
        String message = getRandomMessage(level);
        String source = sources[random.nextInt(sources.length)];
        String thread = threads[random.nextInt(threads.length)];
        
        LogEntryDto logDto = new LogEntryDto();
        logDto.setTimestamp(LocalDateTime.now());
        logDto.setLevel(level);
        logDto.setMessage(message);
        logDto.setSource(source);
        logDto.setThread(thread);
        logDto.setLogger(source + ".class");
        
        logService.createLog(logDto);
    }
    
    private LogLevel getRandomLogLevel() {
        int rand = random.nextInt(100);
        if (rand < 10) return LogLevel.ERROR;      // 10% error
        if (rand < 25) return LogLevel.WARN;       // 15% warn
        if (rand < 70) return LogLevel.INFO;       // 45% info
        if (rand < 90) return LogLevel.DEBUG;      // 20% debug
        return LogLevel.TRACE;                     // 10% trace
    }
    
    private String getRandomMessage(LogLevel level) {
        return switch (level) {
            case ERROR -> errorMessages[random.nextInt(errorMessages.length)];
            case WARN -> warnMessages[random.nextInt(warnMessages.length)];
            case INFO -> infoMessages[random.nextInt(infoMessages.length)];
            case DEBUG -> debugMessages[random.nextInt(debugMessages.length)];
            case TRACE -> "Trace: " + debugMessages[random.nextInt(debugMessages.length)];
        };
    }
}