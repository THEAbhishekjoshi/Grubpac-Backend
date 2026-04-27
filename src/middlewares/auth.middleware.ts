import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET_CODE || 'your_fallback_secret';

// Extend Express Request type to include user data
export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
        email: string;
    }
}

// 1. Middleware to verify JWT Token
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token as string, JWT_SECRET) as any
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' })
    }
}

// 2. Middleware to check if user is a Principal
export const isPrincipal = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'principal') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Principals only.' });
    }
};

// 3. Middleware to check if user is a Teacher
export const isTeacher = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'teacher') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Teachers only.' });
    }
};