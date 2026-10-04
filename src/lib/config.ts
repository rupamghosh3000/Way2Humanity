export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:3000/api/v1',
  
  db: {
    url: process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/way2humanity',
  },
  
  auth: {
    secret: process.env.AUTH_SECRET || 'way2humanity_production_auth_secret_key_32chars',
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'way2humanity_jwt_access_secret_key_32chars',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'way2humanity_jwt_refresh_secret_key_32chars',
    accessExpiry: '1d',
    refreshExpiry: '7d',
  },

  ai: {
    provider: process.env.AI_PROVIDER || 'gemini',
    apiKey: process.env.AI_PROVIDER_API_KEY || '',
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    bucket: process.env.STORAGE_BUCKET || 'way2humanity-vault',
    region: process.env.STORAGE_REGION || 'ap-south-1',
    accessKey: process.env.STORAGE_ACCESS_KEY || '',
    secretKey: process.env.STORAGE_SECRET_KEY || '',
  },

  payment: {
    provider: process.env.PAYMENT_PROVIDER || 'razorpay',
    keyId: process.env.PAYMENT_KEY_ID || 'rzp_test_way2humanity_key',
    keySecret: process.env.PAYMENT_KEY_SECRET || 'rzp_test_way2humanity_secret',
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || 'rzp_whsec_way2humanity_webhook_secret',
  },

  email: {
    provider: process.env.EMAIL_PROVIDER || 'resend',
    apiKey: process.env.EMAIL_API_KEY || '',
    from: process.env.EMAIL_FROM || 'noreply@way2humanity.org',
  },
};
