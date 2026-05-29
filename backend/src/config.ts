import dotenv from 'dotenv';

dotenv.config();

interface requiredEnv {
  name: string;
  key: string;
  value: string | undefined;
}

const config = {
  port: process.env.PORT || 8000,
  clientUrl: process.env.CLIENT_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  refreshToken: process.env.REFRESH_TOKEN!,
  databaseUrl: process.env.DATABASE_URL!,
  resendApiKey: process.env.RESEND_API_KEY!,
  domain: process.env.DOMAIN!,
  isValid: false,
};

const validateConfig = () => {
  const required: requiredEnv[] = [
    {
      name: 'Client URL',
      key: 'clientUrl',
      value: config.clientUrl,
    },
    {
      name: 'JWT Secret',
      key: 'jwtSecret',
      value: config.jwtSecret,
    },
    {
      name: 'Refresh Token',
      key: 'refreshToken',
      value: config.refreshToken,
    },
    {
      name: 'Database URL',
      key: 'databaseUrl',
      value: config.databaseUrl,
    },
    {
      name: 'Resend API Key',
      key: 'resendApiKey',
      value: config.resendApiKey,
    },
    {
      name: 'Domain',
      key: 'domain',
      value: config.domain,
    },
  ];

  const missing = required.filter((item) => !item.value);

  if (missing.length > 0) {
    console.error('Missing required configuration:');
    missing.forEach((item) => {
      console.error(`- ${item.name} (${item.key})`);
    });
    return false;
  }

  return true;
};

config.isValid = validateConfig();

export default config;
