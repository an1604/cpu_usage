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
    private cloudWatchClient: CloudWatchClient;
    private ec2Client: EC2Client;

    constructor() {
        this.cloudWatchClient = new CloudWatchClient(awsConfig);
        this.ec2Client = new EC2Client(awsConfig);
    }

    /**
     * Gets instance ID from private IP address
     * @param ipAddress - The private IP address of the EC2 instance to get the instance ID for
     * @returns The instance ID of the EC2 instance
     */
    async getInstanceIdForIPAddress(ipAddress: string): Promise<string> {
        const params = {
            Filters: [
                {
                    Name: 'private-ip-address',
                    Values: [ipAddress],
                },
            ],
        };

        try {
            const data = await this.ec2Client.send(new DescribeInstancesCommand(params));

            if (!data.Reservations?.[0]?.Instances?.[0]?.InstanceId) {
                throw new Error('No instance found for the given IP address');
            }
            const instanceId = data.Reservations[0].Instances[0].InstanceId;
            return instanceId;
        } catch (error) {
            console.error(`Error fetching instance ID from IP: ${ipAddress}, error:`, error);
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
            const data = await this.cloudWatchClient.send(
                new GetMetricDataCommand(params)
            );

            if (!data.MetricDataResults?.[0]) {
                throw new Error('No metric data returned');
            }

            // convert AWS response to MetricDataResult type
            return {
                Timestamps: data.MetricDataResults[0].Timestamps || [],
                Values: data.MetricDataResults[0].Values || []
            };
        } catch (error) {
            console.error("Error fetching CloudWatch data:", error);
            throw error;
        }
    }
}
