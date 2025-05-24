import { ChartConfiguration, ScaleOptionsByType, Plugin } from 'chart.js';
import { getChartConfig } from '../CpuChart';

type ChartConfigWithScales = ChartConfiguration<'line'> & {
  options: NonNullable<ChartConfiguration<'line'>['options']> & {
    scales: {
      x: NonNullable<ScaleOptionsByType<'category'>>;
      y: NonNullable<ScaleOptionsByType<'linear'>> & {
        min: number;
        max: number;
        ticks: {
          stepSize: number;
          callback: (value: number | string) => string;
        };
      };
    };
    plugins: {
      title: {
        display: boolean;
        text: string;
        font: { size: number };
      };
      tooltip: {
        callbacks: {
          label: (context: any) => string;
        };
      };
    };
  };
};

describe('getChartConfig', () => {
  const mockTimestamps = ['2024-01-01T00:00:00Z', '2024-01-01T00:05:00Z'];
  const mockValues = [1.5, 2.0];

  it('should return a valid chart configuration', () => {
    const config = getChartConfig(mockTimestamps, mockValues);
    
    expect(config).toBeDefined();
    expect(config.type).toBe('line');
    expect(config.data).toBeDefined();
    expect(config.options).toBeDefined();
  });

  it('should correctly set the data labels and values', () => {
    const config = getChartConfig(mockTimestamps, mockValues);
    
    expect(config.data.labels).toEqual(mockTimestamps);
    expect(config.data.datasets[0].data).toEqual(mockValues);
    expect(config.data.datasets[0].label).toBe('CPU Usage (%)');
  });

  it('should have correct styling configuration', () => {
    const config = getChartConfig(mockTimestamps, mockValues);
    const dataset = config.data.datasets[0];

    expect(dataset.borderColor).toBe('rgb(255, 99, 132)');
    expect(dataset.backgroundColor).toBe('rgba(255, 99, 132, 0.2)');
    expect(dataset.borderWidth).toBe(2);
    expect(dataset.cubicInterpolationMode).toBe('monotone');
    expect(dataset.pointRadius).toBe(1);
    expect(dataset.pointHoverRadius).toBe(5);
  });

  it('should have correct axis configuration', () => {
    const config = getChartConfig(mockTimestamps, mockValues) as ChartConfigWithScales;
    const { x, y } = config.options.scales;

    expect(x.title?.display).toBe(true);
    expect(x.title?.text).toBe('Time');
    expect(x.ticks?.maxRotation).toBe(45);
    expect(x.ticks?.minRotation).toBe(45);

    expect(y.title?.display).toBe(true);
    expect(y.title?.text).toBe('CPU Usage (%)');
    expect(y.min).toBe(0.5);
    expect(y.max).toBe(3.0);
    expect(y.ticks?.stepSize).toBe(0.5);
    expect(typeof y.ticks?.callback).toBe('function');
  });

  it('should format y-axis ticks correctly', () => {
    const config = getChartConfig(mockTimestamps, mockValues) as ChartConfigWithScales;
    const callback = config.options.scales.y.ticks.callback;

    expect(callback(1.5)).toBe('1.5');
    expect(callback(2.0)).toBe('2.0');
    expect(callback('custom')).toBe('custom');
  });

  it('should have correct plugin configuration', () => {
    const config = getChartConfig(mockTimestamps, mockValues) as ChartConfigWithScales;
    const { title, tooltip } = config.options.plugins;

    expect(title.display).toBe(true);
    expect(title.text).toBe('AWS Instance CPU Usage');
    expect(title.font.size).toBe(16);

    expect(typeof tooltip.callbacks.label).toBe('function');
    const labelCallback = tooltip.callbacks.label;
    expect(labelCallback({ raw: 1.5 })).toBe('CPU: 1.5%');
  });

  it('should have correct chart options', () => {
    const config = getChartConfig(mockTimestamps, mockValues) as ChartConfiguration<'line'> & { 
      options: NonNullable<ChartConfiguration<'line'>['options']> 
    };
    
    expect(config.options.responsive).toBe(true);
    expect(config.options.maintainAspectRatio).toBe(false);
  });
}); 