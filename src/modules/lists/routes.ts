import { Router } from 'express'
import { authMiddleware } from '@/middleware/auth.middleware'
import { validateWorkspaceAccess } from '@/middleware/validate-workspace-access'
import validate from '@/middleware/validate.middleware'
import { reorderListSchema, validateListParams } from './schema'
import { reorderListsController } from './controllers'

const router = Router({ mergeParams: true })

router.use(authMiddleware)

// @route   PATCH /api/boards/:boardId/lists/reorder
// @desc    Updates the position of multiple lists on a board
// @access  Authenticated (Admin or Owner of workspace)
router.patch(
  '/reorder',
  validate.params(validateListParams),
  validateWorkspaceAccess(['OWNER', 'ADMIN']),
  validate.body(reorderListSchema),
  reorderListsController,
)

export default router
