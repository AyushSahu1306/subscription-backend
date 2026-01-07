import { Request, Response } from 'express';
import { pool } from '../../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { env } from '../../config/env.js';

export const handlePaymentWebhook = async (req: Request, res: Response) => {

    const signature= req.headers['x-webhook-signature'] as string;

    if (!signature) {
        return res.status(400).json({ message: 'Missing signature' });
    }

    const rawBody = req.body as Buffer;

    const expectedSignature = crypto.createHmac('sha256', env.paymentWebhookSecret).update(rawBody).digest('hex');

    if (signature !== expectedSignature) {
        return res.status(401).json({ message: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody.toString());


    const {eventId,subscriptionId,amount,status} = event;

     if (!eventId || !subscriptionId || !amount || !status) {
        return res.status(400).json({ message: 'Invalid webhook payload' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      
      await client.query(
        `INSERT INTO webhook_events (id,provider_event_id,payload) VALUES ($1,$2,$3)`,
        [uuidv4(),eventId,event]
      );

      const subResult = await client.query(
            `
            SELECT status, trial_ends_at, ends_at
            FROM subscriptions
            WHERE id = $1
            FOR UPDATE
            `,
            [subscriptionId]
        );

        if (subResult.rowCount === 0) {
        throw new Error('Subscription not found');
        }

        const currentStatus = subResult.rows[0].status;


      await client.query(
      `INSERT INTO payments (id,subscription_id,amount_cents,status,provider_reference) VALUES ($1, $2, $3, $4, $5)`,
      [
        uuidv4(),
        subscriptionId,
        amount,
        status,
        eventId,
      ]
    );

    if (status === 'success') {
        if (currentStatus === 'trialing' || currentStatus === 'past_due') {
            await client.query(
            `
            UPDATE subscriptions
            SET status = 'active',
                ends_at = NULL
            WHERE id = $1
            `,
            [subscriptionId]
            );
        }
    }

    if (status === 'failed') {
        if (currentStatus === 'active') {
            await client.query(
            `
            UPDATE subscriptions
            SET status = 'past_due'
            WHERE id = $1
            `,
            [subscriptionId]
            );
        }

        if (currentStatus === 'trialing') {
            await client.query(
            `
            UPDATE subscriptions
            SET status = 'expired',
                ends_at = now()
            WHERE id = $1
            `,
            [subscriptionId]
            );
        }
    }


     await client.query(
      `UPDATE webhook_events SET processed_at = now() WHERE provider_event_id = $1`,
      [eventId]
    );

    await client.query('COMMIT');

    return res.status(200).json({ message: 'Webhook processed' });
    } catch (error:any) {
       await client.query('ROLLBACK');

        if (error.code === '23505') {
        return res.status(200).json({ message: 'Webhook already processed' });
        }

        console.error('Webhook processing failed', error);
        return res.status(500).json({ message: 'Webhook processing failed' }); 
    } finally {
        client.release();
    }
}