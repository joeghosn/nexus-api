import dotenv from 'dotenv'

const environment = process.env.NODE_ENV || 'development'
const envFile = `.env.${environment}`

dotenv.config({ path: envFile })

export const config = {
  environment,
  port: parseInt(process.env.PORT || '3000'),

  // Database Configuration
  database: {
    url:
      process.env.DATABASE_URL ||
      '',
  },



  // Security Configuration
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000,http://localhost:5173',
    ],
  },
  cookies: {
    getSettings: (isProduction: boolean = true) => {
      if (isProduction) {
        return {
          httpOnly: true,
          secure: true,
          sameSite: 'strict' as const,
        }
      } else {
        return {
          httpOnly: true,
          secure: false,
          sameSite: 'none' as const,
        }
      }
    },
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
  },


  isDevelopment: () => environment === 'development',
  isProduction: () => environment === 'production',
}
