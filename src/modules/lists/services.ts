import { prisma } from '@/lib/prisma/client'
import { NotFoundException } from '@/exceptions/not-found.exception'
import { BadRequestException } from '@/exceptions'

// Define the type for a single list item in the reorder array
type ListItemData = {
  id: string
  position: number
}

/**
 * Updates the position of multiple lists on a board in a single transaction.
 * @param boardId The ID of the board whose lists are being reordered.
 * @param lists An array of list objects, each with an id and a new position.
 */
export const reorderLists = async (boardId: string, lists: ListItemData[]) => {
  // Step 1: Get all the list IDs from the incoming request.
  const listIds = lists.map((list) => list.id)

  // Step 2: Fetch all lists that match these IDs from the database.
  const listsInDb = await prisma.list.findMany({
    where: {
      id: { in: listIds },
      boardId: boardId, // Crucially, only fetch lists that also belong to the correct board.
    },
    select: { id: true },
  })

  // Step 3: Check for inconsistencies.
  // If the number of lists found in the DB doesn't match the number of lists
  // provided in the request, it means one or more list IDs were invalid
  // or did not belong to the specified board.
  if (listsInDb.length !== listIds.length) {
    throw new BadRequestException(
      'One or more lists are invalid or do not belong to this board.',
    )
  }

  // If validation passes, proceed with the transaction.
  await prisma.$transaction(
    lists.map((list) =>
      prisma.list.update({
        where: {
          id: list.id,
        },
        data: {
          position: list.position,
        },
      }),
    ),
  )
}
