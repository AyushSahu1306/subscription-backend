import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { startTrial } from './startTrial.controller.js';

const router = Router();

router.post('/start-trial', requireAuth, startTrial);

export default router;