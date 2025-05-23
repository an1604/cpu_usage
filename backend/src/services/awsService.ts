import { CloudWatch, GetMetricDataCommand, MetricDataQuery, MetricDataResult } from '@aws-sdk/client-cloudwatch';
import { EC2, DescribeInstancesCommand } from '@aws-sdk/client-ec2';

interface MetricSummary {
    metricName: string;
    totalDataPoints: number;
    timeRange: {
        start: string;
        end: string;
    };
    sampleDataPoints: Array<{
        timestamp: string;
        value: number;
    }>;
    statistics: {
        average: number;
        maximum: number;
        minimum: number;
        median: number;
        percentile95: number;
    };
    highUsageAnalysis: {
        periodsAbove90Percent: number;
        percentageOfTotal: number;
    };
}

export class AwsService {
    private cloudWatch: CloudWatch;
    private ec2: EC2;

    constructor() {
        this.cloudWatch = new CloudWatch({});
        this.ec2 = new EC2({});
    }

    /**
     * Validates if an EC2 instance exists and is accessible
     */
    async validateInstance(instanceId: string): Promise<boolean> {
        try {
            const command = new DescribeInstancesCommand({
                InstanceIds: [instanceId]
            });
            const response = await this.ec2.send(command);
            return response.Reservations?.[0]?.Instances?.[0]?.State?.Name === 'running';
        } catch (error) {
            console.error('Error validating instance:', error);
            return false;
        }
    }

    /**
     * Creates a metric data query for CPU utilization
     */
    private createMetricQuery(instanceId: string, period: number): MetricDataQuery {
        return {
            Id: 'cpuUtilization',
            MetricStat: {
                Metric: {
                    Namespace: 'AWS/EC2',
                    MetricName: 'CPUUtilization',
                    Dimensions: [
                        {
                            Name: 'InstanceId',
                            Value: instanceId
                        }
                    ]
                },
                Period: period,
                Stat: 'Average'
            },
            ReturnData: true
        };
    }

    /**
     * Processes metric data results into a summary
     */
    private processMetricData(metricData: MetricDataResult): MetricSummary {
        if (!metricData.Timestamps || !metricData.Values) {
            throw new Error('Invalid metric data: missing timestamps or values');
        }

        const values = metricData.Values.map(v => Number(v));
        const sortedValues = [...values].sort((a, b) => a - b);
        
        // Calculate statistics
        const average = values.reduce((a, b) => a + b, 0) / values.length;
        const maximum = Math.max(...values);
        const minimum = Math.min(...values);
        const median = sortedValues[Math.floor(sortedValues.length / 2)];
        const percentile95 = sortedValues[Math.floor(sortedValues.length * 0.95)];
        
        // Calculate high usage periods
        const highUsageCount = values.filter(v => v > 90).length;
        const highUsagePercentage = (highUsageCount / values.length) * 100;

        // Get sample data points (first 5)
        const sampleDataPoints = metricData.Timestamps.slice(0, 5).map((timestamp, index) => ({
            timestamp,
            value: values[index]
        }));

        return {
            metricName: metricData.Label || 'CPUUtilization',
            totalDataPoints: values.length,
            timeRange: {
                start: metricData.Timestamps[0],
                end: metricData.Timestamps[metricData.Timestamps.length - 1]
            },
            sampleDataPoints,
            statistics: {
                average,
                maximum,
                minimum,
                median,
                percentile95
            },
            highUsageAnalysis: {
                periodsAbove90Percent: highUsageCount,
                percentageOfTotal: highUsagePercentage
            }
        };
    }

    /**
     * Fetches and processes CPU utilization metrics for an EC2 instance
     */
    async getCpuUtilizationMetrics(params: {
        instanceId: string;
        periodDays?: number;
        period?: number;
    }): Promise<MetricSummary> {
        const { instanceId, periodDays = 7, period = 1800 } = params;

        // Validate instance
        const isValid = await this.validateInstance(instanceId);
        if (!isValid) {
            throw new Error(`Invalid or inaccessible instance: ${instanceId}`);
        }

        // Calculate time range
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - (periodDays * 24 * 60 * 60 * 1000));

        // Create metric query
        const metricQuery = this.createMetricQuery(instanceId, period);

        try {
            const command = new GetMetricDataCommand({
                MetricDataQueries: [metricQuery],
                StartTime: startTime,
                EndTime: endTime
            });

            const response = await this.cloudWatch.send(command);
            
            if (!response.MetricDataResults?.[0]) {
                throw new Error('No metric data returned');
            }

            return this.processMetricData(response.MetricDataResults[0]);
        } catch (error) {
            console.error('Error fetching metric data:', error);
            throw new Error(`Failed to fetch metric data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

// Example usage:
/*
const awsService = new AwsService();

try {
    const metrics = await awsService.getCpuUtilizationMetrics({
        instanceId: 'i-04a68bbbcac63d5cb',
        periodDays: 7,
        period: 1800
    });
    
    console.log('Metric Summary:', {
        name: metrics.metricName,
        totalPoints: metrics.totalDataPoints,
        timeRange: metrics.timeRange,
        statistics: {
            average: `${metrics.statistics.average.toFixed(2)}%`,
            maximum: `${metrics.statistics.maximum.toFixed(2)}%`,
            minimum: `${metrics.statistics.minimum.toFixed(2)}%`,
            median: `${metrics.statistics.median.toFixed(2)}%`,
            percentile95: `${metrics.statistics.percentile95.toFixed(2)}%`
        },
        highUsage: {
            periodsAbove90: metrics.highUsageAnalysis.periodsAbove90Percent,
            percentage: `${metrics.highUsageAnalysis.percentageOfTotal.toFixed(2)}%`
        }
    });
} catch (error) {
    console.error('Error:', error);
}
*/
