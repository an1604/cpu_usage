import { MetricsQueryParams, MetricDataResult, ErrorResponse } from '../types/metrics';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

/**
 * Validates the metrics query parameters according to backend requirements
 * @param params Query parameters to validate
 * @throws Error if validation fails
 */
function validateMetricsParams(params: MetricsQueryParams): void {
  const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (!ipRegex.test(params.ipAddress)) {
    throw new Error('Invalid IP address format');
  }
  if (params.periodDays < 1 || params.periodDays > 14) {
    throw new Error('Period days must be between 1 and 14');
  }
  if (params.period < 60 || params.period > 86400) {
    throw new Error('Period must be between 60 and 86400 seconds');
  }
}

/**
 * Fetches CPU usage metrics data for a given instance
 * @param params Query parameters for the metrics request
 * @returns Promise containing the metrics data
 * @throws Error if validation fails or request fails
 */
export async function fetchMetricsData(params: MetricsQueryParams): Promise<MetricDataResult> {
  validateMetricsParams(params);

  try {
    const response = await fetch(`${API_BASE_URL}/api/metrics/cpu-usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.message || 'Failed to fetch metrics data');
    }

    const data: MetricDataResult = await response.json();
    return {
      ...data,
      Timestamps: data.Timestamps.map(timestamp => new Date(timestamp))
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching metrics data');
  }
}
