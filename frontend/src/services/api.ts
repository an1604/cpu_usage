import { MetricsQueryParams, MetricDataResult, ErrorResponse } from '../types/metrics';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

/**
 * Fetches CPU usage metrics data for a given instance
 * @param params Query parameters for the metrics request
 * @returns Promise containing the metrics data
 * @throws Error if the request fails
 */
export async function fetchMetricsData(params: MetricsQueryParams): Promise<MetricDataResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/metrics`, {
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
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching metrics data');
  }
}
