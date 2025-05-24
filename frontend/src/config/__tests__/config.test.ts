import { Config } from '../config';
import { beforeEach, describe, expect, it, afterEach } from '@jest/globals';

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

    it('should throw error when REACT_APP_BACKEND_URL is not provided', () => {
      delete process.env.REACT_APP_BACKEND_URL;
      expect(() => Config.getInstance()).toThrow('Environment variables validation failed');
    });

    it('should successfully initialize with valid environment variables', () => {
      const testApiUrl = 'http://test-api.example.com';
      const testBackendUrl = 'http://test-backend.example.com';
      process.env.REACT_APP_API_BASE_URL = testApiUrl;
      process.env.REACT_APP_BACKEND_URL = testBackendUrl;
      
      const config = Config.getInstance();
      expect(config.apiBaseUrl).toBe(testApiUrl);
      expect(config.backendUrl).toBe(testBackendUrl);
    });

    it('should maintain singleton instance with same configuration', () => {
      const testApiUrl = 'http://test-api.example.com';
      const testBackendUrl = 'http://test-backend.example.com';
      process.env.REACT_APP_API_BASE_URL = testApiUrl;
      process.env.REACT_APP_BACKEND_URL = testBackendUrl;
      
      const instance1 = Config.getInstance();
      const instance2 = Config.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1.apiBaseUrl).toBe(testApiUrl);
      expect(instance1.backendUrl).toBe(testBackendUrl);
      expect(instance2.apiBaseUrl).toBe(testApiUrl);
      expect(instance2.backendUrl).toBe(testBackendUrl);
    });
  });
}); 