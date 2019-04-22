export interface ResponseError {
    code: number;
    message: string;
    details: any;
}

export const createError = (code: number, message: string, details: any): ResponseError => {
    return { code, message, details };
}
