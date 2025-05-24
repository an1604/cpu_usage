import { MetricDataResult, MetricsQueryParams } from '../types/metrics';
import { config } from '../config/config';

/**
 * Validates the metrics query parameters according to backend requirements
 * @param params Query parameters to validate
 * @throws Error if validation fails
 */
function validateMetricsParams(params: MetricsQueryParams): void {
  const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (!ipRegex.test(params.ipAddress)) {
    console.error('[API-validateMetricsParams] Invalid IP address format:', params.ipAddress);
    throw new Error('Invalid IP address format');
  }
  if (!params.timeRange || typeof params.timeRange !== 'string') {
    console.error('[API-validateMetricsParams] Invalid or missing timeRange:', params.timeRange);
    throw new Error('Invalid or missing timeRange');
  }
  if (params.period <= 0 || params.period > 86400) {
    console.error('[API-validateMetricsParams] Invalid period:', params.period);
    throw new Error('Period must be between 0 and 86400 seconds');
  }
  console.log('[API-validateMetricsParams] Validated params:', params);
}

/**
 * Formats a timestamp to show only the time in HH:mm:ss format
 * @param timestamp - ISO timestamp string
 * @returns Formatted time string
 */
function formatTimestampToTime(timestamp: string): string {
    const date = new Date(timestamp);
    const formattedTime = date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    console.log('[API-formatTimestampToTime] Formatted timestamp:', formattedTime);

    return formattedTime;
}

/**
 * Fetches CPU usage metrics data for a given instance
 * @param params Query parameters for the metrics request
 * @returns Promise containing the metrics data with formatted timestamps
 * @throws Error if validation fails or request fails
 */
export async function fetchMetricsData(params: MetricsQueryParams): Promise<MetricDataResult> {
    validateMetricsParams(params);
    console.log('[API-fetchMetricsData] Sending request with params:', JSON.stringify(params, null, 2));

    try {
        console.log('[API-fetchMetricsData] Sending request to backend URL:', config.backendUrl);
        const response = await fetch(`${config.backendUrl}/api/metrics/cpu-usage`, {
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
        console.log('[API-fetchMetricsData] Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[API-fetchMetricsData] Error response:', errorText);
            throw new Error(errorText || 'Failed to fetch metrics data');
        }

        const data = await response.json();
        console.log('[API-fetchMetricsData] Received data:', JSON.stringify(data, null, 2));

        if (!data.Timestamps || !Array.isArray(data.Timestamps) || !data.Values || !Array.isArray(data.Values)) {
            throw new Error('Invalid response format: missing required arrays');
        }

        if (data.Timestamps.length !== data.Values.length) {
            throw new Error('Invalid response format: timestamp and value arrays have different lengths');
        }

        // transform the data to match our expected format with formatted times
        return {
            Timestamps: data.Timestamps.map(formatTimestampToTime),
            Values: data.Values
        };
    } catch (error) {
        console.error('[API-fetchMetricsData] Request failed:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred');
    }
}
