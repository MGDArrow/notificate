// server/api/unsubscribe.post.ts
import { z } from 'zod'
import prisma from '~~/server/utils/prisma'
import { getUserIdFromEvent, requireAuth } from '~~/server/utils/auth'
import { getGroupByName } from '~~/server/utils/db'

const bodySchema = z.object({
  groupName: z.string().min(1),
  endpoint: z.string().url().optional()
})

export default defineEventHandler(async (event) => {
  const userId = getUserIdFromEvent(event) // может быть null
  const { groupName, endpoint } = await readValidatedBody(event, bodySchema.parse)

  const group = await getGroupByName(groupName)
  if (!group) {
    throw createError({ status: 404, message: 'Группа не найдена' })
  }

  if (userId) {
    // Авторизованный пользователь: удаляем все связи этой группы со всеми его подписками
    await prisma.groupSubscription.deleteMany({
      where: {
        groupId: group.id,
        subscription: { userId }
      }
    })

    // Удаляем подписки пользователя, у которых больше нет связей
    const subsToDelete = await prisma.subscription.findMany({
      where: {
        userId,
        groups: { none: {} }
      }
    })
    for (const sub of subsToDelete) {
      await prisma.subscription.delete({ where: { id: sub.id } })
    }
  } else {
    // Гость: удаляем только для указанного endpoint
    if (!endpoint) {
      throw createError({ status: 400, message: 'Для гостя требуется endpoint' })
    }
    const sub = await prisma.subscription.findUnique({ where: { endpoint } })
    if (!sub) {
      return { success: true }
    }
    await prisma.groupSubscription.deleteMany({
      where: {
        groupId: group.id,
        subscriptionId: sub.id
      }
    })
    const remaining = await prisma.groupSubscription.count({
      where: { subscriptionId: sub.id }
    })
    if (remaining === 0) {
      await prisma.subscription.delete({ where: { id: sub.id } })
    }
  }

  return { success: true }
})