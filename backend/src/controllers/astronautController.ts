import { Request, Response } from 'express';
import { getAstronaut, saveAstronaut, getLeaderboard as getLeaderboardDb } from '../utils/dbHelper';

// Helper to get today's date in local YYYY-MM-DD
const getLocalDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

// Helper to get yesterday's date in local YYYY-MM-DD
const getYesterdayDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

// Register Profile
export const registerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, password, displayName, birthYear, parentEmail, parentPhone, avatar } = req.body;
    if (!name || name.trim() === '') {
      res.status(400).json({ message: 'Tên đăng nhập không được để trống' });
      return;
    }

    const trimmedName = name.trim();
    const existing = await getAstronaut(trimmedName);
    if (existing) {
      res.status(400).json({ message: 'Tên đăng nhập đã tồn tại, vui lòng chọn tên khác' });
      return;
    }

    const newAstronaut = await saveAstronaut({
      name: trimmedName,
      password: password || '',
      displayName: displayName || trimmedName,
      birthYear: Number(birthYear) || 2018,
      parentEmail: parentEmail || '',
      parentPhone: parentPhone || '',
      avatar: avatar || '🚀',
      stars: 0,
      completedPlanets: [],
      completedPreStarter: [],
      completedPET: [],
      badges: [],
      accessories: [],
      equippedAccessory: '',
      passedRevisions: [],
      lastCheckIn: '',
      checkInStreak: 0,
      checkInHistory: [],
      lastGreetingDate: '',
      dailyInteractions: []
    });

    res.status(201).json(newAstronaut);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đăng ký tài khoản', error: (error as Error).message });
  }
};

// Login / Get or Create Profile (Upgraded with password check)
export const getOrCreateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, password } = req.body;
    if (!name || name.trim() === '') {
      res.status(400).json({ message: 'Astronaut name is required' });
      return;
    }

    const trimmedName = name.trim();
    let astronaut = await getAstronaut(trimmedName);

    // If profile doesn't exist, create passwordless default one (for backward compatibility)
    if (!astronaut) {
      astronaut = await saveAstronaut({
        name: trimmedName,
        password: '',
        displayName: trimmedName,
        birthYear: 2018,
        parentEmail: '',
        parentPhone: '',
        avatar: '🚀',
        stars: 0,
        completedPlanets: [],
        completedPreStarter: [],
        completedPET: [],
        badges: [],
        accessories: [],
        equippedAccessory: '',
        passedRevisions: [],
        lastCheckIn: '',
        checkInStreak: 0,
        checkInHistory: [],
        lastGreetingDate: '',
        dailyInteractions: []
      });
      res.status(200).json(astronaut);
      return;
    }

    // PIN check if astronaut has a PIN password set
    if (astronaut.password && astronaut.password.trim() !== '') {
      if (password === undefined) {
        // Prompt frontend to request PIN
        res.status(200).json({ status: 'need_password', name: astronaut.name });
        return;
      }
      if (astronaut.password !== password) {
        res.status(401).json({ message: 'Mã PIN không chính xác, bé thử lại nhé!' });
        return;
      }
    }

    res.status(200).json(astronaut);
  } catch (error) {
    res.status(500).json({ message: 'Error getting/creating profile', error: (error as Error).message });
  }
};

// Check-in API
export const checkIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }

    const astronaut = await getAstronaut(name);
    if (!astronaut) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    const today = getLocalDateString();
    const yesterday = getYesterdayDateString();

    if (astronaut.lastCheckIn === today) {
      res.status(200).json({ status: 'already_checked_in', astronaut });
      return;
    }

    let streak = astronaut.checkInStreak || 0;
    if (astronaut.lastCheckIn === yesterday) {
      streak = (streak % 7) + 1;
    } else {
      streak = 1;
    }

    // Determine rewards
    const rewards = [5, 10, 15, 20, 25, 30, 50]; // Day 1 to 7
    const earnedStars = rewards[streak - 1] || 5;

    astronaut.stars = (astronaut.stars || 0) + earnedStars;
    astronaut.lastCheckIn = today;
    astronaut.checkInStreak = streak;
    if (!astronaut.checkInHistory) astronaut.checkInHistory = [];
    if (!astronaut.checkInHistory.includes(today)) {
      astronaut.checkInHistory.push(today);
    }

    // Streak badge check
    if (streak === 7 && !astronaut.badges.includes('streak_master')) {
      astronaut.badges.push('streak_master');
    }

    const updated = await saveAstronaut(astronaut);

    res.status(200).json({
      status: 'success',
      astronaut: updated,
      streak,
      earnedStars
    });
  } catch (error) {
    res.status(500).json({ message: 'Error performing check-in', error: (error as Error).message });
  }
};

