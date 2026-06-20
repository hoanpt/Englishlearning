import { Request, Response } from 'express';
import Vocabulary from '../models/Vocabulary';

// Get all vocabulary words
export const getVocabularies = async (req: Request, res: Response): Promise<void> => {
  try {
    const vocabs = await Vocabulary.find();
    res.status(200).json(vocabs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vocabulary', error: (error as Error).message });
  }
};

// Toggle isLearned status of a vocabulary word
export const toggleLearned = async (req: Request, res: Response): Promise<void> => {
  try {
    const { word, isLearned } = req.body;
    
    if (!word) {
      res.status(400).json({ message: 'Word is required' });
      return;
    }

    const vocab = await Vocabulary.findOneAndUpdate(
      { word },
      { isLearned: !!isLearned },
      { new: true }
    );

    if (!vocab) {
      res.status(404).json({ message: 'Vocabulary word not found' });
      return;
    }

    res.status(200).json(vocab);
  } catch (error) {
    res.status(500).json({ message: 'Error updating vocabulary', error: (error as Error).message });
  }
};
