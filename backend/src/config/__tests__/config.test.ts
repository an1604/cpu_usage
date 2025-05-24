/// <reference types="jest" />
import { Config } from '../config';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.NODE_ENV = 'test';
    Config.resetInstance();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Environment Variables Validation', () => {
    it('should throw error when required environment variables are missing', () => {
      delete process.env.AWS_ACCESS_ID;
      delete process.env.AWS_SECRET_ACCESS_KEY;
      delete process.env.AWS_REGION;
      delete process.env.INSTANCE_ID;
      delete process.env.EC2_IP_ADDRESS;

      expect(() => {
        Config.getInstance();
      }).toThrow('Environment variables validation failed');
    });

    it('should use default PORT value when not provided', () => {
      process.env.AWS_ACCESS_ID = 'test-id';
      process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
      process.env.AWS_REGION = 'us-east-1';
      process.env.INSTANCE_ID = 'i-1234567890';
      process.env.EC2_IP_ADDRESS = '127.0.0.1';

      const config = Config.getInstance();
      expect(config.port).toBe('5000');
    });

    it('should successfully initialize with all required environment variables', () => {
      const testEnv = {
        PORT: '8080',
        AWS_ACCESS_ID: 'test-id',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
        AWS_REGION: 'us-east-1',
        INSTANCE_ID: 'i-1234567890',
        EC2_IP_ADDRESS: '127.0.0.1'
      };

      Object.assign(process.env, testEnv);

      const config = Config.getInstance();

      expect(config.port).toBe(testEnv.PORT);
      expect(config.awsAccessId).toBe(testEnv.AWS_ACCESS_ID);
      expect(config.awsSecretAccessKey).toBe(testEnv.AWS_SECRET_ACCESS_KEY);
      expect(config.awsRegion).toBe(testEnv.AWS_REGION);
      expect(config.instanceId).toBe(testEnv.INSTANCE_ID);
      expect(config.ec2IpAddress).toBe(testEnv.EC2_IP_ADDRESS);
    });
  });

  describe('Singleton Pattern', () => {
    it('should always return the same instance', () => {
      process.env.AWS_ACCESS_ID = 'test-id';
      process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
      process.env.AWS_REGION = 'us-east-1';
      process.env.INSTANCE_ID = 'i-1234567890';
      process.env.EC2_IP_ADDRESS = '127.0.0.1';

      const instance1 = Config.getInstance();
      const instance2 = Config.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
}); 