import { CloudWatchClient, GetMetricDataCommand, MetricDataResult } from '@aws-sdk/client-cloudwatch';
import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';

const awsConfig = {
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
};

export class AwsService {
    private cloudWatchClient: CloudWatchClient;
    private ec2Client: EC2Client;

    constructor() {
        this.cloudWatchClient = new CloudWatchClient(awsConfig);
        this.ec2Client = new EC2Client(awsConfig);
    }

    /**
     * Gets instance ID from private IP address
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

            return data.Reservations[0].Instances[0].InstanceId;
        } catch (error) {
            console.error(`Error fetching instance ID from IP: ${ipAddress}, error:`, error);
            throw error;
        }
    }

    /**
     * Gets CPU utilization metrics from CloudWatch
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

            return data.MetricDataResults[0];
        } catch (error) {
            console.error("Error fetching CloudWatch data:", error);
            throw error;
        }
    }
}

// Example usage:
/*
const awsService = new AwsService();

try {
    // Get instance ID from IP
    const instanceId = await awsService.getInstanceIdForIPAddress('10.0.0.1');
    
    // Get metrics
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days ago
    const metrics = await awsService.getMetricDataFromCloudWatch(instanceId, startTime, endTime);
    
    console.log('CPU Metrics:', {
        timestamps: metrics.Timestamps,
        values: metrics.Values,
        label: metrics.Label
    });
} catch (error) {
    console.error('Error:', error);
}
*/
