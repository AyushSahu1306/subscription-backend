import { Request,Response } from "express";
import { pool } from '../../config/db.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';


export const refresh = async (req: Request, res: Response) => {
    const {refreshToken} = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token required' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const sessionsResult = await client.query(
            `SELECT id, user_id, refresh_token_hash, expires_at
            FROM sessions
            WHERE expires_at > now()`
        );
        let matchedSession = null;

        for(const session of sessionsResult.rows){
            const match = await bcrypt.compare(
                refreshToken,
                session.refresh_token_hash
            );

            if(match){
                matchedSession = session;
                break;
            }
        }

        if(!matchedSession){
            await client.query('ROLLBACK');
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const newRefreshToken =  uuidv4();
        const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

        await client.query(
            `UPDATE sessions
            SET refresh_token_hash = $1
            WHERE id = $2`,
            [newRefreshTokenHash, matchedSession.id]
        );

        await client.query('COMMIT');

        const accessToken = jwt.sign(
            { userId: matchedSession.user_id },
            env.jwtSecret,
            { expiresIn: '15m' }
        );

        return res.status(200).json({
            accessToken,
            refreshToken: newRefreshToken,
        });


    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(500).json({ message: 'Refresh failed' });
    } finally {
        client.release();
    }
}

