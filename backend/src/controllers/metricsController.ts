import { awsService } from '../services/awsService';

/**
 * Get CPU usage metrics for a specified AWS instance
 * @param ipAddress - IP address of the AWS instance
 * @param timeRange - Time range string (e.g., "Last Hour", "Last Day", "Last 7 Days")
 * @param period - Interval between samples in seconds
 */
export async function getCpuUsage(ipAddress: string, timeRange: string, period: number) {
  console.log('[MetricsController-getCpuUsage] Starting CPU usage retrieval:', { ipAddress, timeRange, period });
  
  try {
    if (typeof timeRange !== 'string' || typeof period !== 'number') {
      console.log('[MetricsController-getCpuUsage] Invalid parameter types:', { timeRange, period });
      throw new Error('Invalid parameter types. timeRange must be a string and period must be a number');
    }

    const validTimeRanges = ['Last Hour', 'Last 6 Hours', 'Last 12 Hours', 'Last Day', 'Last 7 Days'];
    if (!validTimeRanges.includes(timeRange)) {
      throw new Error(`Invalid time range. Must be one of: ${validTimeRanges.join(', ')}`);
    }
    
    console.log('[MetricsController-getCpuUsage] Getting instance ID for IP:', ipAddress);
    const instanceId = await awsService.getInstanceIdForIPAddress(ipAddress);
    console.log('[MetricsController-getCpuUsage] Retrieved instance ID:', instanceId);
    
    console.log('[MetricsController-getCpuUsage] Fetching metrics for time range:', {
      timeRange,
      period
    });
    
    const data = await awsService.getMetricDataFromCloudWatch(
      instanceId,
      timeRange,
      period
    );
    
    console.log('[MetricsController-getCpuUsage] Successfully retrieved metrics data:', {
      dataPoints: data.Timestamps.length,
      firstTimestamp: data.Timestamps[0],
      lastTimestamp: data.Timestamps[data.Timestamps.length - 1],
      timeRange,
      period
    });
    
    return data;

  } catch (error) {
    console.error('[MetricsController-getCpuUsage] Error retrieving CPU usage:', error);
    throw error instanceof Error ? error : new Error('Error retrieving CPU usage');
  }
}
