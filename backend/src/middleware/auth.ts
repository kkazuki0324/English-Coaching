import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

interface JwtPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      error: 'Access token required',
      code: 'MISSING_TOKEN',
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logger.error('JWT_SECRET not configured');
    res.status(500).json({
      error: 'Server configuration error',
      code: 'JWT_SECRET_MISSING',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    logger.debug(`User authenticated: ${decoded.email}`, {
      userId: decoded.id,
    });
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    logger.error('Token verification failed:', error);
    res.status(403).json({
      error: 'Token verification failed',
      code: 'TOKEN_VERIFICATION_FAILED',
    });
  }
};

/**
 * Optional authentication middleware - allows both authenticated and guest users
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token provided, continue as guest
    next();
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logger.error('JWT_SECRET not configured');
    next(); // Continue as guest if JWT secret is not configured
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    logger.debug(`User authenticated (optional): ${decoded.email}`, {
      userId: decoded.id,
    });
  } catch (error) {
    // Invalid token, continue as guest
    logger.debug('Optional auth failed, continuing as guest:', error);
  }

  next();
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      code: 'AUTHENTICATION_REQUIRED',
    });
    return;
  }

  // TODO: Implement role checking when user roles are implemented
  // For now, allow all authenticated users
  next();
};

/**
 * Rate limiting for speech analysis endpoints
 */
export const speechAnalysisRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // TODO: Implement proper rate limiting using Redis or in-memory store
  // For now, just pass through
  next();
};
