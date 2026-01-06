import { Request, Response } from 'express';
import { pool } from '../../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const startTrial = async (req: Request, res: Response) => {

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user.id;
  const subscriptionId = uuidv4();

  const now = new Date();
  const trialEndsAt = new Date(
    now.getTime() + 7 * 24 * 60 * 60 * 1000
  );

  const TRIAL_PLAN_ID = '00000000-0000-0000-0000-000000000001';


  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
        `INSERT INTO subscriptions (id,user_id,plan_id,status,started_at,trial_ends_at) VALUES ($1, $2, $3,'trialing', $4, $5)`,
        [subscriptionId,userId,TRIAL_PLAN_ID,now,trialEndsAt]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Trial started',
      trialEndsAt,
    });

  } catch (error:any) {
    await client.query('ROLLBACK');

    if (error.code === '23505') {
      return res.status(409).json({
        message: 'User already has an active subscription',
      });
    }

    return res.status(500).json({ message: 'Failed to start trial' , error:error.message});
  } finally {
    client.release();
  }

}