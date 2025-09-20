package com.loganalytics.dto;

public class LogStatsDto {
    
    private long totalLogs;
    private long errorCount;
    private long warnCount;
    private long infoCount;
    private long debugCount;
    private long traceCount;
    private double errorRate;
    
    // Constructors
    public LogStatsDto() {}
    
    public LogStatsDto(long totalLogs, long errorCount, long warnCount, long infoCount, long debugCount, long traceCount) {
        this.totalLogs = totalLogs;
        this.errorCount = errorCount;
        this.warnCount = warnCount;
        this.infoCount = infoCount;
        this.debugCount = debugCount;
        this.traceCount = traceCount;
        this.errorRate = totalLogs > 0 ? (double) errorCount / totalLogs * 100 : 0.0;
    }
    
    // Getters and Setters
    public long getTotalLogs() {
        return totalLogs;
    }
    
    public void setTotalLogs(long totalLogs) {
        this.totalLogs = totalLogs;
    }
    
    public long getErrorCount() {
        return errorCount;
    }
    
    public void setErrorCount(long errorCount) {
        this.errorCount = errorCount;
    }
    
    public long getWarnCount() {
        return warnCount;
    }
    
    public void setWarnCount(long warnCount) {
        this.warnCount = warnCount;
    }
    
    public long getInfoCount() {
        return infoCount;
    }
    
    public void setInfoCount(long infoCount) {
        this.infoCount = infoCount;
    }
    
    public long getDebugCount() {
        return debugCount;
    }
    
    public void setDebugCount(long debugCount) {
        this.debugCount = debugCount;
    }
    
    public long getTraceCount() {
        return traceCount;
    }
    
    public void setTraceCount(long traceCount) {
        this.traceCount = traceCount;
    }
    
    public double getErrorRate() {
        return errorRate;
    }
    
    public void setErrorRate(double errorRate) {
        this.errorRate = errorRate;
    }
}