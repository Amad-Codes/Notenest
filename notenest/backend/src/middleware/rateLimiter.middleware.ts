import rateLimit from "express-rate-limit";

/**
 * Generic limiter applied to the whole API: generous enough not to bother
 * real users, tight enough to blunt scripted abuse.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

/**
 * Tighter limiter specifically for login/register endpoints, to slow down
 * brute-force password guessing and account enumeration.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts, please try again in a few minutes.",
  },
});

/**
 * Limiter for the AI Assistant endpoint. Tighter than the general limiter
 * since each request may call a paid external provider once configured.
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many AI requests, please slow down." },
});
