import { Document } from 'mongoose';

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  code: number;
  role: string;
  status: string;
  g_id: number;
  story: Array<{ game_id: number, score: number, time: string }>;
}