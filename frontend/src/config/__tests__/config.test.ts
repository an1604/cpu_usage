import { Config } from '../config';
import { beforeEach, describe, expect, it } from '@jest/globals';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    Config.resetInstance();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Environment Variables Validation', () => {
    it('should throw error when REACT_APP_API_BASE_URL is not provided', () => {
      delete process.env.REACT_APP_API_BASE_URL;
      expect(() => Config.getInstance()).toThrow('Environment variables validation failed');
    });

    it('should successfully initialize with valid environment variables', () => {
      const testUrl = 'http://test-api.example.com';
      process.env.REACT_APP_API_BASE_URL = testUrl;
      
      const config = Config.getInstance();
      expect(config.apiBaseUrl).toBe(testUrl);
    });

    it('should maintain singleton instance with same configuration', () => {
      const testUrl = 'http://test-api.example.com';
      process.env.REACT_APP_API_BASE_URL = testUrl;
      
      const instance1 = Config.getInstance();
      const instance2 = Config.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1.apiBaseUrl).toBe(testUrl);
      expect(instance2.apiBaseUrl).toBe(testUrl);
    });
  });
}); 