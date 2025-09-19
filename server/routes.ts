import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketServer } from "socket.io";
import { storage } from "./storage";
import { insertLogSchema, type LogLevel } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Log analytics API routes
  app.get("/api/logs", async (req, res) => {
    try {
      const logs = await storage.getAllLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  app.get("/api/logs/stats", async (req, res) => {
    try {
      const stats = await storage.getLogStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch log stats" });
    }
  });

  app.get("/api/logs/timeseries", async (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const data = await storage.getTimeSeriesData(hours);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch time series data" });
    }
  });

  app.get("/api/logs/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }
      const logs = await storage.searchLogs(query);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to search logs" });
    }
  });

  app.get("/api/logs/level/:level", async (req, res) => {
    try {
      const level = req.params.level as LogLevel;
      const logs = await storage.getLogsByLevel(level);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs by level" });
    }
  });

  app.post("/api/logs", async (req, res) => {
    try {
      const validation = insertLogSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }
      const log = await storage.addLog(validation.data);
      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to create log" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket for real-time log streaming
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected for log streaming');
    
    socket.on('disconnect', () => {
      console.log('Client disconnected from log streaming');
    });
  });

  // Store io instance for use in other parts of the application
  (httpServer as any).io = io;

  return httpServer;
}
