import { Response } from 'express';
import { ResponseError, createError } from './responce-error';

export class ResponseUtils {
    public static json(res: Response, status: boolean, data?: ResponseError | any): void {

        res.json({ status, ...data });
    }
}