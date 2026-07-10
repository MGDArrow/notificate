// server/api/subscriptions/sync.post.ts
import { z } from 'zod'

const bodySchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  })
})

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const { endpoint, keys } = await readValidatedBody(event, bodySchema.parse)

  // Найти или создать подписку для этого устройства
  let sub = await prisma.subscription.findUnique({ where: { endpoint } })
  if (!sub) {
    sub = await prisma.subscription.create({
      data: { endpoint, keys: keys as any, userId }
    })
  } else {
    // Если подписка существовала как гостевая – привязать к пользователю
    if (sub.userId !== userId) {
      sub = await prisma.subscription.update({
        where: { id: sub.id },
        data: { userId }
      })
    }
  }

  // Получить все группы, на которые пользователь подписан через любые устройства
  const groups = await prisma.group.findMany({
    where: {
      subscriptions: {
        some: { subscription: { userId } }
      }
    }
  })

  // Подписать текущее устройство на каждую из этих групп
  for (const group of groups) {
    await prisma.groupSubscription.create({
      data: {
        groupId: group.id,
        subscriptionId: sub.id
      }
    }).catch(() => {}) // игнорируем дубликаты
  }

  return { success: true, groups: groups.map(g => g.name) }
})