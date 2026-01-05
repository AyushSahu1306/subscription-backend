import { Request, Response } from "express";
import { pool } from "../../config/db.js";
import bcrypt from "bcrypt";
import {v4 as uuidv4} from "uuid";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export const login = async(req:Request,res:Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    const userResult = await pool.query(
        `SELECT id, password_hash FROM users WHERE email = $1`,
        [email]
    );

    if(userResult.rowCount === 0){
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    const passwordValid = await bcrypt.compare(password, user.password_hash);

     if (!passwordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const sessionId = uuidv4();
    const refreshToken = uuidv4();
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
        `INSERT INTO sessions (id, user_id, refresh_token_hash, expires_at)
        VALUES ($1, $2, $3, $4)`,
        [sessionId, user.id, refreshTokenHash, sessionExpiry]
    );

    const accessToken = jwt.sign(
        { userId: user.id },
        env.jwtSecret,
        { expiresIn: '15m' }
    );

    return res.status(200).json({
        accessToken,
        refreshToken,
    });
}