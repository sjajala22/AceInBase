import { Subject, Difficulty, QuizAttempt, ProgressData } from '../types';

const PROGRESS_KEY = 'aceinbase_progress';

export const getProgress = (): ProgressData => {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to load progress:", error);
  }
  // Return default structure if nothing is found or on error
  return {
    [Subject.Maths]: [],
    [Subject.Science]: [],
  };
};

export const saveQuizResult = (subject: Subject, difficulty: Difficulty, topic: string, score: number): void => {
  try {
    const progress = getProgress();
    const newAttempt: QuizAttempt = {
      difficulty,
      topic,
      score,
      date: Date.now(),
    };
    progress[subject].push(newAttempt);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save progress:", error);
  }
};

export const clearProgress = (): void => {
    try {
        localStorage.removeItem(PROGRESS_KEY);
    } catch (error) {
        console.error("Failed to clear progress:", error);
    }
}