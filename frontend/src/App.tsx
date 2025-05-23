import React, { useState } from 'react';
import MetricsForm from './components/MetricsForm';
import ErrorMessage from './components/ErrorMessage';
import { CpuChart } from './components/CpuChart';
import { fetchMetricsData } from './services/api';
import { MetricDataResult } from './types/metrics';
import type { MetricsQueryParams } from './types/metrics';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metricsData, setMetricsData] = useState<MetricDataResult | null>(null);

  const handleMetricsSubmit = async (params: MetricsQueryParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchMetricsData(params);
      console.log(`[App] data: ${data}`);
      setMetricsData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metrics data. Please try again.';
      setError(errorMessage);
      console.error('Error fetching metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AWS Instance CPU Usage Monitor</h1>
      </header>
      
      <main className="App-main">
        <section className="form-section">
          <h2>Query Parameters</h2>
          <div className="form-container">
            <MetricsForm onSubmit={handleMetricsSubmit} isLoading={isLoading} />
            {error && <ErrorMessage message={error} />}
          </div>
        </section>
        
        {metricsData && (
          <section className="results-section">
            <h2>CPU Usage Over Time</h2>
            <CpuChart data={metricsData} isLoading={isLoading} />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
