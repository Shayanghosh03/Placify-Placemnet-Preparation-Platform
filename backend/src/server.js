import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from './models/User.js';
import './models/Progress.js';
import './models/Content.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import authRoutes from './routes/auth.js';
import progressRoutes from './routes/progress.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(passport.initialize());
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRoutes);
app.use('/api/progress', progressRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

if (env.googleClientId && env.googleClientSecret) {
  passport.use(new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: env.googleCallbackUrl
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(new Error('Google account did not provide an email'));

        let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });
        const googlePhoto = profile.photos?.[0]?.value || '';
        const googleName = profile.displayName || profile.name?.givenName || 'Placify Learner';

        if (!user) {
          user = await User.create({
            name: googleName,
            email,
            googleId: profile.id,
            avatarUrl: googlePhoto,
            provider: 'google',
            headline: 'Student account'
          });
        } else {
          let updated = false;
          if (!user.googleId) {
            user.googleId = profile.id;
            updated = true;
          }
          if (googlePhoto && (!user.avatarUrl || user.provider === 'google' || user.avatarUrl.includes('googleusercontent.com'))) {
            user.avatarUrl = googlePhoto;
            updated = true;
          }
          if (googleName && (!user.name || user.name === 'Placify learner' || user.name === 'Placify Learner')) {
            user.name = googleName;
            updated = true;
          }
          if (updated) {
            await user.save();
          }
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));
}

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

connectDatabase()
  .then(() => app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port}`)))
  .catch((error) => {
    console.error('Unable to start API:', error);
    process.exit(1);
  });
