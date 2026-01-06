import { Request, Response } from 'express';
import { pool } from '../../config/db.js';

export const logoutAll = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    await pool.query(
        'DELETE FROM sessions WHERE user_id = $1',
        [req.user.id]
    );

    return res.status(200).json({ message: 'Logged out from all devices' });
}