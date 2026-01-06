import { pool } from '../config/db.js';

export const expireSubscriptions = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE subscriptions SET status = 'expired' WHERE status = 'trialing' AND trial_ends_at < now()`
    );

    await client.query(
      `UPDATE subscriptions SET status = 'expired' WHERE status IN ('active', 'past_due') AND ends_at IS NOT NULL AND ends_at < now()`
    );

    await client.query('COMMIT');
    console.log('Subscription expiration job completed');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Subscription expiration job failed', error);
  } finally {
    client.release();
  }
};
