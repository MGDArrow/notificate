import { z } from 'zod'

const bodySchema = z.object({
  endpoint: z.string().url(),
  groupName: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event) // только авторизованные могут отписываться
  const { endpoint, groupName } = await readValidatedBody(event, bodySchema.parse)

  const group = await getGroupByName(groupName)
  if (!group) {
    throw createError({ status: 404, message: 'Группа не найдена' })
  }

  await removeSubscription(endpoint, group.id, userId)

  return { success: true }
})