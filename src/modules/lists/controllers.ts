import { Request, Response } from 'express'
import * as listService from './list.service'
import asyncHandler from '@/utils/async-handler'
import { ReorderListData } from './schema'

/**
 * @desc    Updates the position of multiple lists on a board
 * @route   PATCH /api/boards/:boardId/lists/reorder
 * @access  Authenticated (Admin or Owner of workspace)
 */
export const reorderListsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { boardId } = req.params
    const { lists }: ReorderListData = req.body

    // The authorization middleware should have already run to check for board access
    await listService.reorderLists(boardId, lists)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Lists reordered successfully',
      data: null,
    })
  },
)
