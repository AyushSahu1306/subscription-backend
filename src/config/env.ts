import dotenv from 'dotenv';

dotenv.config();

const getEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const env = {
  port: Number(getEnv('PORT')),
  db: {
    host: getEnv('DB_HOST'),
    port: Number(getEnv('DB_PORT')),
    name: getEnv('DB_NAME'),
    user: getEnv('DB_USER'),
    password: getEnv('DB_PASSWORD'),
  },
};