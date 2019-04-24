import { Request, Response } from 'express';
import { compare } from 'bcrypt';
import { UsersModel } from '../models/user';
import { ResponseUtils, createError } from '../utils/response';

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
}

export const usersController = new UsersController();