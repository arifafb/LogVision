package com.loganalytics.dto;

import com.loganalytics.model.LogLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class LogEntryDto {
    
    private Long id;
    
    @NotNull
    private LocalDateTime timestamp;
    
    @NotNull
    private LogLevel level;
    
    @NotBlank
    private String message;
    
    private String source;
    private String thread;
    private String logger;
    
    // Constructors
    public LogEntryDto() {}
    
    public LogEntryDto(LocalDateTime timestamp, LogLevel level, String message) {
        this.timestamp = timestamp;
        this.level = level;
        this.message = message;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public LogLevel getLevel() {
        return level;
    }
    
    public void setLevel(LogLevel level) {
        this.level = level;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getSource() {
        return source;
    }
    
    public void setSource(String source) {
        this.source = source;
    }
    
    public String getThread() {
        return thread;
    }
    
    public void setThread(String thread) {
        this.thread = thread;
    }
    
    public String getLogger() {
        return logger;
    }
    
    public void setLogger(String logger) {
        this.logger = logger;
    }
}