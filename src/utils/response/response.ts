import { Response } from 'express';
import { ResponseError, createError } from './response-error';

export class ResponseUtils {
    public static json(res: Response, status: boolean, data?: ResponseError | any): void {
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", '0');
        res.json({ status, ...data });
    }
}