// Daily Mood greeting API
export const submitMood = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, mood } = req.body;
    if (!name || !mood) {
      res.status(400).json({ message: 'Missing name or mood' });
      return;
    }

    const astronaut = await getAstronaut(name);
    if (!astronaut) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    const today = getLocalDateString();
    if (astronaut.lastGreetingDate === today) {
      res.status(200).json({ status: 'already_greeted', astronaut });
      return;
    }

    let message = '';
    switch (mood.toLowerCase()) {
      case 'happy':
      case 'excited':
        message = 'Tuyệt cú mèo! Hãy mang niềm vui này vào các bài học tiếng Anh thú vị hôm nay nhé! Thầy/Cô tặng con +5 Sao Sáng!';
        break;
      case 'studious':
        message = 'Tinh thần học tập của con thật tuyệt vời! Chắc chắn hôm nay con sẽ đạt điểm tối đa. Nhận ngay +5 Sao Sáng nhé!';
        break;
      case 'tired':
        message = 'Học tập là một hành trình dài, nếu mệt con hãy nghỉ ngơi một chút rồi học nhé. Thầy/Cô tặng con +5 Sao Sáng để nạp thêm năng lượng!';
        break;
      case 'sad':
        message = 'Đừng buồn nhé bé yêu, học tiếng Anh cùng Mascot sẽ giúp con vui vẻ hơn. Tặng con +5 Sao Sáng ôm động viên nào!';
        break;
      default:
        message = 'Chào mừng con quay lại học tiếng Anh! Mascot gửi tặng con +5 Sao Sáng nhé!';
        break;
    }

    astronaut.stars = (astronaut.stars || 0) + 5;
    astronaut.lastGreetingDate = today;
    if (!astronaut.dailyInteractions) astronaut.dailyInteractions = [];
    astronaut.dailyInteractions.push({
      date: today,
      mood,
      message
    });

    const updated = await saveAstronaut(astronaut);

    res.status(200).json({
      status: 'success',
      astronaut: updated,
      message
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting mood greeting', error: (error as Error).message });
  }
};

// Update Profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, displayName, birthYear, parentEmail, parentPhone, avatar } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }

    const astronaut = await getAstronaut(name);
    if (!astronaut) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    if (displayName !== undefined) astronaut.displayName = displayName;
    if (birthYear !== undefined) astronaut.birthYear = Number(birthYear);
    if (parentEmail !== undefined) astronaut.parentEmail = parentEmail;
    if (parentPhone !== undefined) astronaut.parentPhone = parentPhone;
    if (avatar !== undefined) astronaut.avatar = avatar;

    const updated = await saveAstronaut(astronaut);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: (error as Error).message });
  }
};

// Complete a mission on a planet
export const completePlanetMission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, planetNumber, earnedStars, system } = req.body;
    
    if (!name || planetNumber === undefined || earnedStars === undefined) {
      res.status(400).json({ message: 'Missing name, planetNumber or earnedStars in request' });
      return;
    }

    const astronaut = await getAstronaut(name);
    if (!astronaut) {
      res.status(404).json({ message: 'Astronaut profile not found' });
      return;
    }

    // 1. Add stars
    astronaut.stars = (astronaut.stars || 0) + Number(earnedStars);

    // 2. Add completed unit based on system
    const pNum = Number(planetNumber);
    if (system === 'prestarter') {
      if (!astronaut.completedPreStarter) astronaut.completedPreStarter = [];
      if (!astronaut.completedPreStarter.includes(pNum)) {
        astronaut.completedPreStarter.push(pNum);
      }
    } else if (system === 'pet') {
      if (!astronaut.completedPET) astronaut.completedPET = [];
      if (!astronaut.completedPET.includes(pNum)) {
        astronaut.completedPET.push(pNum);
      }
    } else {
      // Default: roundup/mover
      if (!astronaut.completedPlanets) astronaut.completedPlanets = [];
      if (!astronaut.completedPlanets.includes(pNum)) {
        astronaut.completedPlanets.push(pNum);
      }
    }

    // 3. Badge checking
    const newBadges: string[] = [];
    const currentBadges = new Set(astronaut.badges || []);

    const totalRoundup = astronaut.completedPlanets ? astronaut.completedPlanets.length : 0;
    const totalPreStarter = astronaut.completedPreStarter ? astronaut.completedPreStarter.length : 0;
    const totalPET = astronaut.completedPET ? astronaut.completedPET.length : 0;

    // Rookie Badge: completed at least 1 unit across any system
    if ((totalRoundup >= 1 || totalPreStarter >= 1 || totalPET >= 1) && !currentBadges.has('space_rookie')) {
      if (!astronaut.badges) astronaut.badges = [];
      astronaut.badges.push('space_rookie');
      newBadges.push('space_rookie');
    }

    // Grammar Hero: completed Unit 6 (Present Simple) of Mover
    if (astronaut.completedPlanets && astronaut.completedPlanets.includes(6) && !currentBadges.has('grammar_hero')) {
      if (!astronaut.badges) astronaut.badges = [];
      astronaut.badges.push('grammar_hero');
      newBadges.push('grammar_hero');
    }

    // Time Traveler Badge: completed Unit 14 (Past Simple) of Mover
    if (astronaut.completedPlanets && astronaut.completedPlanets.includes(14) && !currentBadges.has('time_traveler')) {
      if (!astronaut.badges) astronaut.badges = [];
      astronaut.badges.push('time_traveler');
      newBadges.push('time_traveler');
    }

    // Galaxy Master Badge: completed all 22 planets of Mover
    if (totalRoundup >= 22 && !currentBadges.has('galaxy_master')) {
      if (!astronaut.badges) astronaut.badges = [];
      astronaut.badges.push('galaxy_master');
      newBadges.push('galaxy_master');
    }

    const updated = await saveAstronaut(astronaut);

    res.status(200).json({
      status: 'success',
      astronaut: updated,
      newBadges
    });
  } catch (error) {
    res.status(500).json({ message: 'Error completing planet mission', error: (error as Error).message });
  }
};

