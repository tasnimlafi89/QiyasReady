import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';
import User from '../models/User.js';

// Base Clerk middleware
export const clerkAuth = clerkMiddleware();

// Require authentication and attach user to request
export const requireAuthentication = [
  clerkMiddleware(),
  async (req, res, next) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Find user in our database
      const user = await User.findOne({ clerkId: userId });
      if (user) {
        req.dbUser = user;
        // Update last active
        user.lastActiveAt = new Date();
        await user.save();
      }
      req.clerkUserId = userId;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ error: 'Authentication failed' });
    }
  },
];

// Require specific role
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (!roles.includes(req.dbUser.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Require premium subscription
export const requirePremium = (req, res, next) => {
  if (!req.dbUser) {
    return res.status(401).json({ error: 'User not found' });
  }
  if (req.dbUser.subscription.plan === 'free') {
    return res.status(403).json({ 
      error: 'Premium subscription required',
      code: 'UPGRADE_REQUIRED',
    });
  }
  next();
};

// Optional auth - doesn't fail if not authenticated
export const optionalAuth = [
  clerkMiddleware(),
  async (req, res, next) => {
    try {
      const { userId } = getAuth(req);
      if (userId) {
        const user = await User.findOne({ clerkId: userId });
        if (user) {
          req.dbUser = user;
          req.clerkUserId = userId;
        }
      }
    } catch (e) {
      // Silently continue
    }
    next();
  },
];
