import { Request, Response } from 'express';
import { UsersModel, User } from '../models/user';
import { ResponseUtils, createError } from '../utils/response';
import MailHelper from '../helpers/mailer'
import { StatHelper } from "../helpers/statisticHelper"
import { forgotPasswordText, feedbackText, registerText } from "../config/texts"
import { NextFunction } from 'connect';
import UsersRoute from '../routes/user.route';
const path = require('path');

export default class UsersController {
  public user: User;

  public loginWithEmail = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const user = await UsersModel.findOne({ email });
    const match = await UsersModel.validateUserPassword(user, password);
    if (match) {
      ResponseUtils.json(res, true, UsersModel.createUserJwtToken(user));
      return;
    }

    ResponseUtils.json(res, false, createError(
      404,
      'not valid password or user',
      { error: `empty user or password is wrong` }
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
      MailHelper.sendMail(email, registerText(name), 'Реєстрація у веб-порталі «Cyber Unicorns: reborn»');
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
    ResponseUtils.json(res, true, {
      user: UsersModel.getUserPublicData(this.user)
    });
    return;
  }

  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    const user = await UsersModel.findOne({ email: email });

    if (user) {
      UsersModel.generateUserCode(user);
      MailHelper.sendMail(user.email, forgotPasswordText(user.name, user.code.toString()))
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

    await UsersModel.updateUserPassword(this.user, newPassword);
    ResponseUtils.json(res, true);
    return;
  }

  public addUserStory = async (req: Request, res: Response): Promise<void> => {
    const game_data = req.body;

    await UsersModel.addUserStory(this.user, game_data);
    ResponseUtils.json(res, true);
    return;

  }

  public getUserStories = async (req: Request, res: Response): Promise<void> => {
    const game_id = req.param('game_id');

    ResponseUtils.json(res, true, { stories: UsersModel.getUserStories(this.user, +game_id) });
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

  public updateStat = async (req: Request, res: Response): Promise<void> => {
    let users = await UsersModel.getUsers();
    StatHelper.updateStat(users);
    res.sendFile(path.resolve(__dirname + '../../../reports/report.xlsx'), function (err) {
      console.log(err);
    })
    return;
  }

  public removeUserStories = async (req: Request, res: Response): Promise<void> => {
    await UsersModel.delteUserStories(this.user);
    ResponseUtils.json(res, true);
    return;
  }

  public sendSupportEmail = async (req: Request, res: Response): Promise<void> => {
    let { email, name, text } = req.body;
    await MailHelper.sendMail(email, feedbackText(name, text), 'Підтвердження відправки листа розробникам');
    ResponseUtils.json(res, true);
    return;
  }

  public rateGame = async (req: Request, res: Response): Promise<void> => {
    let { rate } = req.body;

    let user = await UsersModel.rateGame(this.user, rate);
    if (user.rate == rate) {
      ResponseUtils.json(res, true);
      return;
    }
    ResponseUtils.json(res, false, createError(500, "Something wrong", {}));
  }

  public authUser = async (req: Request, res: Response, next: NextFunction) => {
    let data = { user: null, type: null };
    if (req.headers.authorization) {
      data = await usersController.getUserByAuthHeader(req.headers.authorization);
    }

    if (UsersRoute.private.includes(req.path)) {
      usersController.user = data.type == 'full' ? data.user : null;
    } else if (UsersRoute.protected.includes(req.path)) {
      usersController.user = data.user;
    } else {
      next();
      return;
    }

    if (usersController.user) {
      next();
    } else {
      ResponseUtils.json(res, false, createError(
        404,
        "User not found",
        {}
      ));
    }

  }

  public getUserByAuthHeader = async (header: string) => {
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