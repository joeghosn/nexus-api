import { Router } from 'express'

import { authMiddleware } from '@/middleware/auth.middleware'
import { getMetaDataController } from './controllers'

const router = Router()

// This route is for authenticated users to get app-wide data
router.use(authMiddleware)

// @route   GET /api/meta
// @desc    Get application metadata (enums for roles, statuses, etc.)
// @access  Authenticated
router.get('/', getMetaDataController)

export default router
