import { Router } from 'express';
import { submitProgress, getProgressHistory } from '../controllers/progressController';

const router = Router();

router.post('/submit', submitProgress);
router.get('/history', getProgressHistory);

export default router;
