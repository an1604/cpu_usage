import { MetricsQueryParams, MetricDataResult, ErrorResponse } from '../metrics';
import { describe, expect, it } from '@jest/globals';

describe('Frontend Metrics Types', () => {
    describe('MetricsQueryParams', () => {
        it('should have the correct properties and types', () => {
            const validQuery: MetricsQueryParams = {
                ipAddress: '192.168.1.1',
                timeRange: 'Last Day',
                period: 300
            };

            expect(validQuery).toHaveProperty('ipAddress');
            expect(typeof validQuery.ipAddress).toBe('string');
            expect(validQuery).toHaveProperty('timeRange');
            expect(typeof validQuery.timeRange).toBe('string');
            expect(validQuery).toHaveProperty('period');
            expect(typeof validQuery.period).toBe('number');
        });

        it('should allow valid timeRange values', () => {
            const validTimeRanges = ['Last Hour', 'Last 6 Hours', 'Last 12 Hours', 'Last Day', 'Last 7 Days'];
            
            validTimeRanges.forEach(timeRange => {
                const query: MetricsQueryParams = {
                    ipAddress: '192.168.1.1',
                    timeRange,
                    period: 300
                };
                expect(query.timeRange).toBe(timeRange);
            });
        });

        it('should validate period is a positive number', () => {
            const validPeriods = [60, 300, 3600, 86400];
            
            validPeriods.forEach(period => {
                const query: MetricsQueryParams = {
                    ipAddress: '192.168.1.1',
                    timeRange: 'Last Day',
                    period
                };
                expect(query.period).toBeGreaterThan(0);
            });
        });
    });

    describe('MetricDataResult', () => {
        it('should have the correct properties and types', () => {
            const validMetricData: MetricDataResult = {
                Timestamps: ['2024-01-01T00:00:00Z'],
                Values: [42.5]
            };

            expect(validMetricData).toHaveProperty('Timestamps');
            expect(Array.isArray(validMetricData.Timestamps)).toBe(true);
            expect(typeof validMetricData.Timestamps[0]).toBe('string');
            expect(validMetricData.Timestamps[0]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
            expect(validMetricData).toHaveProperty('Values');
            expect(Array.isArray(validMetricData.Values)).toBe(true);
            expect(typeof validMetricData.Values[0]).toBe('number');
        });

        it('should maintain array length consistency', () => {
            const timestamps = ['2024-01-01T00:00:00Z', '2024-01-01T01:00:00Z'];
            const values = [42.5, 45.2];

            const metricData: MetricDataResult = {
                Timestamps: timestamps,
                Values: values
            };

            expect(metricData.Timestamps.length).toBe(metricData.Values.length);
        });

        it('should validate timestamp format', () => {
            const validTimestamps = [
                '2024-01-01T00:00:00Z',
                '2024-12-31T23:59:59Z',
                '2024-02-29T12:00:00Z' // Valid leap year
            ];

            validTimestamps.forEach(timestamp => {
                const metricData: MetricDataResult = {
                    Timestamps: [timestamp],
                    Values: [42.5]
                };
                expect(metricData.Timestamps[0]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
            });
        });

        it('should validate CPU usage values are between 0 and 100', () => {
            const validValues = [0, 25.5, 50, 75.75, 100];
            
            validValues.forEach(value => {
                const metricData: MetricDataResult = {
                    Timestamps: ['2024-01-01T00:00:00Z'],
                    Values: [value]
                };
                expect(metricData.Values[0]).toBeGreaterThanOrEqual(0);
                expect(metricData.Values[0]).toBeLessThanOrEqual(100);
            });
        });
    });

    describe('ErrorResponse', () => {
        it('should have the correct properties and types', () => {
            const validError: ErrorResponse = {
                status: 404,
                message: 'Resource not found',
                error: 'Additional error details'
            };

            expect(validError).toHaveProperty('status');
            expect(typeof validError.status).toBe('number');
            expect(validError).toHaveProperty('message');
            expect(typeof validError.message).toBe('string');
            expect(validError).toHaveProperty('error');
            expect(typeof validError.error).toBe('string');
        });

        it('should allow optional error property', () => {
            const errorWithoutDetails: ErrorResponse = {
                status: 500,
                message: 'Internal server error'
            };

            expect(errorWithoutDetails).toHaveProperty('status');
            expect(errorWithoutDetails).toHaveProperty('message');
            expect(errorWithoutDetails.error).toBeUndefined();
        });

        it('should validate status code range', () => {
            const validStatusCodes = [200, 400, 404, 500, 503];
            
            validStatusCodes.forEach(status => {
                const error: ErrorResponse = {
                    status,
                    message: 'Test message'
                };
                expect(error.status).toBe(status);
            });
        });

        it('should validate error messages are non-empty', () => {
            const error: ErrorResponse = {
                status: 404,
                message: 'Resource not found'
            };

            expect(error.message.length).toBeGreaterThan(0);
            if (error.error) {
                expect(error.error.length).toBeGreaterThan(0);
            }
        });
    });
}); 