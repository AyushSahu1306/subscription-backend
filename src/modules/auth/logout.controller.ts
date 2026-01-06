import { Request, Response } from 'express';
import { pool } from '../../config/db.js';
import bcrypt from 'bcrypt';

export const logout = async (req: Request, res: Response) => {
    const {refreshToken} = req.body;

     if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token required' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const sessionsResult = await client.query(
            'SELECT id,refresh_token_hash FROM sessions' 
        );

        let sessionIdToDelete:string|null = null;

        for(const session of sessionsResult.rows){
            const match = await bcrypt.compare(refreshToken,session.refresh_token_hash);
            if(match){
                sessionIdToDelete = session.id;
                break;
            }
        }

        if(!sessionIdToDelete){
            await client.query('ROLLBACK');
            return res.status(200).json({ message: 'Already logged out' });
        }

        await client.query(
            `DELETE FROM sessions WHERE id = $1`,
            [sessionIdToDelete]
        );

        await client.query('COMMIT');

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(500).json({ message: 'Logout failed' });
    } finally{
        client.release();
    }
}