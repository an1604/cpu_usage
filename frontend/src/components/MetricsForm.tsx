import React, { useState } from 'react';

interface MetricsQueryParams {
  ipAddress: string;
  periodDays: number;
  period: number;
}

interface MetricsFormProps {
  onSubmit: (params: MetricsQueryParams) => void;
  isLoading: boolean;
}

const MetricsForm: React.FC<MetricsFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<MetricsQueryParams>({
    ipAddress: '',
    periodDays: 1,
    period: 3600
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ipAddress' ? value : Number(value)
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
        <label htmlFor="periodDays">Time Period (days):</label>
        <input
          type="number"
          id="periodDays"
          name="periodDays"
          value={formData.periodDays}
          onChange={handleChange}
          min="1"
          max="14"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="period">Interval (seconds):</label>
        <input
          type="number"
          id="period"
          name="period"
          value={formData.period}
          onChange={handleChange}
          min="60"
          max="86400"
          step="60"
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