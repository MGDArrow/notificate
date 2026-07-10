import { getMessages } from '../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const groupName = query.group as string
  if (!groupName) throw createError({ status: 400, message: 'Missing group' })

  // Нужно получить groupId по имени, поэтому добавим вспомогательную функцию
  // В db.ts добавим getGroupByName
  const { getGroupByName } = await import('../utils/db')
  const group = await getGroupByName(groupName)
  if (!group) return []
  return await getMessages(group.id)
})