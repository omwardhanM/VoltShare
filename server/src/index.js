import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5055;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    project: 'VoltShare - SDG 7 P2P Clean Energy Web Platform',
    developer: 'Omwardhan Mishra (240410107094)',
    institution: 'SVIT Vasad - Computer Engineering',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[INFO] VoltShare Backend Server listening on http://localhost:${PORT}`);
  console.log(`[INFO] REST API mounted at http://localhost:${PORT}/api`);
});
