import 'dotenv/config';

const optional = (name, fallback = '') => {
  const value = process.env[name];
  return value === undefined ? fallback : value.trim();
};

const urlValue = (name, fallback) => optional(name, fallback).replace(/\s+/g, '');

const required = (name) => {
  const value = optional(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const env = {
  port: Number(optional('PORT', '5000')),
  clientUrl: urlValue('CLIENT_URL', 'http://localhost:5173'),
  mongoUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: optional('JWT_EXPIRES_IN', '7d'),
  googleClientId: optional('GOOGLE_CLIENT_ID'),
  googleClientSecret: optional('GOOGLE_CLIENT_SECRET'),
  googleCallbackUrl: urlValue('GOOGLE_CALLBACK_URL', 'http://localhost:5000/api/auth/google/callback'),
  nodeEnv: optional('NODE_ENV', 'development')
};
