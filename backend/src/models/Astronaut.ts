import mongoose, { Schema, Document } from 'mongoose';

export interface IAstronaut extends Document {
  name: string; // unique username
  password?: string; // PIN or simple password
  displayName?: string;
  birthYear?: number;
  parentEmail?: string;
  parentPhone?: string;
  avatar?: string; // emoji or animal name
  stars: number;
  completedPlanets: number[]; // roundup completed units
  completedPreStarter: number[]; // prestarter completed units
  completedPET: number[]; // pet completed units
  badges: string[];
  accessories: string[];
  equippedAccessory: string;
  passedRevisions: number[];
  lastCheckIn?: string; // YYYY-MM-DD
  checkInStreak: number;
  checkInHistory: string[]; // array of YYYY-MM-DD
  lastGreetingDate?: string; // YYYY-MM-DD
  dailyInteractions: Array<{ date: string; mood: string; message: string }>;
  createdAt: Date;
}

const AstronautSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, default: '' },
  displayName: { type: String, default: '' },
  birthYear: { type: Number, default: 2018 },
  parentEmail: { type: String, default: '' },
  parentPhone: { type: String, default: '' },
  avatar: { type: String, default: '🚀' },
  stars: { type: Number, default: 0 },
  completedPlanets: [{ type: Number }], // Array of completed unit numbers for roundup
  completedPreStarter: [{ type: Number, default: [] }], // Prestarter completed units
  completedPET: [{ type: Number, default: [] }], // PET completed units
  badges: [{ type: String }],            // List of unlocked badge identifiers
  accessories: [{ type: String, default: [] }],
  equippedAccessory: { type: String, default: '' },
  passedRevisions: [{ type: Number, default: [] }],
  lastCheckIn: { type: String, default: '' },
  checkInStreak: { type: Number, default: 0 },
  checkInHistory: [{ type: String, default: [] }],
  lastGreetingDate: { type: String, default: '' },
  dailyInteractions: [{
    date: { type: String, required: true },
    mood: { type: String, required: true },
    message: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAstronaut>('Astronaut', AstronautSchema);
