import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './middlewares/error.middleware';
import loggerMiddleware from './middlewares/logger.middleware';
import config from './config';
import { adminRoutes, authRoutes } from './domains';

export const startApp = () => {
  const app = express();

  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(loggerMiddleware);

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);

  app.use('/status', (req, res) => {
    res.status(200).json({ running: true });
  });

  app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
  });

  // Error handling middleware
  app.use(errorHandler);

  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
};
