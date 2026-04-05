const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response');

/**
 * Global rate limiter for general API routes
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Too many requests from this IP, please try again after 15 minutes', 429);
  },
});

/**
 * Stricter rate limiter for authentication routes (login/register)
 * Protects against brute-force attacks
 */
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per hour for registration/login
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Too many authentication attempts, please try again in an hour', 429);
  },
});

module.exports = {
  globalLimiter,
  authLimiter,
};
