export enum Subject {
  Maths = 'Maths',
  Science = 'Science',
}

export enum Role {
    User = 'user',
    Model = 'model',
}

export enum Difficulty {
    Simple = 'Simple',
    Medium = 'Medium',
    Advanced = 'Advanced',
}

export interface Message {
  role: Role;
  text: string;
}

export interface QuizAttempt {
  difficulty: Difficulty;
  topic: string;
  score: number;
  date: number;
}

export interface ProgressData {
  [Subject.Maths]: QuizAttempt[];
  [Subject.Science]: QuizAttempt[];
}