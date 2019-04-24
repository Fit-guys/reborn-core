import { Model, model } from 'mongoose';
import { hash } from 'bcrypt';
import { User } from './user';
import { UserSchema } from './user.schema';
import * as jwt from 'jsonwebtoken';

export class UsersModel {
  private static _collectionName: string = 'Users';
  private static JWT_SECRET = "nbfdskmajdfvklakdfjgvl";
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

  //fix jwt get 
  public static async findOneByJwtToken(token: string) {
    const userData = JSON.stringify(await jwt.verify(token, this.JWT_SECRET))
    return this.findOne({ _id: JSON.parse(userData).id });
  }

  public static createUserJwtToken(user: User): { userToken: string, expiresIn: number } {
    const expiresIn = 60 * 60 * 24 * 7; // one week.
    const userToken = jwt.sign({ id: user._id }, this.JWT_SECRET, { expiresIn });
    return {
      expiresIn,
      userToken
    }
  }
}
