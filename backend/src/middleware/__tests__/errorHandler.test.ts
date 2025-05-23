import { Request, Response } from 'express';
import { ZodError, z } from 'zod';
import { errorHandler, ApiError } from '../errorHandler';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('Error Handler Middleware', () => {
    let mockResponse: any;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        mockResponse = {
            status: mockStatus,
            json: mockJson
        };
    });

    it('should handle ApiError correctly', () => {
        const apiError = new ApiError(404, 'Resource not found');
        
        errorHandler(
            apiError,
            {} as Request,
            mockResponse,
            jest.fn()
        );

        expect(mockStatus).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith({
            status: 404,
            message: 'Resource not found'
        });
    });

    it('should handle ZodError correctly', () => {
        const schema = z.string();
        let zodError: ZodError;
        
        try {
            schema.parse(123);
        } catch (error) {
            zodError = error as ZodError;
            
            errorHandler(
                zodError,
                {} as Request,
                mockResponse,
                jest.fn()
            );

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                status: 400,
                message: 'Validation Error',
                error: expect.any(String)
            });
        }
    });

    it('should handle AWS errors correctly', () => {
        const awsError = new Error('AWS Service Unavailable');
        awsError.name = 'AWS.ServiceError';
        
        errorHandler(
            awsError,
            {} as Request,
            mockResponse,
            jest.fn()
        );

        expect(mockStatus).toHaveBeenCalledWith(502);
        expect(mockJson).toHaveBeenCalledWith({
            status: 502,
            message: 'AWS Service Error',
            error: 'AWS Service Unavailable'
        });
    });

    it('should handle unknown errors with 500 status', () => {
        const unknownError = new Error('Something went wrong');
        
        errorHandler(
            unknownError,
            {} as Request,
            mockResponse,
            jest.fn()
        );

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            status: 500,
            message: 'Internal Server Error'
        });
    });
}); 