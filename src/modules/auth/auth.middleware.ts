import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';


interface JwtPayload {
  userId: string;
}

export const requireAuth = (req:Request,res:Response,next:NextFunction) => {

    const authHeader = req.headers.authorization;

    if(!authHeader){
         return res.status(401).json({ message: 'Authorization header missing' });
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Invalid authorization format' });
    }

    try {
        const decoded = jwt.verify(token,env.jwtSecret) as JwtPayload;

        req.user = {id:decoded.userId};
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

}