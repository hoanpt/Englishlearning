import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Astronaut, { IAstronaut } from '../models/Astronaut';
import Progress from '../models/Progress';
import Vocabulary from '../models/Vocabulary';

const DB_FILE = path.join(__dirname, '../../data/db.json');

const ensureDbExists = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      astronauts: [],
      progress: [],
      vocabularies: [
        {
          word: 'Persistent',
          ipa: '/pəˈsɪstənt/',
          type: 'adjective',
          meaning: 'Kiên trì, bền bỉ, dai dẳng',
          example: 'Her persistent efforts finally paid off when she passed the English exam.',
          exampleTranslation: 'Những nỗ lực kiên trì của cô ấy cuối cùng đã được đền đáp khi cô ấy đỗ kỳ thi tiếng Anh.',
          isLearned: false
        },
        {
          word: 'Abundant',
          ipa: '/əˈbʌndənt/',
          type: 'adjective',
          meaning: 'Phong phú, dồi dào, nhiều',
          example: 'There is an abundant supply of fresh water in the mountain area.',
          exampleTranslation: 'Có một nguồn cung cấp nước sạch dồi dào ở vùng núi.',
          isLearned: false
        },
        {
          word: 'Diligent',
          ipa: '/ˈdɪl.ɪ.dʒənt/',
          type: 'adjective',
          meaning: 'Siêng năng, cần cù, chăm chỉ',
          example: 'A diligent student will always review lessons before class.',
          exampleTranslation: 'Một học sinh siêng năng sẽ luôn ôn lại bài học trước khi lên lớp.',
          isLearned: false
        },
        {
          word: 'Vibrant',
          ipa: '/ˈvaɪ.brənt/',
          type: 'adjective',
          meaning: 'Rực rỡ, sống động, đầy sức sống',
          example: 'The city has a vibrant nightlife with many street foods and music shows.',
          exampleTranslation: 'Thành phố có cuộc sống ban đêm sống động với nhiều món ăn đường phố và chương trình ca nhạc.',
          isLearned: false
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
};

const readJsonDb = (): any => {
  ensureDbExists();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON DB, resetting...', err);
    return { astronauts: [], progress: [], vocabularies: [] };
  }
};

const writeJsonDb = (data: any) => {
  ensureDbExists();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

export const getAstronaut = async (name: string): Promise<any> => {
  const trimmedName = name.trim();
  if (mongoose.connection.readyState === 1) {
    return await Astronaut.findOne({ name: trimmedName });
  } else {
    const db = readJsonDb();
    const found = db.astronauts.find((a: any) => a.name.toLowerCase() === trimmedName.toLowerCase());
    return found || null;
  }
};

export const saveAstronaut = async (astronautData: any): Promise<any> => {
  if (mongoose.connection.readyState === 1) {
    let astronaut = await Astronaut.findOne({ name: astronautData.name });
    if (!astronaut) {
      astronaut = new Astronaut(astronautData);
    } else {
      // update fields
      Object.assign(astronaut, astronautData);
    }
    return await astronaut.save();
  } else {
    const db = readJsonDb();
    const index = db.astronauts.findIndex((a: any) => a.name.toLowerCase() === astronautData.name.toLowerCase());
    const existing = index >= 0 ? db.astronauts[index] : {};
    
    // Merge array fields properly
    const updated = {
      ...existing,
      ...astronautData,
      completedPlanets: astronautData.completedPlanets || existing.completedPlanets || [],
      completedPreStarter: astronautData.completedPreStarter || existing.completedPreStarter || [],
      completedPET: astronautData.completedPET || existing.completedPET || [],
      badges: astronautData.badges || existing.badges || [],
      accessories: astronautData.accessories || existing.accessories || [],
      passedRevisions: astronautData.passedRevisions || existing.passedRevisions || [],
      checkInHistory: astronautData.checkInHistory || existing.checkInHistory || [],
      dailyInteractions: astronautData.dailyInteractions || existing.dailyInteractions || [],
      createdAt: existing.createdAt || new Date().toISOString()
    };
    
    if (index >= 0) {
      db.astronauts[index] = updated;
    } else {
      db.astronauts.push(updated);
    }
    writeJsonDb(db);
    return updated;
  }
};

export const getLeaderboard = async (limit: number = 10): Promise<any[]> => {
  if (mongoose.connection.readyState === 1) {
    return await Astronaut.find().sort({ stars: -1 }).limit(limit);
  } else {
    const db = readJsonDb();
    const sorted = [...db.astronauts].sort((a: any, b: any) => (b.stars || 0) - (a.stars || 0));
    return sorted.slice(0, limit);
  }
};

export const saveProgress = async (progressData: any): Promise<any> => {
  if (mongoose.connection.readyState === 1) {
    const progress = new Progress(progressData);
    return await progress.save();
  } else {
    const db = readJsonDb();
    const newProgress = {
      _id: 'p_' + Math.random().toString(36).substr(2, 9),
      ...progressData,
      createdAt: new Date().toISOString()
    };
    db.progress.push(newProgress);
    writeJsonDb(db);
    return newProgress;
  }
};

export const getProgressHistory = async (): Promise<any[]> => {
  if (mongoose.connection.readyState === 1) {
    return await Progress.find().sort({ createdAt: -1 });
  } else {
    const db = readJsonDb();
    return [...db.progress].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};

export const getVocabularies = async (): Promise<any[]> => {
  if (mongoose.connection.readyState === 1) {
    return await Vocabulary.find();
  } else {
    const db = readJsonDb();
    return db.vocabularies;
  }
};

export const updateVocabulary = async (word: string, isLearned: boolean): Promise<any> => {
  if (mongoose.connection.readyState === 1) {
    return await Vocabulary.findOneAndUpdate(
      { word },
      { isLearned: !!isLearned },
      { new: true }
    );
  } else {
    const db = readJsonDb();
    const index = db.vocabularies.findIndex((v: any) => v.word.toLowerCase() === word.toLowerCase());
    if (index >= 0) {
      db.vocabularies[index].isLearned = !!isLearned;
      writeJsonDb(db);
      return db.vocabularies[index];
    }
    return null;
  }
};
