import { validateRequestQuery } from '../validation';
import { describe, expect, it } from '@jest/globals';


describe('Validation Middleware', () => {
    describe('validateRequestQuery', () => {
        it('should accept valid query parameters', () => {
            const validQuery = {
                ipAddress: '192.168.1.1',
                timeRange: 'Last Day',
                period: 300
            };

            const result = validateRequestQuery({ query: validQuery });
            expect(result).toEqual({ success: true, status: 200 });
        });

        it('should reject invalid IP address', () => {
            const invalidIpQuery = {
                ipAddress: 'invalid-ip',
                timeRange: 'Last Day',
                period: 300
            };

            const result = validateRequestQuery({ query: invalidIpQuery });
            expect(result.success).toBe(false);
            expect(result.status).toBe(400);
            expect(result.error).toContain('Invalid ip');
        });

        it('should reject invalid timeRange value', () => {
            const invalidTimeRangeQuery = {
                ipAddress: '192.168.1.1',
                timeRange: 'Invalid Range',
                period: 300
            };

            const result = validateRequestQuery({ query: invalidTimeRangeQuery });
            expect(result.success).toBe(false);
            expect(result.status).toBe(400);
            expect(result.error).toContain('Invalid timeRange');
        });

        it('should accept valid timeRange values', () => {
            const validTimeRanges = ['Last Hour', 'Last 6 Hours', 'Last 12 Hours', 'Last Day', 'Last 7 Days'];
            
            for (const timeRange of validTimeRanges) {
                const validQuery = {
                    ipAddress: '192.168.1.1',
                    timeRange,
                    period: 300
                };

                const result = validateRequestQuery({ query: validQuery });
                expect(result.success).toBe(true);
                expect(result.status).toBe(200);
            }
        });

        it('should reject period less than 60', () => {
            const invalidPeriodQuery = {
                ipAddress: '192.168.1.1',
                timeRange: 'Last Day',
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
                timeRange: 'Last Day',
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