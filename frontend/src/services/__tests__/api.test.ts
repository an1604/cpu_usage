import { fetchMetricsData } from '../api';
import { MetricsQueryParams, MetricDataResult } from '../../types/metrics';
import { config } from '../../config/config';
import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('API Service', () => {
    const mockValidParams: MetricsQueryParams = {
        ipAddress: '192.168.1.1',
        timeRange: 'Last Day',
        period: 300
    };

    const mockValidResponse: MetricDataResult = {
        Timestamps: ['2024-01-01T00:00:00Z', '2024-01-01T01:00:00Z'],
        Values: [42.5, 45.2]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockReset();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('fetchMetricsData', () => {
        it('should successfully fetch and transform metrics data', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockValidResponse,
                text: async () => '',
                status: 200,
                statusText: 'OK',
                headers: new Headers(),
                clone: () => new Response(),
                type: 'basic',
                redirected: false,
                url: '',
                body: null,
                bodyUsed: false,
                arrayBuffer: async () => new ArrayBuffer(0),
                blob: async () => new Blob(),
                formData: async () => new FormData(),
            } as Response);

            const result = await fetchMetricsData(mockValidParams);

            expect(mockFetch).toHaveBeenCalledWith(
                `${config.backendUrl}/api/metrics/cpu-usage`,
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ipAddress: mockValidParams.ipAddress,
                        timeRange: mockValidParams.timeRange,
                        period: mockValidParams.period
                    })
                })
            );

            expect(result).toHaveProperty('Timestamps');
            expect(result).toHaveProperty('Values');
            expect(result.Timestamps.length).toBe(result.Values.length);
            expect(result.Timestamps[0]).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        });

        it('should throw error for invalid IP address', async () => {
            const invalidParams = {
                ...mockValidParams,
                ipAddress: 'invalid-ip'
            };

            await expect(fetchMetricsData(invalidParams))
                .rejects
                .toThrow('Invalid IP address format');
            
            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('should throw error for invalid timeRange', async () => {
            const invalidParams = {
                ...mockValidParams,
                timeRange: '' // Empty timeRange
            };

            await expect(fetchMetricsData(invalidParams))
                .rejects
                .toThrow('Invalid or missing timeRange');
            
            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('should throw error for invalid period', async () => {
            const invalidParams = {
                ...mockValidParams,
                period: 0 // Invalid period
            };

            await expect(fetchMetricsData(invalidParams))
                .rejects
                .toThrow('Period must be between 0 and 86400 seconds');
            
            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('should throw error for period greater than 86400', async () => {
            const invalidParams = {
                ...mockValidParams,
                period: 90000 // Period > 86400
            };

            await expect(fetchMetricsData(invalidParams))
                .rejects
                .toThrow('Period must be between 0 and 86400 seconds');
            
            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('should handle non-OK response from server', async () => {
            const errorMessage = 'Server error';
            mockFetch.mockResolvedValueOnce({
                ok: false,
                text: async () => errorMessage,
                status: 500,
                statusText: 'Internal Server Error',
                headers: new Headers(),
                clone: () => new Response(),
                type: 'basic',
                redirected: false,
                url: '',
                body: null,
                bodyUsed: false,
                arrayBuffer: async () => new ArrayBuffer(0),
                blob: async () => new Blob(),
                formData: async () => new FormData(),
                json: async () => ({}),
            } as Response);

            await expect(fetchMetricsData(mockValidParams))
                .rejects
                .toThrow(errorMessage);
        });

        it('should handle network errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(fetchMetricsData(mockValidParams))
                .rejects
                .toThrow('Network error');
        });

        it('should handle invalid response format', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    someOtherData: 'value'
                }),
                text: async () => '',
                status: 200,
                statusText: 'OK',
                headers: new Headers(),
                clone: () => new Response(),
                type: 'basic',
                redirected: false,
                url: '',
                body: null,
                bodyUsed: false,
                arrayBuffer: async () => new ArrayBuffer(0),
                blob: async () => new Blob(),
                formData: async () => new FormData(),
            } as Response);

            await expect(fetchMetricsData(mockValidParams))
                .rejects
                .toThrow('Invalid response format: missing required arrays');
        });

        it('should handle mismatched array lengths', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    Timestamps: ['2024-01-01T00:00:00Z'],
                    Values: [42.5, 45.2]
                }),
                text: async () => '',
                status: 200,
                statusText: 'OK',
                headers: new Headers(),
                clone: () => new Response(),
                type: 'basic',
                redirected: false,
                url: '',
                body: null,
                bodyUsed: false,
                arrayBuffer: async () => new ArrayBuffer(0),
                blob: async () => new Blob(),
                formData: async () => new FormData(),
            } as Response);

            await expect(fetchMetricsData(mockValidParams))
                .rejects
                .toThrow('Invalid response format: timestamp and value arrays have different lengths');
        });

        it('should format timestamps correctly', async () => {
            const mockResponse = {
                Timestamps: ['2024-01-01T14:30:45.000Z'],
                Values: [42.5]
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
                text: async () => '',
                status: 200,
                statusText: 'OK',
                headers: new Headers(),
                clone: () => new Response(),
                type: 'basic',
                redirected: false,
                url: '',
                body: null,
                bodyUsed: false,
                arrayBuffer: async () => new ArrayBuffer(0),
                blob: async () => new Blob(),
                formData: async () => new FormData(),
            } as Response);

            const result = await fetchMetricsData(mockValidParams);

            expect(result.Timestamps[0]).toMatch(/^\d{2}:\d{2}:\d{2}$/);
            
            const [hours, minutes, seconds] = result.Timestamps[0].split(':').map(Number);
            expect(hours).toBeGreaterThanOrEqual(0);
            expect(hours).toBeLessThan(24);
            expect(minutes).toBeGreaterThanOrEqual(0);
            expect(minutes).toBeLessThan(60);
            expect(seconds).toBeGreaterThanOrEqual(0);
            expect(seconds).toBeLessThan(60);
        });

        it('should handle empty response arrays', async () => {
            const emptyResponse = {
                Timestamps: [],
                Values: []
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => emptyResponse,
                text: async () => '',
                status: 200,
                statusText: 'OK',
                headers: new Headers(),
                clone: () => new Response(),
                type: 'basic',
                redirected: false,
                url: '',
                body: null,
                bodyUsed: false,
                arrayBuffer: async () => new ArrayBuffer(0),
                blob: async () => new Blob(),
                formData: async () => new FormData(),
            } as Response);

            const result = await fetchMetricsData(mockValidParams);

            expect(result.Timestamps).toHaveLength(0);
            expect(result.Values).toHaveLength(0);
        });
    });
}); 