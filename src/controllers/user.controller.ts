import { Request, Response } from 'express';
import { compare } from 'bcrypt';
import { UsersModel } from '../models/user';
import { ResponseUtils, createError } from '../utils/response';
import MailHelper from '../helpers/mailer'

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
    const token = req.param('token');
    try {
      const user = await UsersModel.findOneByJwtToken(token);

      if (user) {
        ResponseUtils.json(res, true, { name: user.name, email: user.email });
        return;
      }
      ResponseUtils.json(res, false, createError(
        404,
        "User is not found",
        {}
      ));
    } catch (err) {
      ResponseUtils.json(res, false, createError(
        503,
        "token is invalid",
        { error: err.message }
      ));
      return;
    }
  }

  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    const user = await UsersModel.findOne({ email: email });

    if (user) {
      const text = `Добрий день! Щоб відновити пароль перейдіть за посиланням`;
      await MailHelper.sendMail(user.email, text)
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

    let user = await this.getUserByAuthHeader(req.headers.authorization)
    if (user) {
      user.password = newPassword
      user.save();
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