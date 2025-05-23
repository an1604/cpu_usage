import { Router, RequestHandler } from 'express';
import { getCpuUsage } from '../controllers/metricsController';

const router = Router();

// POST /api/metrics/cpu-usage - Get CPU usage metrics for an AWS instance
// Request body:
// {
//   ipAddress: string,    // IP address of the AWS instance
//   timeRange: string,    // Time range, e.g., "Last Day", "Last Hour"
//   period: number        // Interval between samples in seconds
// }
const cpuUsageHandler: RequestHandler = async (req, res, next) => {
  console.log('[MetricsRoute] Received CPU usage request:', {
    ipAddress: req.body.ipAddress,
    timeRange: req.body.timeRange,
    period: req.body.period
  });

  try {
    const { ipAddress, timeRange, period } = req.body;
    
    if (!ipAddress || !timeRange || !period) {
      console.log('[MetricsRoute] Missing required parameters');
      res.status(400).json({
        error: 'Missing required parameters. Please provide ipAddress, timeRange, and period'
      });
      return;
    }

    console.log('[MetricsRoute] Calling getCpuUsage controller');
    const result = await getCpuUsage(ipAddress, timeRange, period);
    console.log('[MetricsRoute] Successfully retrieved CPU usage data');
    res.json(result);
  } catch (error) {
    console.error('[MetricsRoute] Error in CPU usage route:', error);
    res.status(500).json({
      error: 'Failed to fetch CPU usage data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

router.post('/cpu-usage', cpuUsageHandler);

export default router; 