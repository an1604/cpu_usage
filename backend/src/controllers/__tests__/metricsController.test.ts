import { Request, Response } from 'express';
import { awsService } from '../../services/awsService';
import { getCpuUsage } from '../metricsController';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock the AWS service
jest.mock('../../services/awsService', () => ({
  awsService: {
    getInstanceIdForIPAddress: jest.fn(),
    getMetricDataFromCloudWatch: jest.fn()
  }
}));

describe('Metrics Controller', () => {
  let mockReq: Partial<Request>;
  
  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {
        ipAddress: '172.31.88.161',
        periodDays: 1,
        period: 3600
      }
    };
  });

  it('should return CPU usage data successfully', async () => {
    const mockInstanceId = 'i-1234567890abcdef0';
    const mockMetricData = {
      Timestamps: [new Date('2023-01-01T00:00:00Z')],
      Values: [42.5]
    };

    const mockGetInstanceId = awsService.getInstanceIdForIPAddress as jest.MockedFunction<typeof awsService.getInstanceIdForIPAddress>;
    const mockGetMetrics = awsService.getMetricDataFromCloudWatch as jest.MockedFunction<typeof awsService.getMetricDataFromCloudWatch>;

    mockGetInstanceId.mockResolvedValue(mockInstanceId);
    mockGetMetrics.mockResolvedValue(mockMetricData);

    const result = await getCpuUsage(mockReq.body.ipAddress, mockReq.body.periodDays, mockReq.body.period);

    expect(result).toEqual({
      Timestamps: mockMetricData.Timestamps,
      Values: mockMetricData.Values
    });
  });

  it('should handle invalid parameter types', async () => {
    mockReq.body = {
      ipAddress: '172.31.88.161',
      periodDays: '1' as any, // Invalid type
      period: 3600
    };

    await expect(getCpuUsage(mockReq.body.ipAddress, mockReq.body.periodDays, mockReq.body.period))
      .rejects
      .toThrow('Error retrieving CPU usage');
  });

  it('should handle error when instance ID is not found', async () => {
    const errorMessage = 'Instance not found';
    const mockGetInstanceId = awsService.getInstanceIdForIPAddress as jest.MockedFunction<typeof awsService.getInstanceIdForIPAddress>;
    
    mockGetInstanceId.mockRejectedValue(new Error(errorMessage));

    await expect(getCpuUsage(mockReq.body.ipAddress, mockReq.body.periodDays, mockReq.body.period))
      .rejects
      .toThrow('Error retrieving CPU usage');
  });

  it('should handle error when getting metrics fails', async () => {
    const mockInstanceId = 'i-1234567890abcdef0';
    const errorMessage = 'Failed to fetch metrics';
    
    const mockGetInstanceId = awsService.getInstanceIdForIPAddress as jest.MockedFunction<typeof awsService.getInstanceIdForIPAddress>;
    const mockGetMetrics = awsService.getMetricDataFromCloudWatch as jest.MockedFunction<typeof awsService.getMetricDataFromCloudWatch>;

    mockGetInstanceId.mockResolvedValue(mockInstanceId);
    mockGetMetrics.mockRejectedValue(new Error(errorMessage));
    
    await expect(getCpuUsage(mockReq.body.ipAddress, mockReq.body.periodDays, mockReq.body.period))
      .rejects
      .toThrow('Error retrieving CPU usage');
  });
}); 