import { CloudWatchClient, GetMetricDataCommand, ScanBy } from '@aws-sdk/client-cloudwatch';
import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import { config } from '../config/config';
import { MetricDataResult } from '../types/metrics';

if (!config) {
    throw new Error('Configuration not initialized');
}

const awsConfig = {
    region: config.awsRegion,
    credentials: {
        accessKeyId: config.awsAccessId,
        secretAccessKey: config.awsSecretAccessKey,
    }
} as const;

export class AwsService {
    private static instance: AwsService;
    private cloudWatchClient: CloudWatchClient;
    private ec2Client: EC2Client;

    private readonly TIME_RANGE_MAP: Record<string, number> = {
        'Last Hour': 60 * 60 * 1000,
        'Last 6 Hours': 6 * 60 * 60 * 1000,
        'Last 12 Hours': 12 * 60 * 60 * 1000,
        'Last Day': 24 * 60 * 60 * 1000,
        'Last 7 Days': 7 * 24 * 60 * 60 * 1000
    } as const;

    private constructor() {
        console.log('[AwsService-constructor] Initializing AWS service with region:', config.awsRegion);
        this.cloudWatchClient = new CloudWatchClient(awsConfig);
        this.ec2Client = new EC2Client(awsConfig);
    }

    public static getInstance(): AwsService {
        if (!AwsService.instance) {
            console.log('[AwsService-getInstance] Creating new AWS service instance');
            AwsService.instance = new AwsService();
        }
        return AwsService.instance;
    }

    /**
     * Gets instance ID from private IP address
     * @param ipAddress - The private IP address of the EC2 instance to get the instance ID for
     * @returns The instance ID of the EC2 instance
     */
    async getInstanceIdForIPAddress(ipAddress: string): Promise<string> {
        console.log('[AwsService-getInstanceIdForIPAddress] Looking up instance ID for IP:', ipAddress);
        
        const params = {
            Filters: [
                {
                    Name: 'private-ip-address',
                    Values: [ipAddress],
                },
            ],
        };

        try {
            console.log('[AwsService-getInstanceIdForIPAddress] Sending DescribeInstances request to EC2');
            const data = await this.ec2Client.send(new DescribeInstancesCommand(params));

            if (!data.Reservations?.[0]?.Instances?.[0]?.InstanceId) {
                console.log('[AwsService-getInstanceIdForIPAddress] No instance found for IP:', ipAddress);
                throw new Error('No instance found for the given IP address');
            }
            
            const instanceId = data.Reservations[0].Instances[0].InstanceId;
            console.log('[AwsService-getInstanceIdForIPAddress] Found instance ID!');
            return instanceId;
        } catch (error) {
            console.error('[AwsService-getInstanceIdForIPAddress] Error fetching instance ID:', error);
            throw error;
        }
    }

    /**
     * Determines the appropriate period for CloudWatch metrics based on the time range
     * @param startTime - The start time of the metrics
     * @param endTime - The end time of the metrics
     * @returns The appropriate period in seconds
     */
    private determinePeriod(startTime: Date, endTime: Date): number {
        const now = new Date();
        console.log('[AwsService-determinePeriod] Start time:', startTime);
        console.log('[AwsService-determinePeriod] End time:', endTime);
        
        const hoursAgo = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        const daysAgo = hoursAgo / 24;
        console.log('[AwsService-determinePeriod] Hours ago:', hoursAgo);
        console.log('[AwsService-determinePeriod] Days ago:', daysAgo);

        if (hoursAgo <= 3) {
            // For data less than 3 hours ago, use 1-minute periods
            console.log('[AwsService-determinePeriod] Using 1-minute period');
            return 60;
        } else if (daysAgo <= 15) {
            // For data between 3 hours and 15 days ago, use 5-minute periods
            console.log('[AwsService-determinePeriod] Using 5-minute period');
            return 300;
        } else if (daysAgo <= 63) {
            // For data between 15 and 63 days ago, use 15-minute periods
            console.log('[AwsService-determinePeriod] Using 15-minute period');
            return 900;
        } else {
            // For data greater than 63 days ago, use 1-hour periods
            console.log('[AwsService-determinePeriod] Using 1-hour period');
            return 3600;
        }
    }

    /**
     * Converts a time range string to start and end dates
     * @param timeRange - The time range string (e.g., "Last Hour", "Last Day", "Last 7 Days")
     * @returns Object containing start and end dates
     */
    private convertTimeRangeToDates(timeRange: string): { startTime: Date; endTime: Date } {
        const endTime = new Date();
        const milliseconds = this.TIME_RANGE_MAP[timeRange] ?? this.TIME_RANGE_MAP['Last Day'];
        
        if (!this.TIME_RANGE_MAP[timeRange]) {
            console.warn('[AwsService-convertTimeRangeToDates] Unrecognized time range, defaulting to Last Day:', timeRange);
        }

        const startTime = new Date(endTime.getTime() - milliseconds);
        console.log('[AwsService-convertTimeRangeToDates] Start time:', startTime);
        console.log('[AwsService-convertTimeRangeToDates] End time:', endTime);
        startTime.setSeconds(0, 0);
        endTime.setSeconds(0, 0);

        return { startTime, endTime };
    }

