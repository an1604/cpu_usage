import React, { useState } from 'react';

interface MetricsQueryParams {
  ipAddress: string;
  timeRange: string;
  period: number;
}

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

const MetricsForm: React.FC<MetricsFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<MetricsQueryParams>({
    ipAddress: '',
    timeRange: 'Last Day',
    period: 3600
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'period' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="metrics-form">
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
        <input
          type="number"
          id="period"
          name="period"
          value={formData.period}
          onChange={handleChange}
          min="1"
          max="86400"
          step="1"
          required
        />
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Get CPU Usage'}
      </button>
    </form>
  );
};

export default MetricsForm; 