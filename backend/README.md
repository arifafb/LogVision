# Log Analytics Backend - Spring Boot

This is the Spring Boot backend for the Log Analytics Dashboard application. It provides REST APIs for log management and real-time WebSocket streaming.

## Features

- **REST API**: Complete CRUD operations for log entries
- **Real-time Streaming**: WebSocket/STOMP support for live log updates
- **Database Support**: H2 (development) and PostgreSQL (production)
- **Log Statistics**: Comprehensive analytics and time-series data
- **Search & Filtering**: Advanced log search and filtering capabilities
- **Auto Log Generation**: Built-in service to generate sample logs for demo

## Quick Start

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- (Optional) PostgreSQL for production

### Running the Application

1. **Development Mode** (with H2 in-memory database):
```bash
cd backend
mvn spring-boot:run
```

2. **Production Mode** (with PostgreSQL):
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

The application will start on `http://localhost:8080`

### API Endpoints

#### Log Management
- `GET /api/logs` - Get recent logs (latest 100)
- `GET /api/logs/paginated?page=0&size=50` - Get logs with pagination
- `GET /api/logs/level/{level}` - Get logs by level (ERROR, WARN, INFO, DEBUG, TRACE)
- `GET /api/logs/search?query=error` - Search logs by message content
- `POST /api/logs` - Create a new log entry

#### Analytics
- `GET /api/logs/stats` - Get log statistics (counts by level, error rate)
- `GET /api/logs/timeseries?hours=24` - Get time-series data for charts

#### Advanced Filtering
- `GET /api/logs/filter` - Advanced filtering with multiple parameters:
  - `level` - Filter by log level
  - `source` - Filter by source/service
  - `startTime` - Start date/time (ISO format)
  - `endTime` - End date/time (ISO format)
  - `query` - Text search in message
  - `page` & `size` - Pagination

### WebSocket Streaming

The backend provides real-time log streaming via WebSocket/STOMP:

- **Endpoint**: `ws://localhost:8080/ws-logs`
- **Topic**: `/topic/logs`
- **Protocol**: STOMP over WebSocket

### Database Configuration

#### Development (H2)
- **URL**: `jdbc:h2:mem:logdb`
- **Console**: Available at `http://localhost:8080/h2-console`
- **Username**: `sa`
- **Password**: `password`

#### Production (PostgreSQL)
Set environment variables:
```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/loganalytics
export DB_USERNAME=your_username
export DB_PASSWORD=your_password
```

### Sample Log Entry Format

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "level": "ERROR",
  "message": "Database connection failed",
  "source": "DatabaseService",
  "thread": "http-nio-8080-exec-1",
  "logger": "com.loganalytics.service.DatabaseService"
}
```

### Auto Log Generation

The application includes a `LogGeneratorService` that automatically generates sample logs every 8 seconds for demonstration purposes. This can be disabled by removing the `@Scheduled` annotation.

### Health Check

- **Endpoint**: `http://localhost:8080/actuator/health`
- **Info**: `http://localhost:8080/actuator/info`
- **Metrics**: `http://localhost:8080/actuator/metrics`

### Building for Production

```bash
cd backend
mvn clean package
java -jar target/log-analytics-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## Integration with Frontend

The Spring Boot backend is designed to work seamlessly with the React frontend. Make sure to:

1. Update the frontend's WebSocket connection URL to point to `ws://localhost:8080/ws-logs`
2. Update API base URL to `http://localhost:8080/api`
3. Ensure CORS is properly configured (already included in the backend)

## Development Notes

- The application uses JPA/Hibernate for database operations
- WebSocket configuration supports CORS for development
- Sample data is automatically loaded in development mode
- Logging is configured for both console and structured output
- The application supports both H2 (development) and PostgreSQL (production)