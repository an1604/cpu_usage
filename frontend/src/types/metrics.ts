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


/**
 * CpuChartProps interface
 * This interface is used to define the props for the CpuChart component.
 * @param data - The data to display in the chart
 * @param isLoading - Whether the data is still loading
 */
export interface CpuChartProps {
  data: MetricDataResult | null;
  isLoading: boolean; 
}

export interface ErrorMessageProps {
  message: string;
}

/**
 * MetricsQueryParams interface
 * This interface is used to define the parameters for the metrics query.
 * @param ipAddress - The IP address of the AWS instance
 * @param timeRange - The time range of the metrics
 * @param period - The period of the metrics
 */
export interface MetricsQueryParams {
  ipAddress: string;
  timeRange: string;
  period: number;
}

/**
 * MetricsFormProps interface
 * This interface is used to define the props for the MetricsForm component.
 * @param onSubmit - The function to call when the form is submitted
 * @param isLoading - Whether the form is loading
 */
export interface MetricsFormProps {
  onSubmit: (params: MetricsQueryParams) => void;
  isLoading: boolean;
}