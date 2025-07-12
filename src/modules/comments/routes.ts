import { Router } from 'express'
import * as commentController from './comment.controller'

import { commentSchema } from './schema'
import { authMiddleware } from '@/middleware/auth.middleware'
import validate from '@/middleware/validate.middleware'

// The { mergeParams: true } option is crucial for accessing :cardId from the parent router
const router = Router({ mergeParams: true })

// All routes in this file are protected
router.use(authMiddleware)

// @route   POST /api/cards/:cardId/comments
// @desc    Create a new comment on a card
// @access  Authenticated
router.post('/', validate.body(commentSchema), commentController.createComment)

// @route   GET /api/cards/:cardId/comments
// @desc    Get all comments for a specific card
// @access  Authenticated
router.get('/', commentController.getComments)

// @route   PATCH /api/cards/:cardId/comments/:commentId
// @desc    Update a comment
// @access  Authenticated
router.patch(
  '/:commentId',
  validate.body(commentSchema),
  commentController.updateComment,
)

// @route   DELETE /api/cards/:cardId/comments/:commentId
// @desc    Delete a comment
// @access  Authenticated
router.delete('/:commentId', commentController.deleteComment)

export default router
