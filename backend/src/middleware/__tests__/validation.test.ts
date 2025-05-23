import { validateRequestQuery } from '../validation';
import { describe, expect, it } from '@jest/globals';


describe('Validation Middleware', () => {
    describe('validateRequestQuery', () => {
        it('should accept valid query parameters', () => {
            const validQuery = {
                ipAddress: '192.168.1.1',
                periodDays: 7,
                period: 300
            };

            const result = validateRequestQuery({ query: validQuery });
            expect(result).toEqual({ success: true, status: 200 });
        });

        it('should reject invalid IP address', () => {
            const invalidIpQuery = {
                ipAddress: 'invalid-ip',
                periodDays: 7,
                period: 300
            };

            const result = validateRequestQuery({ query: invalidIpQuery });
            expect(result.success).toBe(false);
            expect(result.status).toBe(400);
            expect(result.error).toContain('Invalid ip');
        });

        it('should reject periodDays less than 1', () => {
            const invalidPeriodDaysQuery = {
                ipAddress: '192.168.1.1',
                periodDays: 0,
                period: 300
            };

            const result = validateRequestQuery({ query: invalidPeriodDaysQuery });
            expect(result.success).toBe(false);
            expect(result.status).toBe(400);
            expect(result.error).toContain('Number must be greater than or equal to 1');
        });

        it('should reject periodDays more than 14', () => {
            const invalidPeriodDaysQuery = {
                ipAddress: '192.168.1.1',
                periodDays: 15,
                period: 300
            };

            const result = validateRequestQuery({ query: invalidPeriodDaysQuery });
            expect(result.success).toBe(false);
            expect(result.status).toBe(400);
            expect(result.error).toContain('Number must be less than or equal to 14');
        });

        it('should reject period less than 60', () => {
            const invalidPeriodQuery = {
                ipAddress: '192.168.1.1',
                periodDays: 7,
                period: 30
            };

            const result = validateRequestQuery({ query: invalidPeriodQuery });
            expect(result.success).toBe(false);
            expect(result.status).toBe(400);
            expect(result.error).toContain('Number must be greater than or equal to 60');
        });

        it('should reject period more than 86400', () => {
            const invalidPeriodQuery = {
                ipAddress: '192.168.1.1',
                periodDays: 7,
                period: 90000
            };

            const result = validateRequestQuery({ query: invalidPeriodQuery });
            expect(result.success).toBe(false);
            expect(result.status).toBe(400);
            expect(result.error).toContain('Number must be less than or equal to 86400');
        });

        it('should reject missing required fields', () => {
            const incompleteQuery = {
                ipAddress: '192.168.1.1',
            };

            const result = validateRequestQuery({ query: incompleteQuery });
            expect(result.success).toBe(false);
            expect(result.status).toBe(400);
            expect(result.error).toBeTruthy();
        });
    });
}); 