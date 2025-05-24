import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { ChartConfiguration } from 'chart.js';
import { MetricDataResult } from '../types/metrics';

interface CpuChartProps {
  data: MetricDataResult | null;
  isLoading: boolean;
}

export const CpuChart: React.FC<CpuChartProps> = ({ data, isLoading }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!data || !chartRef.current || isLoading) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: data.Timestamps,
        datasets: [
          {
            label: 'CPU Usage (%)',
            data: data.Values,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderWidth: 2,
            cubicInterpolationMode: 'monotone',
            pointRadius: 1,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time',
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'CPU Usage (%)',
            },
            min: 0.5,
            max: 3.0,
            ticks: {
              stepSize: 0.5,
              callback: function(tickValue: number | string) {
                return typeof tickValue === 'number' ? tickValue.toFixed(1) : tickValue;
              }
            }
          },
        },
        plugins: {
          title: {
            display: true,
            text: 'AWS Instance CPU Usage',
            font: {
              size: 16,
            },
          },
          tooltip: {
            callbacks: {
              label: (context: any) => `CPU: ${context.raw}%`,
            },
          },
        },
      },
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, isLoading]);

  if (isLoading) {
    return <div className="loading">Loading chart data...</div>;
  }

  if (!data) {
    return <div className="chart-placeholder">No data to display</div>;
  }

  return (
    <div className="chart-container">
      <canvas ref={chartRef} height="400"></canvas>
    </div>
  );
}; 