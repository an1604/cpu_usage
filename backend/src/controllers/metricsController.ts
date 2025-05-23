import { Request, Response } from 'express';
import { awsService } from '../services/awsService';
import { MetricsQueryParams } from '../types/metrics';

/**
 * Get CPU usage metrics for a specified AWS instance
 */
export const getCpuUsage = async (req: Request, res: Response) => {
  try {
    const { ipAddress, periodDays, period } = req.query as unknown as MetricsQueryParams;
    
    const instanceId = await awsService.getInstanceIdForIPAddress(ipAddress);
    
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (periodDays * 24 * 60 * 60 * 1000));
    
    const data = await awsService.getMetricDataFromCloudWatch(
      instanceId,
      startTime,
      endTime,
      Number(period)
    );
    
    return res.status(200).json({
      Timestamps: data.Timestamps,
      Values: data.Values
    });

  } catch (error) {
    console.error('Error retrieving CPU usage:', error);
    return res.status(500).json({
      status: 500,
      message: 'Error retrieving CPU usage',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
