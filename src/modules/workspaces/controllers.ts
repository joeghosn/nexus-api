import { Request, Response } from 'express'
import asyncHandler from '@/utils/async-handler'

import { AccessTokenPayload } from '@/types/auth.types'
import { WorkspaceData } from './schema'
import {
  createWorkspace,
  deleteWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  updateWorkspace,
} from './services'

/**
 * @desc    Create a new workspace
 * @route   POST /api/workspaces
 * @access  Authenticated
 */
export const createWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    // We know the user exists because the authMiddleware ran successfully
    const user = req.user as AccessTokenPayload
    const workspaceData: WorkspaceData = req.body

    const newWorkspace = await createWorkspace(workspaceData, user.id)

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Workspace created successfully',
      data: newWorkspace,
    })
  },
)

/**
 * @desc    Get all workspaces the current user is a member of
 * @route   GET /api/workspaces
 * @access  Authenticated
 */
export const getUserWorkspacesController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AccessTokenPayload

    const workspaces = await getUserWorkspaces(user.id)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Workspaces fetched successfully',
      data: workspaces,
    })
  },
)

/**
 * @desc    Get a single workspace by its ID
 * @route   GET /api/workspaces/:workspaceId
 * @access  Authenticated (Member of workspace)
 */
export const getWorkspaceByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params

    // Authorization is handled by the hasWorkspaceRole middleware,
    // so we can proceed directly to the service call.
    const workspace = await getWorkspaceById(workspaceId)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Workspace details fetched successfully',
      data: workspace,
    })
  },
)

/**
 * @desc    Update a workspace's name
 * @route   PATCH /api/workspaces/:workspaceId
 * @access  Authenticated (Admin or Owner of workspace)
 */
export const updateWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params
    const workspaceData: WorkspaceData = req.body

    // Authorization is handled by the hasWorkspaceRole middleware.
    const updatedWorkspace = await updateWorkspace(workspaceId, workspaceData)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Workspace updated successfully',
      data: updatedWorkspace,
    })
  },
)

/**
 * @desc    Delete a workspace
 * @route   DELETE /api/workspaces/:workspaceId
 * @access  Authenticated (Owner of workspace)
 */
export const deleteWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params

    // Authorization is handled by the hasWorkspaceRole middleware.
    await deleteWorkspace(workspaceId)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Workspace deleted successfully',
      data: null,
    })
  },
)
