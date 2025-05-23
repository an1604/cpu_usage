export interface MetricsQueryParams {
  ipAddress: string;
  periodDays: number;
  period: number;
}

/**
 * Response data structure for metric results
 */
export interface MetricDataResult {
  Timestamps: Date[];
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