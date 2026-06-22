import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import vocabularyRoutes from './routes/vocabularyRoutes';
import progressRoutes from './routes/progressRoutes';
import astronautRoutes from './routes/astronautRoutes';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: '*', // For development. Should be restricted to frontend domain in production
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import mongoose from 'mongoose';

// Basic Health Check Route (does not require DB connection)
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'English Learning API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Middleware to check database status but not block requests since we have file-based DB fallback
const checkDbConnection = (req: Request, res: Response, next: NextFunction) => {
  next();
};

app.use('/api', checkDbConnection);

// Register API Routes
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/astronaut', astronautRoutes);

// Serve frontend static assets in production
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDistPath));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

export default app;
