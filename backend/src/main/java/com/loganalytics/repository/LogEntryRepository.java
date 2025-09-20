package com.loganalytics.repository;

import com.loganalytics.model.LogEntry;
import com.loganalytics.model.LogLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogEntryRepository extends JpaRepository<LogEntry, Long> {
    
    // Find logs by level
    List<LogEntry> findByLevelOrderByTimestampDesc(LogLevel level);
    
    // Find logs by date range
    List<LogEntry> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);
    
    // Search logs by message content
    @Query("SELECT l FROM LogEntry l WHERE LOWER(l.message) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY l.timestamp DESC")
    List<LogEntry> searchByMessage(@Param("query") String query);
    
    // Get recent logs with pagination
    Page<LogEntry> findAllByOrderByTimestampDesc(Pageable pageable);
    
    // Count logs by level
    long countByLevel(LogLevel level);
    
    // Count logs in date range
    long countByTimestampBetween(LocalDateTime start, LocalDateTime end);
    
    // Get logs for time series data (grouped by hour)
    @Query("SELECT FUNCTION('DATE_TRUNC', 'hour', l.timestamp) as hour, " +
           "l.level, COUNT(l) as count " +
           "FROM LogEntry l " +
           "WHERE l.timestamp >= :startTime " +
           "GROUP BY FUNCTION('DATE_TRUNC', 'hour', l.timestamp), l.level " +
           "ORDER BY hour")
    List<Object[]> getTimeSeriesData(@Param("startTime") LocalDateTime startTime);
    
    // Get latest logs for streaming
    List<LogEntry> findTop100ByOrderByTimestampDesc();
    
    // Find logs by multiple levels
    List<LogEntry> findByLevelInOrderByTimestampDesc(List<LogLevel> levels);
    
    // Get logs by source
    List<LogEntry> findBySourceOrderByTimestampDesc(String source);
    
    // Advanced search with multiple criteria
    @Query("SELECT l FROM LogEntry l WHERE " +
           "(:level IS NULL OR l.level = :level) AND " +
           "(:source IS NULL OR l.source = :source) AND " +
           "(:startTime IS NULL OR l.timestamp >= :startTime) AND " +
           "(:endTime IS NULL OR l.timestamp <= :endTime) AND " +
           "(:query IS NULL OR LOWER(l.message) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY l.timestamp DESC")
    Page<LogEntry> findWithFilters(
        @Param("level") LogLevel level,
        @Param("source") String source,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        @Param("query") String query,
        Pageable pageable
    );
}