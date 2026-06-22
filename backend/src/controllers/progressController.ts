import { Request, Response } from 'express';
import { saveProgress, getProgressHistory as getHistoryDb } from '../utils/dbHelper';

// Submit a new placement test progress
export const submitProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      studentName,
      dob,
      previousClass,
      testDate,
      answers,
      score,
      maxScore,
      percentage,
      placementClass,
      diagnostics
    } = req.body;

    if (!studentName || score === undefined || maxScore === undefined) {
      res.status(400).json({ message: 'Missing required student name or score parameters' });
      return;
    }

    const progressData = {
      studentName,
      dob,
      previousClass,
      testDate: testDate || new Date().toLocaleDateString('vi-VN'),
      answers: answers || {},
      score,
      maxScore,
      percentage,
      placementClass,
      diagnostics: diagnostics || []
    };

    const savedProgress = await saveProgress(progressData);
    res.status(201).json({
      status: 'success',
      message: 'Placement test result saved successfully!',
      data: savedProgress
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving progress result', error: (error as Error).message });
  }
};

// Get history of all placement tests
export const getProgressHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const history = await getHistoryDb();
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress history', error: (error as Error).message });
  }
};
