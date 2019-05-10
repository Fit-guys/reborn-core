import { Request, Response } from 'express';
import { compare } from 'bcrypt';
import { UsersModel } from '../models/user';
import { ResponseUtils, createError } from '../utils/response';
import MailHelper from '../helpers/mailer'
import { StatHelper } from "../helpers/statisticHelper"
import { forgotPasswordText, feedbackText } from "../config/texts"
const path = require('path');


export default class UsersController {
  public loginWithEmail = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const user = await UsersModel.findOne({ email });

    if (user) {
      const match = await compare(password, user.password);
      if (match) {
        ResponseUtils.json(res, true, UsersModel.createUserJwtToken(user));
        return;
      }
      ResponseUtils.json(res, false, createError(
        403,
        'Password is wrong',
        { error: `User's password is not '${password}'.` }
      ));
      return;
    }

    ResponseUtils.json(res, false, createError(
      404,
      'User not found',
      { error: `There are no user with email '${email}'.` }
    ));
  }

  public registerWithEmail = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;

    const existed = await UsersModel.findOne({ email });

    if (existed) {
      ResponseUtils.json(res, false, createError(
        409,
        'User already exists',
        { error: `User with email '${email}' is already registered.` }
      ));
      return;
    }

    try {
      const token = await UsersModel.create(name, email, password);
      ResponseUtils.json(res, true, token);
    } catch (err) {
      ResponseUtils.json(res, false, createError(
        503,
        err.message,
        { error: err.message }
      ));
      return;
    }
  }

  public getUserData = async (req: Request, res: Response): Promise<void> => {
    let { user, type } = await this.getUserByAuthHeader(req.headers.authorization);

    if (user && type == 'full') {
      ResponseUtils.json(res, true, { user: user });
      return;
    }
    ResponseUtils.json(res, false, createError(
      404,
      "User is not found",
      {}
    ));
  }

  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    const user = await UsersModel.findOne({ email: email });

    if (user) {
      UsersModel.generateUserCode(user);
      await MailHelper.sendMail(user.email, forgotPasswordText(user.name, user.code.toString()))
    } else {
      ResponseUtils.json(res, false, createError(
        403,
        "Unknown email",
        {}
      ));
    }

    ResponseUtils.json(res, true);
    return;
  }

  public changePassword = async (req: Request, res: Response): Promise<void> => {

    const { newPassword } = req.body;

    let { user, type } = await this.getUserByAuthHeader(req.headers.authorization);
    if (user) {
      await UsersModel.updateUserPassword(user, newPassword);
      ResponseUtils.json(res, true);
      return;
    }

    ResponseUtils.json(res, false, createError(
      404,
      "User not found",
      {}
    ));
    return;

  }

  public addUserStory = async (req: Request, res: Response): Promise<void> => {
    const game_data = req.body;

    let { user, type } = await this.getUserByAuthHeader(req.headers.authorization);
    if (user && type == 'full') {
      await UsersModel.addUserStory(user, game_data);
      ResponseUtils.json(res, true);
      return;
    }

    ResponseUtils.json(res, false, createError(
      404,
      "User not found",
      {}
    ));
    return;

  }

  public getUserStories = async (req: Request, res: Response): Promise<void> => {
    const game_id = req.param('game_id');

    let { user, type } = await this.getUserByAuthHeader(req.headers.authorization);
    if (user && type == 'full') {
      ResponseUtils.json(res, true, { stories: UsersModel.getUserStories(user, +game_id) });
      return;
    }

    ResponseUtils.json(res, false, createError(
      404,
      "User not found",
      {}
    ));
    return;

  }

  public checkUserCode = async (req: Request, res: Response): Promise<void> => {
    const { email, code } = req.body;

    let user = await UsersModel.findOne({ email: email });
    if (user && user.code == code) {
      ResponseUtils.json(res, true, UsersModel.createUserJwtToken(user, 'password'));
      return;
    }

    ResponseUtils.json(res, false, createError(
      403,
      "Wrong code or email",
      {}
    ));
    return;

  }

  public getUserStat = async (req: Request, res: Response): Promise<void> => {
    let users = await UsersModel.getUsers();
    StatHelper.updateStatistic(users);
    res.sendFile(path.resolve(__dirname + '../../../reports/report.xlsx'), function (err) {
      console.log(err);
    })
    return;
  }

  public removeUserStories = async (req: Request, res: Response): Promise<void> => {
    let data = await this.getUserByAuthHeader(req.headers.authorization);
    if (data.type != 'full') {
      ResponseUtils.json(res, false, createError(
        403,
        'Not full token',
        {}
      ));
      return;
    }

    await UsersModel.delteUserStories(data.user);
    ResponseUtils.json(res, true);
    return;
  }

  public sendSupportEmail = async (req: Request, res: Response): Promise<void> => {
    let { email, name, text } = req.body;
    console.log(await MailHelper.sendMail(email, feedbackText(name, text), 'Підтвердження відправки листа розробникам'));
    ResponseUtils.json(res, true);
    return;
  }

  private getUserByAuthHeader = async (header: string) => {
    const auth = header.split(' ');
    const type = auth[0];
    const token = auth[1];

    if (type == 'Bearer') {
      return await UsersModel.findOneByJwtToken(token);
    }
    return null;
  }
}

export const usersController = new UsersController();