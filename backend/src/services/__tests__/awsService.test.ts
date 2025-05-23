import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import { AwsService } from '../awsService';

describe('AwsService', () => {
    let awsService: AwsService;
    
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
        
        awsService = new AwsService();
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
            
            const endTime = new Date();
            const startTime = new Date(endTime.getTime() - 60 * 60 * 1000);
            
            const metrics = await awsService.getMetricDataFromCloudWatch(
                instanceId,
                startTime,
                endTime,
                300 // 5-minute periods
            );
            
            expect(metrics).toBeDefined();
            expect(metrics.Label).toBe('CPUUtilization');
            expect(Array.isArray(metrics.Timestamps)).toBe(true);
            expect(Array.isArray(metrics.Values)).toBe(true);
            expect(metrics.StatusCode).toBe('Complete');
        });
        
        test('should return empty data for invalid instance ID', async () => {
            const invalidInstanceId = 'i-invalid';
            const endTime = new Date();
            const startTime = new Date(endTime.getTime() - 60 * 60 * 1000);
            
            const metrics = await awsService.getMetricDataFromCloudWatch(
                invalidInstanceId,
                startTime,
                endTime
            );
            
            expect(metrics).toBeDefined();
            expect(metrics.Timestamps).toHaveLength(0);
            expect(metrics.Values).toHaveLength(0);
            expect(metrics.StatusCode).toBe('Complete');
        });
    });
}); 