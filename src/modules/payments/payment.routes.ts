import { Router } from 'express';
import { handlePaymentWebhook } from './webhook.controller.js';

const router = Router();

router.post('/webhook', handlePaymentWebhook);

export default router;
