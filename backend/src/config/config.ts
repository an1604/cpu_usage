import * as dotenv from 'dotenv';

import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  AWS_ACCESS_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  INSTANCE_ID: z.string(),
  EC2_IP_ADDRESS: z.string(),
  CI: z.string().default('false'),
  CORS_ORIGIN: z.string().default('http://localhost:8080'),
});

type EnvSchema = z.infer<typeof envSchema>;

export class Config {
  private static instance: Config | null = null;
  private readonly config: EnvSchema;

  private constructor() {
    console.log('Initializing Config...');
    const parsed = envSchema.safeParse(process.env);
    
    if (!parsed.success) {
      console.error('Environment validation errors:', parsed.error.errors);
      throw new Error(`Environment variables validation failed: ${parsed.error.message}`);
    }

    this.config = parsed.data;
    console.log('Config initialized successfully');
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  // For testing purposes only
  public static resetInstance(): void {
    Config.instance = null;
  }

  public get port(): string {
    return this.config.PORT;
  }

  public get awsAccessId(): string {
    return this.config.AWS_ACCESS_ID;
  }

  public get awsSecretAccessKey(): string {
    return this.config.AWS_SECRET_ACCESS_KEY;
  }

  public get awsRegion(): string {
    return this.config.AWS_REGION;
  }

  public get instanceId(): string {
    return this.config.INSTANCE_ID;
  }

  public get ec2IpAddress(): string {
    return this.config.EC2_IP_ADDRESS;
  }

  public get corsOrigin(): string {
    return this.config.CORS_ORIGIN;
  }
}

// Export a singleton instance for use in production, but not during tests
export const config = Config.getInstance();
