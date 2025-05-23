import React, { useState } from 'react';
import MetricsForm from './components/MetricsForm';
import './App.css';

interface MetricDataResult {
  Timestamps: string[];
  Values: number[];
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metricsData, setMetricsData] = useState<MetricDataResult | null>(null);

  const handleMetricsSubmit = async (params: { ipAddress: string; periodDays: number; period: number }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implement actual API call here
      console.log('Form submitted with params:', params);
      // For now, just simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMetricsData({
        Timestamps: ['2024-03-20T00:00:00Z'],
        Values: [50]
      });
    } catch (err) {
      setError('Failed to fetch metrics data. Please try again.');
      console.error(err);
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
          <MetricsForm onSubmit={handleMetricsSubmit} isLoading={isLoading} />
        </section>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {metricsData && (
          <section className="results-section">
            <h2>Results</h2>
            <pre>{JSON.stringify(metricsData, null, 2)}</pre>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
