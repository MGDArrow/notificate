import { getMessages } from '../utils/db'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const group = query.group as string
  if (!group) throw createError({ status: 400, message: 'Missing group' })
  return getMessages(group)
})