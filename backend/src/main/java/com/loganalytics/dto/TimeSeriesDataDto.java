package com.loganalytics.dto;

import java.time.LocalDateTime;

public class TimeSeriesDataDto {
    
    private LocalDateTime timestamp;
    private long error;
    private long warn;
    private long info;
    private long debug;
    private long trace;
    private long total;
    
    // Constructors
    public TimeSeriesDataDto() {}
    
    public TimeSeriesDataDto(LocalDateTime timestamp, long error, long warn, long info, long debug, long trace, long total) {
        this.timestamp = timestamp;
        this.error = error;
        this.warn = warn;
        this.info = info;
        this.debug = debug;
        this.trace = trace;
        this.total = total;
    }
    
    // Getters and Setters
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public long getError() {
        return error;
    }
    
    public void setError(long error) {
        this.error = error;
    }
    
    public long getWarn() {
        return warn;
    }
    
    public void setWarn(long warn) {
        this.warn = warn;
    }
    
    public long getInfo() {
        return info;
    }
    
    public void setInfo(long info) {
        this.info = info;
    }
    
    public long getDebug() {
        return debug;
    }
    
    public void setDebug(long debug) {
        this.debug = debug;
    }
    
    public long getTrace() {
        return trace;
    }
    
    public void setTrace(long trace) {
        this.trace = trace;
    }
    
    public long getTotal() {
        return total;
    }
    
    public void setTotal(long total) {
        this.total = total;
    }
}