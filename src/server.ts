import { config } from '@/config'

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'

import errorHandler from '@/middleware/error.middleware'

import authRoutes from '@/modules/auth/routes'
import workspaceRoutes from '@/modules/workspaces/routes'
import boardRoutes from '@/modules/boards/routes'
import memberRoutes from '@/modules/members/routes'
import userRoutes from '@/modules/users/routes'

// import { metaRoutes } from '@/modules/meta'

const app = express()
const PORT = config.port

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Allow CORS
  }),
)

// Compression middleware for better performance
app.use(compression())

// CORS configuration with more specific handling
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    // Allow requests with no origin (like mobile apps or server-to-server)
    if (!origin) return callback(null, true)

    // Check if the origin is in our allowed list
    if (config.cors.allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    callback(new Error('Not allowed by CORS'), false)
  },
  credentials: true,
  optionsSuccessStatus: 200, // Support legacy browsers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}

app.use(cors(corsOptions))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// app.use(trimStrings([]))

// Health endpoint with cache
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.environment,
  })
})

app.get('/', (req, res) => {
  res.json({
    message: 'NEXUS API',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
    },
    timestamp: new Date().toISOString(),
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/workspaces', workspaceRoutes)
workspaceRoutes.use('/:workspaceId/members', memberRoutes)
workspaceRoutes.use('/:workspaceId/boards', boardRoutes)
// app.use('/api/meta', metaRoutes)

app.use(errorHandler)

if (config.isDevelopment()) {
  app.listen(PORT, () => {
    console.log(`🚀 CUE API Server running on port ${PORT}`)
    console.log(`🌐 Environment: ${config.environment}`)
  })
}

export default app