// Get leaderboard of top astronauts
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const leaderboard = await getLeaderboardDb(10);
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

    const astronaut = await getAstronaut(name);
    if (!astronaut) {
      res.status(404).json({ message: 'Astronaut profile not found' });
      return;
    }

    if (astronaut.stars < Number(cost)) {
      res.status(400).json({ message: 'Not enough stars' });
      return;
    }

    astronaut.stars -= Number(cost);
    if (!astronaut.accessories) astronaut.accessories = [];
    if (!astronaut.accessories.includes(accessoryId)) {
      astronaut.accessories.push(accessoryId);
    }

    const updated = await saveAstronaut(astronaut);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error buying accessory', error: (error as Error).message });
  }
};

// Equip accessory
export const equipAccessory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, accessoryId, equippedAccessories } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }

    const astronaut = await getAstronaut(name);
    if (!astronaut) {
      res.status(404).json({ message: 'Astronaut profile not found' });
      return;
    }

    // Set equipped accessory (allows empty string to unequip - backward compatibility)
    if (accessoryId !== undefined) {
      astronaut.equippedAccessory = accessoryId || '';
    }

    // Set equipped accessories (multi-slot)
    if (equippedAccessories !== undefined) {
      astronaut.equippedAccessories = equippedAccessories;
    }
    
    const updated = await saveAstronaut(astronaut);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error equipping accessory', error: (error as Error).message });
  }
};

// Unlock Units manually (by parent)
export const unlockUnits = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, system, unitIds } = req.body;
    if (!name || !system || !Array.isArray(unitIds)) {
      res.status(400).json({ message: 'Missing name, system or unitIds in request' });
      return;
    }

    const astronaut = await getAstronaut(name);
    if (!astronaut) {
      res.status(404).json({ message: 'Astronaut profile not found' });
      return;
    }

    const nums = unitIds.map(Number);
    if (system === 'prestarter') {
      astronaut.manuallyUnlockedPreStarter = nums;
    } else if (system === 'pet') {
      astronaut.manuallyUnlockedPET = nums;
    } else {
      // default Mover/Roundup
      astronaut.manuallyUnlockedPlanets = nums;
    }

    const updated = await saveAstronaut(astronaut);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error unlocking units', error: (error as Error).message });
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

    const astronaut = await getAstronaut(name);
    if (!astronaut) {
      res.status(404).json({ message: 'Astronaut profile not found' });
      return;
    }

    astronaut.stars = (astronaut.stars || 0) + Number(stars);
    
    const updated = await saveAstronaut(astronaut);
    res.status(200).json(updated);
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

    const astronaut = await getAstronaut(name);
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
    if (!astronaut.badges) astronaut.badges = [];
    if (!astronaut.badges.includes(badgeKey)) {
      astronaut.badges.push(badgeKey);
    }

    const bonusStars = Math.round(Number(score) / 5);
    astronaut.stars = (astronaut.stars || 0) + bonusStars;

    const updated = await saveAstronaut(astronaut);

    res.status(200).json({
      status: 'success',
      astronaut: updated
    });
  } catch (error) {
    res.status(500).json({ message: 'Error passing revision', error: (error as Error).message });
  }
};
