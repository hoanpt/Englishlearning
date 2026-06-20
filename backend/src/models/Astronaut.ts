import mongoose, { Schema, Document } from 'mongoose';

export interface IAstronaut extends Document {
  name: string;
  stars: number;
  completedPlanets: number[];
  badges: string[];
  accessories: string[];
  equippedAccessory: string;
  passedRevisions: number[];
  createdAt: Date;
}

const AstronautSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  stars: { type: Number, default: 0 },
  completedPlanets: [{ type: Number }], // Array of completed unit numbers
  badges: [{ type: String }],            // List of unlocked badge identifiers
  accessories: [{ type: String, default: [] }],
  equippedAccessory: { type: String, default: '' },
  passedRevisions: [{ type: Number, default: [] }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAstronaut>('Astronaut', AstronautSchema);
