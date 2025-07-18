import { Request, Response } from 'express'

import asyncHandler from '@/utils/async-handler'
import { getMetaData } from './services'

/**
 * @desc    Get application metadata (enums)
 * @route   GET /api/meta
 * @access  Authenticated
 */
export const getMetaDataController = asyncHandler(
  async (req: Request, res: Response) => {
    const metaData = getMetaData()

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Metadata fetched successfully',
      data: metaData,
    })
  },
)
