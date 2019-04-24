import { Document } from 'mongoose';

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  g_id: number;
  story: object;
}