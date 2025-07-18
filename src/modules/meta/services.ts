import { formatEnumForDropdown } from '@/utils/formatters'
import { Role, Status, Priority, BoardVisibility } from '@prisma/client'

export const getMetaData = () => {
  return {
    roles: formatEnumForDropdown(Role),
    cardStatuses: formatEnumForDropdown(Status),
    cardPriorities: formatEnumForDropdown(Priority),
    boardVisibilities: formatEnumForDropdown(BoardVisibility),
  }
}
