/**
 * A helper function to format Prisma enums into a user-friendly
 * label/value pair for frontend dropdowns.
 * Example: 'IN_PROGRESS' becomes { label: 'In progress', value: 'IN_PROGRESS' }
 * @param enumObject The Prisma enum to format.
 */
export const formatEnumForDropdown = (enumObject: object) => {
  return Object.values(enumObject).map((value) => {
    // Simplified formatter: just replace underscore and set to lower case.
    // The frontend can use CSS (e.g., Tailwind's `capitalize`) for presentation.
    const label = value.replace('_', ' ').toLowerCase()

    return { label, value }
  })
}
