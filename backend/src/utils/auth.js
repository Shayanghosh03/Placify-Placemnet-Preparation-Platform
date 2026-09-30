import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const authCookieName = 'placify_token';

const authCookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  path: '/'
};

export function createToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, name: user.name },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export function setAuthCookie(res, token) {
  res.cookie(authCookieName, token, {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(authCookieName, authCookieOptions);
}
