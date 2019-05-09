import { Response } from 'express';
import { ResponseError, createError } from './response-error';

export class ResponseUtils {
    public static json(res: Response, status: boolean, data?: ResponseError | any): void {
        res.set("Access-Control-Allow-Credentials", "true");
        res.set("Access-Control-Allow-Headers", "Accept, X-Access-Token, X-Application-Name, X-Request-Sent-Time");
        res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set("Access-Control-Allow-Origin", "*");
        res.json({ status, ...data });
    }
}