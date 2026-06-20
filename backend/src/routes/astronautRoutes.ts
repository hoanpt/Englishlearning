import { Router } from 'express';
import { getOrCreateProfile, completePlanetMission, getLeaderboard, buyAccessory, equipAccessory, addStars, passRevision } from '../controllers/astronautController';

const router = Router();

router.post('/profile', getOrCreateProfile);
router.post('/complete-mission', completePlanetMission);
router.post('/pass-revision', passRevision);
router.get('/leaderboard', getLeaderboard);
router.post('/buy-accessory', buyAccessory);
router.post('/equip-accessory', equipAccessory);
router.post('/add-stars', addStars);

export default router;
