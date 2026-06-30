import { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiter for OTP requests
// In production, use Redis or a proper rate-limiting library
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const otpRateLimitMap = new Map<string, RateLimitEntry>();

const MAX_OTP_REQUESTS = 3;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

export const otpRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const email = req.body.email;
  
  if (!email) {
    return next();
  }

  const now = Date.now();
  const entry = otpRateLimitMap.get(email);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    otpRateLimitMap.set(email, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return next();
  }

  if (entry.count >= MAX_OTP_REQUESTS) {
    const remainingTime = Math.ceil((entry.resetTime - now) / 1000);
    return res.status(429).json({
      success: false,
      message: `Too many OTP requests. Please try again in ${remainingTime} seconds.`,
      retryAfter: remainingTime,
    });
  }

  // Increment count
  entry.count++;
  otpRateLimitMap.set(email, entry);
  next();
};

// Cleanup expired entries periodically (call this from a cron job or similar)
export const cleanupExpiredRateLimits = () => {
  const now = Date.now();
  for (const [key, entry] of otpRateLimitMap.entries()) {
    if (now > entry.resetTime) {
      otpRateLimitMap.delete(key);
    }
  }
};
