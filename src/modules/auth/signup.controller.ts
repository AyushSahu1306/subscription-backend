import { Request,Response } from "express"
import {v4 as uuidv4} from 'uuid';
import bcrypt from "bcrypt";
import { pool } from "../../config/db.js";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export const signup = async(req:Request,res:Response) => {
    const {email,password} = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }


    const userId = uuidv4();
    const sessionId = uuidv4();

    const passwordHash = await bcrypt.hash(password,10);

    const refreshToken = uuidv4();

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
            'INSERT INTO users (id,email,password_hash) VALUES ($1,$2,$3)',
            [userId,email,passwordHash]
        );

        await client.query(
            `INSERT INTO sessions (id, user_id, refresh_token_hash, expires_at)
            VALUES ($1, $2, $3, $4)`,
            [sessionId, userId, refreshTokenHash, sessionExpiry]
        );

        await client.query('COMMIT');
    } catch (error:any) {
        await client.query('ROLLBACK');

        if(error.code === '23505'){
            return res.status(409).json({message:"Email already exists"});
        }
        return res.status(500).json({ message: 'Signup failed' });
    } finally {
        client.release();
    }   

    const accessToken = jwt.sign(
        {userId},
        env.jwtSecret,
        {expiresIn:'15m'}
    );

    return res.status(201).json({
        accessToken,
        refreshToken
    });
}


