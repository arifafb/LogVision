package com.loganalytics.service;

import com.loganalytics.dto.LogEntryDto;
import com.loganalytics.dto.LogStatsDto;
import com.loganalytics.dto.TimeSeriesDataDto;
import com.loganalytics.model.LogEntry;
import com.loganalytics.model.LogLevel;
import com.loganalytics.repository.LogEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LogService {
    
    @Autowired
    private LogEntryRepository logRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    public List<LogEntryDto> getAllLogs() {
        return logRepository.findTop100ByOrderByTimestampDesc()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public Page<LogEntryDto> getLogsWithPagination(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return logRepository.findAllByOrderByTimestampDesc(pageable)
                .map(this::convertToDto);
    }
    
    public List<LogEntryDto> getLogsByLevel(LogLevel level) {
        return logRepository.findByLevelOrderByTimestampDesc(level)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<LogEntryDto> searchLogs(String query) {
        return logRepository.searchByMessage(query)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public LogStatsDto getLogStats() {
        long totalLogs = logRepository.count();
        long errorCount = logRepository.countByLevel(LogLevel.ERROR);
        long warnCount = logRepository.countByLevel(LogLevel.WARN);
        long infoCount = logRepository.countByLevel(LogLevel.INFO);
        long debugCount = logRepository.countByLevel(LogLevel.DEBUG);
        long traceCount = logRepository.countByLevel(LogLevel.TRACE);
        
        return new LogStatsDto(totalLogs, errorCount, warnCount, infoCount, debugCount, traceCount);
    }
    
    public List<TimeSeriesDataDto> getTimeSeriesData(int hours) {
        LocalDateTime startTime = LocalDateTime.now().minus(hours, ChronoUnit.HOURS);
        List<Object[]> rawData = logRepository.getTimeSeriesData(startTime);
        
        // Create a map to group data by hour
        Map<LocalDateTime, Map<LogLevel, Long>> groupedData = new HashMap<>();
        
        for (Object[] row : rawData) {
            LocalDateTime hour = (LocalDateTime) row[0];
            LogLevel level = (LogLevel) row[1];
            Long count = (Long) row[2];
            
            groupedData.computeIfAbsent(hour, k -> new HashMap<>()).put(level, count);
        }
        
        // Convert to DTO format
        List<TimeSeriesDataDto> result = new ArrayList<>();
        for (Map.Entry<LocalDateTime, Map<LogLevel, Long>> entry : groupedData.entrySet()) {
            LocalDateTime timestamp = entry.getKey();
            Map<LogLevel, Long> levelCounts = entry.getValue();
            
            long error = levelCounts.getOrDefault(LogLevel.ERROR, 0L);
            long warn = levelCounts.getOrDefault(LogLevel.WARN, 0L);
            long info = levelCounts.getOrDefault(LogLevel.INFO, 0L);
            long debug = levelCounts.getOrDefault(LogLevel.DEBUG, 0L);
            long trace = levelCounts.getOrDefault(LogLevel.TRACE, 0L);
            long total = error + warn + info + debug + trace;
            
            result.add(new TimeSeriesDataDto(timestamp, error, warn, info, debug, trace, total));
        }
        
        // Sort by timestamp
        result.sort(Comparator.comparing(TimeSeriesDataDto::getTimestamp));
        return result;
    }
    
    public LogEntryDto createLog(LogEntryDto logDto) {
        LogEntry logEntry = convertToEntity(logDto);
        if (logEntry.getTimestamp() == null) {
            logEntry.setTimestamp(LocalDateTime.now());
        }
        
        LogEntry savedLog = logRepository.save(logEntry);
        LogEntryDto result = convertToDto(savedLog);
        
        // Send real-time update via WebSocket
        messagingTemplate.convertAndSend("/topic/logs", result);
        
        return result;
    }
    
    public Page<LogEntryDto> getLogsWithFilters(LogLevel level, String source, 
                                               LocalDateTime startTime, LocalDateTime endTime, 
                                               String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return logRepository.findWithFilters(level, source, startTime, endTime, query, pageable)
                .map(this::convertToDto);
    }
    
    private LogEntryDto convertToDto(LogEntry entity) {
        LogEntryDto dto = new LogEntryDto();
        dto.setId(entity.getId());
        dto.setTimestamp(entity.getTimestamp());
        dto.setLevel(entity.getLevel());
        dto.setMessage(entity.getMessage());
        dto.setSource(entity.getSource());
        dto.setThread(entity.getThread());
        dto.setLogger(entity.getLogger());
        return dto;
    }
    
    private LogEntry convertToEntity(LogEntryDto dto) {
        LogEntry entity = new LogEntry();
        entity.setId(dto.getId());
        entity.setTimestamp(dto.getTimestamp());
        entity.setLevel(dto.getLevel());
        entity.setMessage(dto.getMessage());
        entity.setSource(dto.getSource());
        entity.setThread(dto.getThread());
        entity.setLogger(dto.getLogger());
        return entity;
    }
}