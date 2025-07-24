import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { healthRouter } from './routes/health';
import { exampleRouter } from './routes/example';
// Temporarily disabled for smoke test:
// import { workflowRouter } from './routes/workflow';
// import { agentsRouter } from './routes/agents';
// import { tasksRouter } from './routes/tasks';
// import { portfolioRouter } from './routes/portfolio';
// import { websocketTestRouter } from './routes/websocket-test';
// import { initializeWebSocketService } from './services/websocket';

// Load environment variables
dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRouter);
app.use('/api/example', exampleRouter);
// Temporarily disabled for smoke test:
// app.use('/api/workflow', workflowRouter);
// app.use('/api/agents', agentsRouter);
// app.use('/api/tasks', tasksRouter);
// app.use('/api/portfolio', portfolioRouter);
// app.use('/api/ws-test', websocketTestRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Portfolio Tracker Backend API',
    version: '1.0.0',
    status: 'running',
  });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Something went wrong!',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'Internal server error',
    });
  }
);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Create HTTP server and initialize WebSocket
const server = createServer(app);

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
  
  // Initialize WebSocket service
  // initializeWebSocketService(server); // Temporarily disabled for smoke test
  console.log(`🔌 WebSocket server temporarily disabled for smoke test`);
}

export default app;
