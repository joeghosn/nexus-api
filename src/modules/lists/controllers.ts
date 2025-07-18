import { Request, Response } from 'express'

import asyncHandler from '@/utils/async-handler'
import { ReorderListData } from './schema'
import { reorderLists } from './services'

/**
 * @desc    Updates the position of multiple lists on a board
 * @route   PATCH /api/boards/:boardId/lists/reorder
 * @access  Authenticated (Admin or Owner of workspace)
 */
export const reorderListsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { boardId } = req.params
    const { lists }: ReorderListData = req.body

    await reorderLists(boardId, lists)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Lists reordered successfully',
      data: null,
    })
  },
)
