import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authCookieName } from '../utils/auth.js';
import { env } from '../config/env.js';

export async function requireAuth(req, res, next) {
  const token = req.cookies[authCookieName];
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists' });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token' });
  }
}
