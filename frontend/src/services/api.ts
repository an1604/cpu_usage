import { MetricDataResult, MetricsQueryParams, ErrorResponse } from '../types/metrics';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

/**
 * Validates the metrics query parameters according to backend requirements
 * @param params Query parameters to validate
 * @throws Error if validation fails
 */
function validateMetricsParams(params: MetricsQueryParams): void {
  const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (!ipRegex.test(params.ipAddress)) {
    console.error('[API] Invalid IP address format:', params.ipAddress);
    throw new Error('Invalid IP address format');
  }
  if (!params.timeRange || typeof params.timeRange !== 'string') {
    console.error('[API] Invalid or missing timeRange:', params.timeRange);
        throw new Error('Invalid or missing timeRange');
  }
  if (params.period <= 0 || params.period > 86400) {
    console.error('[API] Invalid period:', params.period);
    throw new Error('Period must be between 0 and 86400 seconds');
  }
  console.log('[API] Validated params:', params);
}

/**
 * Fetches CPU usage metrics data for a given instance
 * @param params Query parameters for the metrics request
 * @returns Promise containing the metrics data
 * @throws Error if validation fails or request fails
 */
export async function fetchMetricsData(params: MetricsQueryParams): Promise<MetricDataResult> {
  validateMetricsParams(params);
  console.log('[API] Sending request with params:', JSON.stringify(params, null, 2));

  try {
    const response = await fetch(`${API_BASE_URL}/api/metrics/cpu-usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ipAddress: params.ipAddress,
        timeRange: params.timeRange,
        period: Number(params.period)
      })
    });

    console.log('[API] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Error response:', errorText);
      throw new Error(errorText || 'Failed to fetch metrics data');
    }

    const data = await response.json();
    console.log('[API] Received data:', JSON.stringify(data, null, 2));

    if (!data.Timestamps || !Array.isArray(data.Timestamps)) {
      throw new Error('Invalid response format: missing Timestamps array');
    }

    // Transform the data to match our expected format
    return {
      Datapoints: data.Timestamps.map((timestamp: string, index: number) => ({
        Timestamp: timestamp,
        Average: data.Values[index]
      }))
    };
  } catch (error) {
    console.error('[API] Request failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}
