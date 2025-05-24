import { Request, Response } from 'express';
import { awsService } from '../../services/awsService';
import { getCpuUsage, validateParams } from '../metricsController';
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
        timeRange: 'Last Day',
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

    const result = await getCpuUsage(mockReq.body.ipAddress, mockReq.body.timeRange, mockReq.body.period);

    expect(result).toEqual({
      Timestamps: mockMetricData.Timestamps,
      Values: mockMetricData.Values
    });
  });

  it('should handle invalid parameter types', async () => {
    mockReq.body = {
      ipAddress: '172.31.88.161',
      timeRange: undefined,
      period: 3600
    };

    await expect(getCpuUsage(mockReq.body.ipAddress, mockReq.body.timeRange, mockReq.body.period))
      .rejects
      .toThrow('Invalid parameter types. timeRange must be a string and period must be a number');
  });

  it('should handle error when instance ID is not found', async () => {
    const errorMessage = 'No instance found for the given IP address';
    const mockGetInstanceId = awsService.getInstanceIdForIPAddress as jest.MockedFunction<typeof awsService.getInstanceIdForIPAddress>;
    
    mockGetInstanceId.mockRejectedValue(new Error(errorMessage));

    await expect(getCpuUsage(mockReq.body.ipAddress, mockReq.body.timeRange, mockReq.body.period))
      .rejects
      .toThrow(errorMessage);
  });

  it('should handle error when getting metrics fails', async () => {
    const mockInstanceId = 'i-1234567890abcdef0';
    const errorMessage = 'Failed to fetch metrics';
    
    const mockGetInstanceId = awsService.getInstanceIdForIPAddress as jest.MockedFunction<typeof awsService.getInstanceIdForIPAddress>;
    const mockGetMetrics = awsService.getMetricDataFromCloudWatch as jest.MockedFunction<typeof awsService.getMetricDataFromCloudWatch>;

    mockGetInstanceId.mockResolvedValue(mockInstanceId);
    mockGetMetrics.mockRejectedValue(new Error(errorMessage));
    
    await expect(getCpuUsage(mockReq.body.ipAddress, mockReq.body.timeRange, mockReq.body.period))
      .rejects
      .toThrow(errorMessage);
  });
});

describe('validateParams helper function', () => {
  it('should validate correct parameters successfully', () => {
    expect(() => validateParams('172.31.88.161', 'Last Hour', 300)).not.toThrow();
    expect(() => validateParams('172.31.88.161', 'Last 6 Hours', 3600)).not.toThrow();
    expect(() => validateParams('172.31.88.161', 'Last 12 Hours', 7200)).not.toThrow();
    expect(() => validateParams('172.31.88.161', 'Last Day', 86400)).not.toThrow();
    expect(() => validateParams('172.31.88.161', 'Last 7 Days', 86400)).not.toThrow();
  });

  it('should throw error for invalid timeRange type', () => {
    expect(() => validateParams('172.31.88.161', undefined as any, 300))
      .toThrow('Invalid parameter types. timeRange must be a string and period must be a number');
    expect(() => validateParams('172.31.88.161', null as any, 300))
      .toThrow('Invalid parameter types. timeRange must be a string and period must be a number');
    expect(() => validateParams('172.31.88.161', 123 as any, 300))
      .toThrow('Invalid parameter types. timeRange must be a string and period must be a number');
  });

  it('should throw error for invalid period type', () => {
    expect(() => validateParams('172.31.88.161', 'Last Hour', '300' as any))
      .toThrow('Invalid parameter types. timeRange must be a string and period must be a number');
    expect(() => validateParams('172.31.88.161', 'Last Hour', undefined as any))
      .toThrow('Invalid parameter types. timeRange must be a string and period must be a number');
    expect(() => validateParams('172.31.88.161', 'Last Hour', null as any))
      .toThrow('Invalid parameter types. timeRange must be a string and period must be a number');
  });

  it('should throw error for invalid timeRange values', () => {
    expect(() => validateParams('172.31.88.161', 'Last 2 Hours', 300))
      .toThrow('Invalid time range. Must be one of: Last Hour, Last 6 Hours, Last 12 Hours, Last Day, Last 7 Days');
    expect(() => validateParams('172.31.88.161', 'Last Week', 300))
      .toThrow('Invalid time range. Must be one of: Last Hour, Last 6 Hours, Last 12 Hours, Last Day, Last 7 Days');
    expect(() => validateParams('172.31.88.161', '', 300))
      .toThrow('Invalid time range. Must be one of: Last Hour, Last 6 Hours, Last 12 Hours, Last Day, Last 7 Days');
  });

  it('should throw error for invalid period values', () => {
    expect(() => validateParams('172.31.88.161', 'Last Hour', 30))
      .toThrow('Invalid period. Must be between 60 and 86400 seconds');
    expect(() => validateParams('172.31.88.161', 'Last Hour', 0))
      .toThrow('Invalid period. Must be between 60 and 86400 seconds');
    expect(() => validateParams('172.31.88.161', 'Last Hour', 86401))
      .toThrow('Invalid period. Must be between 60 and 86400 seconds');
    expect(() => validateParams('172.31.88.161', 'Last Hour', 100000))
      .toThrow('Invalid period. Must be between 60 and 86400 seconds');
  });
}); 