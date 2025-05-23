/**
 * Interface for query parameters when requesting metrics data
 */
export interface MetricsQueryParams {
  ipAddress: string;      // IP address of the AWS instance
  timeRange: string;     // Time period in days to fetch data for
  period: number;         // Interval between samples in seconds
}

/**
 * Interface for metric data results returned from CloudWatch
 */
export interface MetricDataResult {
  Timestamps: Date[];     // Array of timestamps for the metric data points
  Values: number[];       // Array of CPU usage values corresponding to timestamps
}

/**
 * Interface for error response structure
 */
export interface ErrorResponse {
  status: number;         // HTTP status code
  message: string;        // Error message
  error?: string;         // Optional additional error details
}
