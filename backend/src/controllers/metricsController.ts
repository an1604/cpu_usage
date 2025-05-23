import { Request, Response } from 'express';
import { awsService } from '../services/awsService';

interface CpuUsageRequest {
  ipAddress: string;
  timeRange: string;
  period: number;
}

const TIME_RANGE_TO_MS: Record<string, number> = {
  'Last Hour': 1 * 60 * 60 * 1000,
  'Last 6 Hours': 6 * 60 * 60 * 1000,
  'Last 12 Hours': 12 * 60 * 60 * 1000,
  'Last Day': 24 * 60 * 60 * 1000,
  'Last 7 Days': 7 * 24 * 60 * 60 * 1000,
};

function getTimeWindowFromRange(timeRange: string): { startTime: Date; endTime: Date } {
  const endTime = new Date();
  const durationMs = TIME_RANGE_TO_MS[timeRange];

  if (!durationMs) {
    throw new Error(`Unsupported timeRange: ${timeRange}`);
  }

  const startTime = new Date(endTime.getTime() - durationMs);
  return { startTime, endTime };
}

/**
 * Get CPU usage metrics for a specified AWS instance
 * @param req.body.ipAddress - IP address of the AWS instance
 * @param req.body.periodDays - Time period in days to fetch data for
 * @param req.body.period - Interval between samples in seconds
 */
export async function getCpuUsage(ipAddress: string, timeRange: string, period: number) {
  console.log('[MetricsController] Starting CPU usage retrieval:', { ipAddress, timeRange, period });
  
  try {
    if (typeof timeRange !== 'string' || typeof period !== 'number') {
      console.log('[MetricsController] Invalid parameter types:', { timeRange, period });
      throw new Error('Invalid parameter types. timeRange and period must be numbers');
    }
    
    console.log('[MetricsController] Getting instance ID for IP:', ipAddress);
    const instanceId = await awsService.getInstanceIdForIPAddress(ipAddress);
    console.log('[MetricsController] Retrieved instance ID');
    
    const { startTime, endTime } = getTimeWindowFromRange(timeRange);
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
}
