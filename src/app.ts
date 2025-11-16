import express, { Application } from 'express';
import cors from 'cors';
import { env } from './utils/env';
import { errorMiddleware } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import pagesRoutes from './routes/pages.routes';
import blocksRoutes from './routes/blocks.routes';
import badgesRoutes from './routes/badges.routes';
import uploadRoutes from './routes/upload.routes';
import premiumRoutes from './routes/premium.routes';
import publicRoutes from './routes/public.routes';
import oauthDiscordRoutes from './routes/oauth-discord.routes';
import oauthSpotifyRoutes from './routes/oauth-spotify.routes';

export function createApp(): Application {
  const app = express();

  const allowedOrigins = env.FRONTEND_URL.split(',').map(url => url.trim());

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Não permitido pelo CORS'));
      }
    },
    credentials: true,
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static('public/uploads'));

  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/pages', pagesRoutes);
  app.use('/api/blocks', blocksRoutes);
  app.use('/api/badges', badgesRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/premium', premiumRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/oauth/discord', oauthDiscordRoutes);
  app.use('/api/oauth/spotify', oauthSpotifyRoutes);

  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Rota não encontrada',
    });
  });

  app.use(errorMiddleware);

  return app;
}
