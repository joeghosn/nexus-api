import { Router } from 'express'
import * as listController from './list.controller'

import { authMiddleware } from '@/middleware/auth.middleware'
import validate from '@/middleware/validate.middleware'
import { reorderListSchema } from './schema'

const router = Router({ mergeParams: true })

router.use(authMiddleware)

// @route   PATCH /api/boards/:boardId/lists/reorder
// @desc    Updates the position of multiple lists on a board
// @access  Authenticated
router.patch(
  '/reorder',
  validate.body(reorderListSchema),
  listController.reorderLists,
)

export default router
