import { Router } from 'express'
import * as cardController from './card.controller'

import { authMiddleware } from '@/middleware/auth.middleware'
import validate from '@/middleware/validate.middleware'
import {
  assignCardSchema,
  createCardSchema,
  reorderCardSchema,
  updateCardSchema,
} from './schema'

const router = Router()

router.use(authMiddleware)

// @route   POST /api/lists/:listId/cards
// @desc    Create a new card in a specific list
// @access  Authenticated
router.post(
  '/lists/:listId/cards',
  validate.body(createCardSchema),
  cardController.createCard,
)

// @route   PATCH /api/cards/reorder
// @desc    Handles drag-and-drop reordering of cards
// @access  Authenticated
router.patch(
  '/cards/reorder',
  validate.body(reorderCardSchema),
  cardController.reorderCards,
)

// @route   GET /api/cards/:cardId
// @desc    Get a single card by its ID
// @access  Authenticated
router.get('/cards/:cardId', cardController.getCardById)

// @route   PATCH /api/cards/:cardId
// @desc    Update a card's details (title, description, etc.)
// @access  Authenticated
router.patch(
  '/cards/:cardId',
  validate.body(updateCardSchema),
  cardController.updateCard,
)

// @route   DELETE /api/cards/:cardId
// @desc    Delete a card
// @access  Authenticated
router.delete('/cards/:cardId', cardController.deleteCard)

// @route   PATCH /api/cards/:cardId/assign
// @desc    Assign a user to a card
// @access  Authenticated
router.patch(
  '/cards/:cardId/assign',
  validate.body(assignCardSchema),
  cardController.assignCard,
)

export default router
