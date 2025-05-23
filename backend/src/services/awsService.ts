import { CloudWatchClient, GetMetricDataCommand } from '@aws-sdk/client-cloudwatch';
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

    private constructor() {
        console.log('[AwsService] Initializing AWS service with region:', config.awsRegion);
        this.cloudWatchClient = new CloudWatchClient(awsConfig);
        this.ec2Client = new EC2Client(awsConfig);
    }

    public static getInstance(): AwsService {
        if (!AwsService.instance) {
            console.log('[AwsService] Creating new AWS service instance');
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
        console.log('[AwsService] Looking up instance ID for IP:', ipAddress);
        
        const params = {
            Filters: [
                {
                    Name: 'private-ip-address',
                    Values: [ipAddress],
                },
            ],
        };

        try {
            console.log('[AwsService] Sending DescribeInstances request to EC2');
            const data = await this.ec2Client.send(new DescribeInstancesCommand(params));

            if (!data.Reservations?.[0]?.Instances?.[0]?.InstanceId) {
                console.log('[AwsService] No instance found for IP:', ipAddress);
                throw new Error('No instance found for the given IP address');
            }
            
            const instanceId = data.Reservations[0].Instances[0].InstanceId;
            console.log('[AwsService] Found instance ID!');
            return instanceId;
        } catch (error) {
            console.error('[AwsService] Error fetching instance ID:', error);
            throw error;
        }
    }

    /**
     * Gets CPU utilization metrics from CloudWatch
     * @param instanceId - The ID of the EC2 instance to get metrics for
     * @param startTime - The start time of the metrics to get
     * @param endTime - The end time of the metrics to get
     * @param period - The period of the metrics to get
     * @returns The CPU utilization metrics
     */
    async getMetricDataFromCloudWatch(
        instanceId: string,
        startTime: Date,
        endTime: Date,
        period: number = 1800
    ): Promise<MetricDataResult> {
        console.log('[AwsService] Fetching CloudWatch metrics:', {
            instanceId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            period
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
        };

        try {
            console.log('[AwsService] Sending GetMetricData request to CloudWatch');
            const data = await this.cloudWatchClient.send(
                new GetMetricDataCommand(params)
            );

            if (!data.MetricDataResults?.[0]) {
                console.log('[AwsService] No metric data returned from CloudWatch');
                throw new Error('No metric data returned');
            }

            const result = {
                Timestamps: data.MetricDataResults[0].Timestamps || [],
                Values: data.MetricDataResults[0].Values || []
            };

            console.log('[AwsService] Successfully retrieved CloudWatch metrics:', {
                dataPoints: result.Timestamps.length,
                firstTimestamp: result.Timestamps[0],
                lastTimestamp: result.Timestamps[result.Timestamps.length - 1]
            });

            return result;
        } catch (error) {
            console.error('[AwsService] Error fetching CloudWatch data:', error);
            throw error;
        }
    }
}

export const awsService = AwsService.getInstance();
