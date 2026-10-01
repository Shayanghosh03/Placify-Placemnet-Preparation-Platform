import { Router } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import { requireAuth } from '../middleware/auth.js';
import { clearAuthCookie, createToken, setAuthCookie } from '../utils/auth.js';
import { env } from '../config/env.js';

const router = Router();

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl || '',
  provider: user.provider || 'local',
  headline: user.headline || 'Student account',
  bio: user.bio || '',
  college: user.college || '',
  phone: user.phone || '',
  targetRole: user.targetRole || 'Software Development Engineer',
  graduationYear: user.graduationYear || '',
  createdAt: user.createdAt
});

router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (name.length < 2 || email.length < 5 || password.length < 8) {
      return res.status(400).json({ message: 'Name, valid email, and an 8-character password are required' });
    }

    const existingUser = await User.findOne({ email }).select('+passwordHash +googleId');
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, provider: 'local' });
    setAuthCookie(res, createToken(user));
    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const user = await User.findOne({ email }).select('+passwordHash');
    const passwordMatches = user?.passwordHash
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    setAuthCookie(res, createToken(user));
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.get('/google', (req, res, next) => {
  if (!env.googleClientId || !env.googleClientSecret) {
    return res.status(503).json({ message: 'Google OAuth is not configured' });
  }
  return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    if (!env.googleClientId || !env.googleClientSecret) {
      return res.redirect(`${env.clientUrl}/?oauth_error=google_not_configured`);
    }
    return passport.authenticate('google', {
      failureRedirect: `${env.clientUrl}/?oauth_error=google_auth_failed`,
      session: false
    })(req, res, next);
  },
  (req, res) => {
    setAuthCookie(res, createToken(req.user));
    res.redirect(`${env.clientUrl}/?authenticated=1`);
  }
);

router.get('/google/failure', (_req, res) => {
  res.redirect(`${env.clientUrl}/?oauth_error=google_auth_failed`);
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const { name, avatarUrl, headline, bio, college, phone, targetRole, graduationYear } = req.body;

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (trimmedName.length < 2) {
        return res.status(400).json({ message: 'Name must be at least 2 characters long' });
      }
      req.user.name = trimmedName;
    }

    if (avatarUrl !== undefined) req.user.avatarUrl = String(avatarUrl).trim();
    if (headline !== undefined) req.user.headline = String(headline).trim();
    if (bio !== undefined) req.user.bio = String(bio).trim();
    if (college !== undefined) req.user.college = String(college).trim();
    if (phone !== undefined) req.user.phone = String(phone).trim();
    if (targetRole !== undefined) req.user.targetRole = String(targetRole).trim();
    if (graduationYear !== undefined) req.user.graduationYear = String(graduationYear).trim();

    await req.user.save();
    return res.json({ user: publicUser(req.user), message: 'Profile updated successfully' });
  } catch (error) {
    return next(error);
  }
});

router.delete('/account', requireAuth, async (req, res, next) => {
  try {
    await Progress.deleteOne({ user: req.user._id });
    await req.user.deleteOne();
    clearAuthCookie(res);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.status(204).send();
});

export default router;
