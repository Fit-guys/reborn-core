import { Request, Response } from 'express';

import { UsersModel } from '../models/user';
import { ResponseUtils, createError } from '../utils/response'; 

export default class UsersController {
  public loginWithEmail = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const existed = await UsersModel.findOne({ email });

    if (existed) {
      ResponseUtils.json(res, true, { user: existed });
      return;
    }

    ResponseUtils.json(res, false, createError(
      404,
      'User not found.',
      { phone: `There are no user with phone '${email}'.` }
    ));
  }

  public registerWithEmail = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const existed = await UsersModel.findOne({ email });

    if (existed) {
      ResponseUtils.json(res, false, createError(
        409,
        'User already exists.',
        { error: `User with phone '${email}' is already registered.` }  
      ));
      return;
    }

    const created = await UsersModel.create(email, password);

    if (!created) {
      ResponseUtils.json(res, false, createError(
        503,
        'Something went wrong :(',
        { error: 'Internal server error while creating new User' }
      ));
      return;
    }

    ResponseUtils.json(res, true, { user: created });
  }
}

export const usersController = new UsersController();