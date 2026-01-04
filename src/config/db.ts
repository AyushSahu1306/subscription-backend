import { Pool } from "pg";  
import {env} from "./env.js"

export const pool = new Pool({
    host:env.db.host,
    port:env.db.port,
    database: env.db.name,
    user: env.db.user,
    password: env.db.password,

    max:10,
    idleTimeoutMillis:30_000,
    connectionTimeoutMillis:5_000,
});

export const connectDb = async():Promise<void> => {
    try {
        await pool.query('SELECT 1');
        console.log('PostgreSQL connected');
    } catch (error) {
        console.error('Failed to connect to PostgreSQL', error);
        process.exit(1);
    }
}