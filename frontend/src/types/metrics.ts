export interface MetricsQueryParams {
  ipAddress: string;
  timeRange: string;
  period: number;
}

/**
 * Response data structure for metric results
 */
export interface MetricDataResult {
  Timestamps: string[];
  Values: number[];
}

/**
 * Structure for error responses
 */
export interface ErrorResponse {
  status: number;
  message: string;
  error?: string;
} 