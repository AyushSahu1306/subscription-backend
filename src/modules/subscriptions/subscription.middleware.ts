import { Request, Response, NextFunction } from 'express';
import { pool } from '../../config/db.js';

export const requireActiveSubscription = async (req: Request,res: Response,next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }



    try {
        const result = await pool.query(
            `SELECT status,trial_ends_at,ends_at FROM subscriptions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1`,
            [req.user.id]
        );
    
        if (result.rowCount === 0) {
            return res.status(403).json({ message: 'No subscription found' });
        }
    
        const sub = result.rows[0];
        const now = new Date();
    
        const isTrialValid = sub.status === 'trialing' && sub.trial_ends_at && new Date(sub.trial_ends_at) > now;
    
        const isActiveValid = sub.status === 'active' && (!sub.ends_at || new Date(sub.ends_at) > now);
    
        const isPastDueValid = sub.status === 'past_due' && sub.ends_at && new Date(sub.ends_at) > now;
    
        if (!isTrialValid && !isActiveValid && !isPastDueValid) {
            return res.status(403).json({ message: 'Subscription inactive' });
        }
    
        next();
    } catch (error:any) {
        res.status(500).json({error:error.message})
    }
}