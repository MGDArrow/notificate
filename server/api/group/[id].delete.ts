import { requireAuth } from '~~/server/utils/auth'
import { getGroupById, deleteGroup } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const groupId = getRouterParam(event, 'id')
  if (!groupId) throw createError({ status: 400, message: 'Missing group id' })
  const id = parseInt(groupId)
  if (isNaN(id)) throw createError({ status: 400, message: 'Invalid group id' })

  const group = await getGroupById(id)
  if (!group) throw createError({ status: 404, message: 'Группа не найдена' })
  if (group.userId !== userId) throw createError({ status: 403, message: 'Нет прав' })

  await deleteGroup(id)
  return { success: true }
})