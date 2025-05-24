import React, { useState } from 'react';

/**
 * MetricsQueryParams interface
 * This interface is used to define the parameters for the metrics query.
 * @param ipAddress - The IP address of the AWS instance
 * @param timeRange - The time range of the metrics
 * @param period - The period of the metrics
 */
interface MetricsQueryParams {
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
interface MetricsFormProps {
  onSubmit: (params: MetricsQueryParams) => void;
  isLoading: boolean;
}

const TIME_RANGE_OPTIONS = [
  'Last Hour',
  'Last 6 Hours',
  'Last 12 Hours',
  'Last Day',
  'Last 7 Days',
];

const PERIOD_OPTIONS = [
  60,      // 1 minute
  300,     // 5 minutes
  600,     // 10 minutes
  900,     // 15 minutes
  1800,    // 30 minutes
  3600,    // 1 hour
  7200,    // 2 hours
  14400,   // 4 hours
  28800,   // 8 hours
  43200,   // 12 hours
  86400    // 24 hours
];

const MetricsForm: React.FC<MetricsFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<MetricsQueryParams>({
    ipAddress: '',
    timeRange: 'Last Day',
    period: 3600
  });

  /**
   * handleChange function
   * This function is used to handle the change event of the form.
   * @param e - The change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'period' ? Number(value) : value
    }));
  };

  /**
   * handleSubmit function
   * This function is used to handle the submit event of the form.
   * @param e - The submit event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form 
      className="metrics-form" 
      onSubmit={handleSubmit}
      data-testid="metrics-form"
    >
      <div className="form-group">
        <label htmlFor="ipAddress">IP Address:</label>
        <input
          type="text"
          id="ipAddress"
          name="ipAddress"
          value={formData.ipAddress}
          onChange={handleChange}
          pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
          required
          placeholder="e.g. 192.168.1.1"
        />
      </div>

      <div className="form-group">
        <label htmlFor="timeRange">Time Period:</label>
        <select
          id="timeRange"
          name="timeRange"
          value={formData.timeRange}
          onChange={handleChange}
          required
        >
          {TIME_RANGE_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="period">Interval (seconds):</label>
        <select
          id="period"
          name="period"
          value={formData.period}
          onChange={handleChange}
          required
        >
          {PERIOD_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Get CPU Usage'}
      </button>
    </form>
  );
};

export default MetricsForm; 