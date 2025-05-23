import { Request, Response } from 'express';
import { awsService } from '../services/awsService';

interface CpuUsageRequest {
  ipAddress: string;
  periodDays: number;
  period: number;
}

/**
 * Get CPU usage metrics for a specified AWS instance
 * @param req.body.ipAddress - IP address of the AWS instance
 * @param req.body.periodDays - Time period in days to fetch data for
 * @param req.body.period - Interval between samples in seconds
 */
export const getCpuUsage = async (ipAddress: string, periodDays: number, period: number) => {
  console.log('[MetricsController] Starting CPU usage retrieval:', { ipAddress, periodDays, period });
  
  try {
    if (typeof periodDays !== 'number' || typeof period !== 'number') {
      console.log('[MetricsController] Invalid parameter types:', { periodDays, period });
      throw new Error('Invalid parameter types. periodDays and period must be numbers');
    }
    
    console.log('[MetricsController] Getting instance ID for IP:', ipAddress);
    const instanceId = await awsService.getInstanceIdForIPAddress(ipAddress);
    console.log('[MetricsController] Retrieved instance ID');
    
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (periodDays * 24 * 60 * 60 * 1000));
    console.log('[MetricsController] Fetching metrics for time range:', {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      period
    });
    
    const data = await awsService.getMetricDataFromCloudWatch(
      instanceId,
      startTime,
      endTime,
      period
    );
    
    console.log('[MetricsController] Successfully retrieved metrics data:', {
      dataPoints: data.Timestamps.length,
      firstTimestamp: data.Timestamps[0],
      lastTimestamp: data.Timestamps[data.Timestamps.length - 1]
    });
    
    return {
      Timestamps: data.Timestamps,
      Values: data.Values
    };

  } catch (error) {
    console.error('[MetricsController] Error retrieving CPU usage:', error);
    throw new Error('Error retrieving CPU usage');
  }
};
