import { z } from 'zod';

const envSchema = z.object({
  REACT_APP_API_BASE_URL: z.string(),
  REACT_APP_BACKEND_URL: z.string(),
});

type EnvSchema = z.infer<typeof envSchema>;

export class Config {
  private static instance: Config | null = null;
  private readonly config: EnvSchema;

  private constructor() {
    console.log('[Config] Initializing frontend configuration...');
    const parsed = envSchema.safeParse(process.env);
    
    if (!parsed.success) {
      console.error('[Config] Environment validation errors:', parsed.error.errors);
      throw new Error(`Environment variables validation failed: ${parsed.error.message}`);
    }

    this.config = parsed.data;
    console.log('[Config] Configuration initialized successfully');
    console.log('[Config] API Base URL:', this.config.REACT_APP_API_BASE_URL.slice(0, 4));
    console.log('[Config] Backend URL:', this.config.REACT_APP_BACKEND_URL.slice(0, 4));
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

  public get apiBaseUrl(): string {
    return this.config.REACT_APP_API_BASE_URL;
  }

  public get backendUrl(): string {
    return this.config.REACT_APP_BACKEND_URL;
  }
}
 
// Export a singleton instance for use in production, but not during tests
export const config = Config.getInstance(); 