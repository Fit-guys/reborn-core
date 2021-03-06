import { Model, model } from 'mongoose';
import { User } from './user';
import UserSchema from './user.schema';
import config from '../../config/config';
import * as jwt from 'jsonwebtoken';
import { compare } from 'bcrypt';

export class UsersModel {
  private static _collectionName: string = 'Users';
  private static JWT_SECRET = "nbfdskmajdfvklakdfjgvl";
  private static _model: Model<User> = model<User>(
    UsersModel._collectionName,
    UserSchema
  );

  public static async create(name: string, email: string, password: string, g_id?: number) {
    const user = await this._model.create({ name: name, email: email, password: password });
    return this.createUserJwtToken(user);
  }

  public static async remove(conditions: any) {
    return await this._model.remove(conditions);
  }

  public static async getUsers() {
    return await this._model.find();
  }

  public static async update(conditions: any, update: any) {
    return await this._model.findOneAndUpdate(conditions, update, { new: true });
  }

  public static async updateUserPassword(user: User, password: string) {
    user.password = password
    return await user.save();
  }

  public static async generateUserCode(user: User) {
    user.code = Math.floor(1000 + Math.random() * 9000);
    user.markModified('code');
    return await user.save();
  }

  public static async findOne(conditions: any) {
    return await this._model.findOne(conditions);
  }

  //fix jwt get 
  public static async findOneByJwtToken(token: string) {
    const userData = JSON.stringify(await jwt.verify(token, this.JWT_SECRET))
    const token_data = JSON.parse(userData);
    return {
      user: await this.findOne({ _id: token_data.id }),
      type: token_data.type
    };
  }

  public static createUserJwtToken(user: User, type: string = 'full'): { userToken: string, expiresIn: number } {
    const userToken = jwt.sign({ id: user._id, type: type }, this.JWT_SECRET, { expiresIn: config.jwtTokenExpiresIn, });
    return {
      expiresIn: config.jwtTokenExpiresIn,
      userToken
    }
  }

  public static async delteUserStories(user: User) {
    user.story = [];
    user.markModified('story');
    return await user.save();
  }

  public static async addUserStory(user: User, game_data: { game_id: number, score: number, time: number }) {

    let game_index = user.story.findIndex(function (element) {
      return element.game_id == game_data.game_id
    })

    if (game_index >= 0) {
      user.story[game_index] = game_data
    } else {
      user.story.push(game_data);
    }

    user.markModified('story');
    return await user.save();
  }

  public static getUserStories(user: User, game_id?: number): { game_id: number, score: number, time: number }[] {
    let stories = user.story;
    if (game_id) {
      stories = [stories.find(function (element) {
        return element.game_id == game_id;
      })]
    }

    return stories;
  }

  public static getUserPublicData(user: User) {
    return {
      email: user.email,
      name: user.name,
      story: user.story,
      role: user.role,
      status: user.status,
      rate: user.rate,
      totalScore: user.totalScore,
      totalTime: user.totalTime
    }
  }

  public static async rateGame(user: User, rate: string) {
    user.rate = rate;
    user.markModified('rate');
    return await user.save()
  }

  public static async validateUserPassword(user: User, password: string) {
    if (user) {
      return await compare(password, user.password);
    }
    return false;
  }

}
