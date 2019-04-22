import { Model, model } from 'mongoose';

import { User } from './user';
import { UserSchema } from './user.schema';

export class UsersModel {
  private static collectionName: string = 'Users';
  private static _model: Model<User> = model<User>(
    UsersModel.collectionName,
    UserSchema
  );

  public static async create(email: string, password) {

    // @TODO: hash password & jwt

    const user = await this._model.create({ name, email });

    return user;
  }

  public static async findOne(conditions: any) {
    return await this._model.findOne(conditions).exec();
  }

}
