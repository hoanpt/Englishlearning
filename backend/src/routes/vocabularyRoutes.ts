import { Router } from 'express';
import { getVocabularies, toggleLearned } from '../controllers/vocabularyController';

const router = Router();

router.get('/', getVocabularies);
router.post('/learned', toggleLearned);

export default router;
