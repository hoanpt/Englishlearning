import mongoose, { Schema, Document } from 'mongoose';

export interface IVocabulary extends Document {
  word: string;
  ipa: string;
  type: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  isLearned: boolean;
}

const VocabularySchema: Schema = new Schema({
  word: { type: String, required: true, unique: true },
  ipa: { type: String, required: true },
  type: { type: String, required: true },
  meaning: { type: String, required: true },
  example: { type: String, required: true },
  exampleTranslation: { type: String, required: true },
  isLearned: { type: Boolean, default: false }
});

export default mongoose.model<IVocabulary>('Vocabulary', VocabularySchema);
