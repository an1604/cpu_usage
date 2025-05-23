import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ErrorResponse } from '../types/metrics';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Global error handler middleware
 */
export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    console.error('Error:', err);

    const errorResponse: ErrorResponse = {
        status: 500,
        message: 'Internal Server Error'
    };

    if (err instanceof ApiError) {
        errorResponse.status = err.status;
        errorResponse.message = err.message;
    } 
    else if (err instanceof ZodError) {
        errorResponse.status = 400;
        errorResponse.message = 'Validation Error';
        errorResponse.error = err.errors[0].message;
    }
    // AWS errors
    else if ('name' in err && err.name.startsWith('AWS')) {
        errorResponse.status = 502;
        errorResponse.message = 'AWS Service Error';
        errorResponse.error = err.message;
    }

    res.status(errorResponse.status).json(errorResponse);
}
