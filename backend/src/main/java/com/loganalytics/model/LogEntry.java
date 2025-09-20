package com.loganalytics.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "log_entries")
public class LogEntry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @NotBlank
    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false)
    private LogLevel level;
    
    @NotBlank
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "source")
    private String source;
    
    @Column(name = "thread")
    private String thread;
    
    @Column(name = "logger")
    private String logger;
    
    // Constructors
    public LogEntry() {}
    
    public LogEntry(LocalDateTime timestamp, LogLevel level, String message) {
        this.timestamp = timestamp;
        this.level = level;
        this.message = message;
    }
    
    public LogEntry(LocalDateTime timestamp, LogLevel level, String message, String source, String thread, String logger) {
        this.timestamp = timestamp;
        this.level = level;
        this.message = message;
        this.source = source;
        this.thread = thread;
        this.logger = logger;
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