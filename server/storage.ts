import { type User, type InsertUser, type LogEntry, type InsertLog, type LogStats, type TimeSeriesData, type LogLevel } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Log storage methods
  getAllLogs(): Promise<LogEntry[]>;
  getLogsByLevel(level: LogLevel): Promise<LogEntry[]>;
  getLogsByDateRange(startDate: Date, endDate: Date): Promise<LogEntry[]>;
  searchLogs(query: string): Promise<LogEntry[]>;
  getLogStats(): Promise<LogStats>;
  getTimeSeriesData(hours: number): Promise<TimeSeriesData[]>;
  addLog(log: InsertLog): Promise<LogEntry>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private logs: LogEntry[];
  private logIdCounter: number;

  constructor() {
    this.users = new Map();
    this.logs = [];
    this.logIdCounter = 1;
    
    // Initialize with some mock log data
    this.initializeMockLogs();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllLogs(): Promise<LogEntry[]> {
    return [...this.logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getLogsByLevel(level: LogLevel): Promise<LogEntry[]> {
    return this.logs.filter(log => log.level === level)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getLogsByDateRange(startDate: Date, endDate: Date): Promise<LogEntry[]> {
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async searchLogs(query: string): Promise<LogEntry[]> {
    const lowerQuery = query.toLowerCase();
    return this.logs.filter(log => 
      log.message.toLowerCase().includes(lowerQuery) ||
      log.level.toLowerCase().includes(lowerQuery)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getLogStats(): Promise<LogStats> {
    const totalLogs = this.logs.length;
    const errorCount = this.logs.filter(log => log.level === 'ERROR').length;
    const warnCount = this.logs.filter(log => log.level === 'WARN').length;
    const infoCount = this.logs.filter(log => log.level === 'INFO').length;
    const errorRate = totalLogs > 0 ? (errorCount / totalLogs) * 100 : 0;
    
    return {
      totalLogs,
      errorCount,
      warnCount,
      infoCount,
      errorRate
    };
  }

  async getTimeSeriesData(hours: number = 24): Promise<TimeSeriesData[]> {
    const now = new Date();
    const startTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));
    
    const data: TimeSeriesData[] = [];
    const hourlyBuckets = new Map<string, { error: number; warn: number; info: number; total: number }>();
    
    // Initialize buckets for each hour
    for (let i = 0; i < hours; i++) {
      const hourStart = new Date(startTime.getTime() + (i * 60 * 60 * 1000));
      const key = hourStart.toISOString().substring(0, 13); // YYYY-MM-DDTHH
      hourlyBuckets.set(key, { error: 0, warn: 0, info: 0, total: 0 });
    }
    
    // Fill buckets with actual data
    this.logs.forEach(log => {
      const logDate = new Date(log.timestamp);
      if (logDate >= startTime) {
        const hourKey = logDate.toISOString().substring(0, 13);
        const bucket = hourlyBuckets.get(hourKey);
        if (bucket) {
          bucket.total++;
          switch (log.level) {
            case 'ERROR':
              bucket.error++;
              break;
            case 'WARN':
              bucket.warn++;
              break;
            case 'INFO':
              bucket.info++;
              break;
          }
        }
      }
    });
    
    // Convert to array format
    for (const [timestamp, counts] of hourlyBuckets.entries()) {
      data.push({
        timestamp: timestamp + ':00:00.000Z',
        ...counts
      });
    }
    
    return data.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  async addLog(insertLog: InsertLog): Promise<LogEntry> {
    const log: LogEntry = {
      id: this.logIdCounter++,
      ...insertLog
    };
    this.logs.push(log);
    return log;
  }
  
  // TODO: remove mock functionality
  private initializeMockLogs() {
    const mockLogs = [
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        level: 'ERROR' as LogLevel,
        message: 'Database connection timeout after 30 seconds. Connection pool exhausted.\n\tat com.example.DatabasePool.getConnection(DatabasePool.java:145)\n\tat com.example.UserService.findUser(UserService.java:67)'
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        level: 'WARN' as LogLevel,
        message: 'High memory usage detected: 85% of heap space used. Consider increasing memory allocation.'
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        level: 'INFO' as LogLevel,
        message: 'User authentication successful for user: admin@example.com'
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        level: 'ERROR' as LogLevel,
        message: 'Failed to process payment transaction ID: txn_1234567890\nReason: Invalid credit card number\nUser ID: usr_9876543210'
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        level: 'WARN' as LogLevel,
        message: 'API rate limit approaching: 950/1000 requests in current window'
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        level: 'INFO' as LogLevel,
        message: 'System backup completed successfully. Backup size: 2.3GB, Duration: 45 minutes'
      }
    ];
    
    mockLogs.forEach((mockLog, index) => {
      this.logs.push({
        id: this.logIdCounter++,
        ...mockLog
      });
    });
  }
}

export const storage = new MemStorage();
