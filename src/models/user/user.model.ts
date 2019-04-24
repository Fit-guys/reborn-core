import { Model, model } from 'mongoose';
import {hash}  from 'bcrypt';
import { User } from './user';
import { UserSchema } from './user.schema';
import * as jwt from 'jsonwebtoken';

export class UsersModel {
  private static _collectionName: string = 'Users';
  private static _model: Model<User> = model<User>(
    UsersModel._collectionName,
    UserSchema
  );

  public static async create(name: string, email: string, password: string, g_id?: number) {
    let hashPassword = await hash(password, 12);
    const user = await this._model.create({ name: name, email: email, password: hashPassword });
    return this.createUserJwtToken(user._id);
  }

  public static async findOne(conditions: any) {
    return await this._model.findOne(conditions).exec();
  }

  public static createUserJwtToken(user: User): { userToken: string, expiresIn: number } {
    const JWT_SECRET = "nbfdskmajdfvklakdfjgvl";
    const expiresIn = 60 * 60 * 24 * 7; // one week.
    const userToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn });
    return {
      expiresIn,
      userToken
    }
  }
}
