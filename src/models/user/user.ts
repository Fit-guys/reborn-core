import { Document } from 'mongoose';

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  code: number;
  role: string;
  rate: string,
  status: string;
  g_id: number;
  totalScore: number;
  totalTime: number;
  story: Array<{ game_id: number, score: number, time: number }>;
}