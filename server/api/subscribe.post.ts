
import { z } from 'zod'

const bodySchema = z.object({
  key: z.string().min(1),
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string()
    })
  })
})

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const { key, subscription } = await readValidatedBody(event, bodySchema.parse)

  const group = await getGroupByPublicKey(key)
  if (!group) {
    throw createError({ status: 400, message: 'Неверный публичный ключ группы' })
  }

  await addSubscription(group.id, subscription, userId)

  await sendNotification(subscription, group.name, `Вы подписаны на группу ${group.name}`)

  return { success: true, group: group.name }
})