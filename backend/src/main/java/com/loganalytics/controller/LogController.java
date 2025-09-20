package com.loganalytics.controller;

import com.loganalytics.dto.LogEntryDto;
import com.loganalytics.dto.LogStatsDto;
import com.loganalytics.dto.TimeSeriesDataDto;
import com.loganalytics.model.LogLevel;
import com.loganalytics.service.LogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LogController {
    
    @Autowired
    private LogService logService;
    
    @GetMapping
    public ResponseEntity<List<LogEntryDto>> getAllLogs() {
        List<LogEntryDto> logs = logService.getAllLogs();
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/paginated")
    public ResponseEntity<Page<LogEntryDto>> getLogsWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<LogEntryDto> logs = logService.getLogsWithPagination(page, size);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/level/{level}")
    public ResponseEntity<List<LogEntryDto>> getLogsByLevel(@PathVariable LogLevel level) {
        List<LogEntryDto> logs = logService.getLogsByLevel(level);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<LogEntryDto>> searchLogs(@RequestParam String query) {
        List<LogEntryDto> logs = logService.searchLogs(query);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<LogStatsDto> getLogStats() {
        LogStatsDto stats = logService.getLogStats();
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/timeseries")
    public ResponseEntity<List<TimeSeriesDataDto>> getTimeSeriesData(
            @RequestParam(defaultValue = "24") int hours) {
        List<TimeSeriesDataDto> data = logService.getTimeSeriesData(hours);
        return ResponseEntity.ok(data);
    }
    
    @PostMapping
    public ResponseEntity<LogEntryDto> createLog(@Valid @RequestBody LogEntryDto logDto) {
        LogEntryDto createdLog = logService.createLog(logDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdLog);
    }
    
    @GetMapping("/filter")
    public ResponseEntity<Page<LogEntryDto>> getLogsWithFilters(
            @RequestParam(required = false) LogLevel level,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        Page<LogEntryDto> logs = logService.getLogsWithFilters(level, source, startTime, endTime, query, page, size);
        return ResponseEntity.ok(logs);
    }
}