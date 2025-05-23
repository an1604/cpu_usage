export interface MetricsQueryParams {
  ipAddress: string;
  periodDays: number;
  period: number;
}

/**
 * Response data structure for metric results
 */
export interface Datapoint {
  Timestamp: string;
  Average: number;
}

export interface MetricDataResult {
  Datapoints: Datapoint[];
}

/**
 * Structure for error responses
 */
export interface ErrorResponse {
  status: number;
  message: string;
  error?: string;
} 