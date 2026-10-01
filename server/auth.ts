import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db, User } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'talentpulse_enterprise_super_secret_jwt_key_2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'HR' | 'INTERVIEWER' | 'CANDIDATE';
  fullName: string;
  departmentId?: string;
  iat: number;
  exp: number;
}

// Generate signed token
export function generateToken(user: User): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    departmentId: user.departmentId,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Verify token
export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload: TokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}

// Express Auth Request Interface
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// Authentication middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  // Check if user is still active in database
  const user = db.users.find(u => u.id === decoded.userId);
  if (user && user.status === 'INACTIVE') {
    return res.status(403).json({ error: 'User account has been deactivated by administrator.' });
  }

  req.user = decoded;
  next();
}

// Optional Auth (for public listings where logged in status enhances view)
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
}

// Role restriction middleware
export function requireRoles(roles: Array<'ADMIN' | 'HR' | 'INTERVIEWER' | 'CANDIDATE'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden. Required one of roles: [${roles.join(', ')}]. Current role: ${req.user.role}`,
      });
    }
    next();
  };
}
