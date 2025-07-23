declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    DATABASE_URL?: string;
    JWT_SECRET?: string;
    CORS_ORIGIN?: string;
    LOG_LEVEL?: 'error' | 'warn' | 'info' | 'debug';
    API_KEY?: string;
    SESSION_SECRET?: string;
    REDIS_URL?: string;
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
  }
}
