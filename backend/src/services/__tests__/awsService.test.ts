import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import { awsService, AwsService } from '../awsService';
import { GetMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { MetricDataResult } from '../../types/metrics';

class TestAwsService extends AwsService {
    constructor() {
        super();
    }

    public testCreateMetricDataParams(instanceId: string, startTime: Date, endTime: Date, period: number) {
        return this.createMetricDataParams(instanceId, startTime, endTime, period);
    }

    public testProcessResult(
        timestamps: Date[] | undefined,
        values: number[] | undefined,
        period: number,
        timeRange: string
    ): MetricDataResult {
        return this.processResult(timestamps, values, period, timeRange);
    }
}

const testAwsService = new TestAwsService();

describe('AwsService', () => {
    const isCI = () => process.env.CI === 'true';
    
    beforeEach(() => {
        if (isCI()) return;
        
        const requiredEnvVars = [
            'AWS_ACCESS_ID',
            'AWS_SECRET_ACCESS_KEY',
            'AWS_REGION',
            'EC2_IP_ADDRESS'
        ];
        
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }
    });
    
    describe('getInstanceIdForIPAddress', () => {
        if (isCI()) {
            test.skip('skipped in CI', () => {});
            return;
        }

        test('should retrieve instance ID for a valid IP address', async () => {
            const ipAddress = process.env.EC2_IP_ADDRESS as string;
            const instanceId = await awsService.getInstanceIdForIPAddress(ipAddress);
            
            expect(instanceId).toBeDefined();
            expect(typeof instanceId).toBe('string');
            expect(instanceId).toMatch(/^i-[a-z0-9]+$/);
        });
        
        test('should throw error for invalid IP address', async () => {
            const invalidIp = '1.1.1.1';
            
            await expect(
                awsService.getInstanceIdForIPAddress(invalidIp)
            ).rejects.toThrow();
        });
    });
    
    describe('getMetricDataFromCloudWatch', () => {
        if (isCI()) {
            test.skip('skipped in CI', () => {});
            return;
        }

        test('should retrieve CPU metrics for a valid instance', async () => {
            const ipAddress = process.env.EC2_IP_ADDRESS as string;
            const instanceId = await awsService.getInstanceIdForIPAddress(ipAddress);
            
            const metrics = await awsService.getMetricDataFromCloudWatch(
                instanceId,
                'Last Hour',
                300 // 5-minute periods
            );
            
            expect(metrics).toBeDefined();
            expect(Array.isArray(metrics.Timestamps)).toBe(true);
            expect(Array.isArray(metrics.Values)).toBe(true);
        });
        
        test('should throw error for invalid instance ID', async () => {
            const invalidInstanceId = 'i-invalid';
            
            await expect(awsService.getMetricDataFromCloudWatch(
                invalidInstanceId,
                'Last Hour',
                300
            )).rejects.toThrow('[AwsService-processResult] Empty Timestamps or Values arrays in metric data');
        });
    });

    describe('createMetricDataParams', () => {
        test('should create valid CloudWatch parameters', () => {
            const instanceId = 'i-1234567890abcdef0';
            const startTime = new Date('2024-01-01T00:00:00Z');
            const endTime = new Date('2024-01-01T01:00:00Z');
            const period = 300;

            const command = testAwsService.testCreateMetricDataParams(
                instanceId,
                startTime,
                endTime,
                period
            );

            expect(command).toBeInstanceOf(GetMetricDataCommand);
            const params = (command as any).input;
            
            expect(params).toMatchObject({
                StartTime: startTime,
                EndTime: endTime,
                MetricDataQueries: [{
                    Id: 'cpuUtilization',
                    MetricStat: {
                        Metric: {
                            Namespace: 'AWS/EC2',
                            MetricName: 'CPUUtilization',
                            Dimensions: [{
                                Name: 'InstanceId',
                                Value: instanceId
                            }]
                        },
                        Period: period,
                        Stat: 'Average'
                    },
                    ReturnData: true
                }]
            });
        });
    });

    describe('processResult', () => {
        test('should process valid metric data correctly', () => {
            const timestamps = [
                new Date('2024-01-01T00:00:00Z'),
                new Date('2024-01-01T00:05:00Z'),
                new Date('2024-01-01T00:10:00Z')
            ];
            const values = [10.5, 20.3, 15.7];
            const period = 300;
            const timeRange = 'Last Hour';

            const result = testAwsService.testProcessResult(
                timestamps,
                values,
                period,
                timeRange
            );

            expect(result).toEqual({
                Timestamps: timestamps,
                Values: values
            });
        });

        test('should reverse arrays when timestamps are in descending order', () => {
            const timestamps = [
                new Date('2024-01-01T00:10:00Z'),
                new Date('2024-01-01T00:05:00Z'),
                new Date('2024-01-01T00:00:00Z')
            ];
            const values = [15.7, 20.3, 10.5];
            const period = 300;
            const timeRange = 'Last Hour';

            const result = testAwsService.testProcessResult(
                timestamps,
                values,
                period,
                timeRange
            );

            expect(result.Timestamps).toEqual([
                new Date('2024-01-01T00:00:00Z'),
                new Date('2024-01-01T00:05:00Z'),
                new Date('2024-01-01T00:10:00Z')
            ]);
            expect(result.Values).toEqual([10.5, 20.3, 15.7]);
        });

        test('should throw error when timestamps are undefined', () => {
            const timestamps = undefined;
            const values = [10.5, 20.3, 15.7];
            const period = 300;
            const timeRange = 'Last Hour';

            expect(() => testAwsService.testProcessResult(
                timestamps,
                values,
                period,
                timeRange
            )).toThrow('[AwsService-processResult] Missing Timestamps or Values in metric data');
        });

        test('should throw error when values are undefined', () => {
            const timestamps = [
                new Date('2024-01-01T00:00:00Z'),
                new Date('2024-01-01T00:05:00Z')
            ];
            const values = undefined;
            const period = 300;
            const timeRange = 'Last Hour';

            expect(() => testAwsService.testProcessResult(
                timestamps,
                values,
                period,
                timeRange
            )).toThrow('[AwsService-processResult] Missing Timestamps or Values in metric data');
        });

        test('should throw error when timestamps array is empty', () => {
            const timestamps: Date[] = [];
            const values = [10.5, 20.3];
            const period = 300;
            const timeRange = 'Last Hour';

            expect(() => testAwsService.testProcessResult(
                timestamps,
                values,
                period,
                timeRange
            )).toThrow('[AwsService-processResult] Empty Timestamps or Values arrays in metric data');
        });

        test('should throw error when values array is empty', () => {
            const timestamps = [
                new Date('2024-01-01T00:00:00Z'),
                new Date('2024-01-01T00:05:00Z')
            ];
            const values: number[] = [];
            const period = 300;
            const timeRange = 'Last Hour';

            expect(() => testAwsService.testProcessResult(
                timestamps,
                values,
                period,
                timeRange
            )).toThrow('[AwsService-processResult] Empty Timestamps or Values arrays in metric data');
        });
    });
}); 