import React, { useState } from 'react';
import { MetricsFormProps, MetricsQueryParams } from '../types/metrics';
import { TIME_RANGE_OPTIONS, PERIOD_OPTIONS } from '../constants';

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