    /**
     * Gets CPU utilization metrics from CloudWatch
     * @param instanceId - The ID of the EC2 instance to get metrics for
     * @param timeRange - The time range string (e.g., "Last Hour", "Last Day", "Last 7 Days")
     * @param period - The period in seconds for the metrics
     * @returns The CPU utilization metrics
     */
    async getMetricDataFromCloudWatch(
        instanceId: string,
        timeRange: string,
        period: number
    ): Promise<MetricDataResult> {
        const { startTime, endTime } = this.convertTimeRangeToDates(timeRange);
        
        const actualPeriod = this.determinePeriod(startTime, endTime);
        if (period < actualPeriod) {
            console.warn(`[AwsService-getMetricDataFromCloudWatch] Requested period ${period}s is less than minimum ${actualPeriod}s for time range ${timeRange}. Using ${actualPeriod}s instead.`);
            period = actualPeriod;
        }

        const timeSpanMs = endTime.getTime() - startTime.getTime();
        const expectedDataPoints = Math.ceil(timeSpanMs / (period * 1000));

        if (expectedDataPoints > 1440) {
            const adjustedPeriod = Math.ceil(timeSpanMs / (1440 * 1000));
            console.warn(`[AwsService-getMetricDataFromCloudWatch] Too many data points (${expectedDataPoints}) for period ${period}s. Adjusting to ${adjustedPeriod}s to limit to 1440 points.`);
            period = Math.max(adjustedPeriod, actualPeriod);
        }

        console.log('[AwsService-getMetricDataFromCloudWatch] Fetching CloudWatch metrics:', {
            instanceId,
            timeRange,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            period,
            expectedDataPoints: Math.ceil(timeSpanMs / (period * 1000)),
            timeSpan: `${(timeSpanMs / (1000 * 60 * 60)).toFixed(1)} hours`
        });

        const params = {
            StartTime: startTime,
            EndTime: endTime,
            MetricDataQueries: [
                {
                    Id: 'cpuUtilization',
                    MetricStat: {
                        Metric: {
                            Namespace: 'AWS/EC2',
                            MetricName: 'CPUUtilization',
                            Dimensions: [
                                {
                                    Name: 'InstanceId',
                                    Value: instanceId,
                                },
                            ],
                        },
                        Period: period,
                        Stat: 'Average'
                    },
                    ReturnData: true,
                },
            ],
            ScanBy: ScanBy.TIMESTAMP_ASCENDING
        };

        try {
            console.log('[AwsService-getMetricDataFromCloudWatch] Sending GetMetricData request to CloudWatch');
            const data = await this.cloudWatchClient.send(
                new GetMetricDataCommand(params)
            );

            if (!data.MetricDataResults?.[0]) {
                console.log('[AwsService-getMetricDataFromCloudWatch] No metric data returned from CloudWatch');
                throw new Error('No metric data returned');
            }

            const result = {
                Timestamps: data.MetricDataResults[0].Timestamps || [],
                Values: data.MetricDataResults[0].Values || []
            };

            if (result.Timestamps.length > 0) {
                const firstTimestamp = new Date(result.Timestamps[0]);
                const lastTimestamp = new Date(result.Timestamps[result.Timestamps.length - 1]);
                
                if (firstTimestamp > lastTimestamp) {
                    console.warn('[AwsService-getMetricDataFromCloudWatch] Data points are in reverse order, reversing arrays');
                    result.Timestamps.reverse();
                    result.Values.reverse();
                }

                const timeSpan = lastTimestamp.getTime() - firstTimestamp.getTime();
                const avgInterval = timeSpan / (result.Timestamps.length - 1);
                console.log('[AwsService-getMetricDataFromCloudWatch] Data point distribution:', {
                    totalPoints: result.Timestamps.length,
                    firstTimestamp: result.Timestamps[0],
                    lastTimestamp: result.Timestamps[result.Timestamps.length - 1],
                    avgIntervalSeconds: Math.round(avgInterval / 1000),
                    expectedInterval: period,
                    timeRange,
                    period
                });
            }

            return result;
        } catch (error) {
            console.error('[AwsService-getMetricDataFromCloudWatch] Error fetching CloudWatch data:', error);
            throw error;
        }
    }
}

export const awsService = AwsService.getInstance();
