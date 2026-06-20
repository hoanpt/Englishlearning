import { Request, Response } from 'express';
import Astronaut from '../models/Astronaut';

// Login / Get or Create Astronaut profile
export const getOrCreateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      res.status(400).json({ message: 'Astronaut name is required' });
      return;
    }

    const trimmedName = name.trim();
    let astronaut = await Astronaut.findOne({ name: trimmedName });

    if (!astronaut) {
      astronaut = new Astronaut({
        name: trimmedName,
        stars: 0,
        completedPlanets: [],
        badges: [],
        passedRevisions: []
      });
      await astronaut.save();
    }

    res.status(200).json(astronaut);
  } catch (error) {
    res.status(500).json({ message: 'Error getting/creating profile', error: (error as Error).message });
  }
};

// Complete a mission on a planet
export const completePlanetMission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, planetNumber, earnedStars } = req.body;
    
    if (!name || planetNumber === undefined || earnedStars === undefined) {
      res.status(400).json({ message: 'Missing name, planetNumber or earnedStars in request' });
      return;
    }

    const astronaut = await Astronaut.findOne({ name });
    if (!astronaut) {
      res.status(404).json({ message: 'Astronaut profile not found' });
      return;
    }

    // 1. Add stars
    astronaut.stars += Number(earnedStars);

    // 2. Add completed planet if not already present
    const pNum = Number(planetNumber);
    if (!astronaut.completedPlanets.includes(pNum)) {
      astronaut.completedPlanets.push(pNum);
    }

    // 3. Badge checking
    const newBadges: string[] = [];
    const currentBadges = new Set(astronaut.badges);

    // Rookie Badge: completed at least 1 planet
    if (astronaut.completedPlanets.length >= 1 && !currentBadges.has('space_rookie')) {
      astronaut.badges.push('space_rookie');
      newBadges.push('space_rookie');
    }

    // Grammar Hero: completed Unit 6 (Present Simple)
    if (astronaut.completedPlanets.includes(6) && !currentBadges.has('grammar_hero')) {
      astronaut.badges.push('grammar_hero');
      newBadges.push('grammar_hero');
    }

    // Time Traveler Badge: completed Unit 14 (Past Simple)
    if (astronaut.completedPlanets.includes(14) && !currentBadges.has('time_traveler')) {
      astronaut.badges.push('time_traveler');
      newBadges.push('time_traveler');
    }

    // Galaxy Master Badge: completed all 22 planets
    if (astronaut.completedPlanets.length >= 22 && !currentBadges.has('galaxy_master')) {
      astronaut.badges.push('galaxy_master');
      newBadges.push('galaxy_master');
    }

    await astronaut.save();

    res.status(200).json({
      status: 'success',
      astronaut,
      newBadges
    });
  } catch (error) {
    res.status(500).json({ message: 'Error completing planet mission', error: (error as Error).message });
  }
};

// Get leaderboard of top astronauts
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const leaderboard = await Astronaut.find().sort({ stars: -1 }).limit(10);
    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard', error: (error as Error).message });
  }
};

// Buy accessory
export const buyAccessory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, accessoryId, cost } = req.body;
    if (!name || !accessoryId || cost === undefined) {
      res.status(400).json({ message: 'Missing name, accessoryId or cost' });
      return;
    }

    const astronaut = await Astronaut.findOne({ name });
    if (!astronaut) {
      res.status(404).json({ message: 'Astronaut profile not found' });
      return;
    }

    if (astronaut.stars < Number(cost)) {
      res.status(400).json({ message: 'Not enough stars' });
      return;
    }

    astronaut.stars -= Number(cost);
    if (!astronaut.accessories.includes(accessoryId)) {
      astronaut.accessories.push(accessoryId);
    }

    await astronaut.save();
    res.status(200).json(astronaut);
  } catch (error) {
    res.status(500).json({ message: 'Error buying accessory', error: (error as Error).message });
  }
};

// Equip accessory
export const equipAccessory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, accessoryId } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }

    const astronaut = await Astronaut.findOne({ name });
    if (!astronaut) {
      res.status(404).json({ message: 'Astronaut profile not found' });
      return;
    }

    // Set equipped accessory (allows empty string to unequip)
    astronaut.equippedAccessory = accessoryId || '';
    await astronaut.save();
    res.status(200).json(astronaut);
  } catch (error) {
    res.status(500).json({ message: 'Error equipping accessory', error: (error as Error).message });
  }
};

// Add stars (for Creative Lab or other rewards)
export const addStars = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, stars } = req.body;
    if (!name || stars === undefined) {
      res.status(400).json({ message: 'Missing name or stars' });
      return;
    }

    const astronaut = await Astronaut.findOne({ name });
    if (!astronaut) {
      res.status(404).json({ message: 'Astronaut profile not found' });
      return;
    }

    astronaut.stars += Number(stars);
    await astronaut.save();
    res.status(200).json(astronaut);
  } catch (error) {
    res.status(500).json({ message: 'Error adding stars', error: (error as Error).message });
  }
};

// Pass a revision test
export const passRevision = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, beltId, score } = req.body;
    if (!name || beltId === undefined || score === undefined) {
      res.status(400).json({ message: 'Missing name, beltId or score' });
      return;
    }

    const astronaut = await Astronaut.findOne({ name });
    if (!astronaut) {
      res.status(404).json({ message: 'Astronaut profile not found' });
      return;
    }

    const bId = Number(beltId);
    if (!astronaut.passedRevisions) {
      astronaut.passedRevisions = [];
    }
    if (!astronaut.passedRevisions.includes(bId)) {
      astronaut.passedRevisions.push(bId);
    }

    const badgeKey = `revision_${bId}`;
    if (!astronaut.badges.includes(badgeKey)) {
      astronaut.badges.push(badgeKey);
    }

    const bonusStars = Math.round(Number(score) / 5);
    astronaut.stars += bonusStars;

    await astronaut.save();

    res.status(200).json({
      status: 'success',
      astronaut
    });
  } catch (error) {
    res.status(500).json({ message: 'Error passing revision', error: (error as Error).message });
  }
};

