import prisma from './prisma'
import { randomBytes } from 'node:crypto'

function generateKey(): string {
  return randomBytes(32).toString('base64url')
}

// ─── Пользователи ──────────────────────────────────────
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function createUser(email: string, passwordHash: string) {
  return prisma.user.create({ data: { email, passwordHash } })
}

export async function findUserById(id: number) {
  return prisma.user.findUnique({ where: { id } })
}

// ─── Группы ────────────────────────────────────────────
export async function createGroup(name: string, userId: number) {
  const publicKey = generateKey()
  const secretKey = generateKey()
  return prisma.group.create({
    data: { name, publicKey, secretKey, userId }
  })
}

export async function getGroupByPublicKey(publicKey: string) {
  return prisma.group.findUnique({ where: { publicKey } })
}

export async function getGroupBySecretKey(groupName: string, secretKey: string) {
  return prisma.group.findFirst({
    where: { name: groupName, secretKey }
  })
}

export async function getGroupByName(name: string) {
  return prisma.group.findFirst({ where: { name } })
}

export async function getGroupsByUserId(userId: number) {
  return prisma.group.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getGroupById(id: number) {
  return prisma.group.findUnique({ where: { id } })
}

// ─── Подписки ──────────────────────────────────────────
export async function getSubscriptionsForGroup(groupId: number) {
  // Возвращает все Subscription, связанные с группой через GroupSubscription
  const groupSubs = await prisma.groupSubscription.findMany({
    where: { groupId },
    include: { subscription: true }
  })
  return groupSubs.map(gs => gs.subscription)
}

export async function addSubscription(
  groupId: number,
  subscription: PushSubscription,
  userId: number | null
) {
  const { endpoint, keys } = subscription

  // Найти или создать Subscription по endpoint
  let sub = await prisma.subscription.findUnique({ where: { endpoint } })
  if (!sub) {
    sub = await prisma.subscription.create({
      data: {
        endpoint,
        keys: keys as any,
        userId
      }
    })
  } else {
    // Если подписка уже существует, обновляем userId (если передан и был null)
    if (userId && sub.userId === null) {
      sub = await prisma.subscription.update({
        where: { id: sub.id },
        data: { userId }
      })
    }
  }

  // Создать связь с группой, если её нет
  const existing = await prisma.groupSubscription.findUnique({
    where: {
      groupId_subscriptionId: {
        groupId,
        subscriptionId: sub.id
      }
    }
  })
  if (!existing) {
    await prisma.groupSubscription.create({
      data: {
        groupId,
        subscriptionId: sub.id
      }
    })
  }

   if (userId) {
    // Найти все другие подписки пользователя
    const otherSubscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        id: { not: sub.id }
      }
    });
    for (const other of otherSubscriptions) {
      await prisma.groupSubscription.create({
        data: {
          groupId,
          subscriptionId: other.id
        }
      }).catch(() => {}); // игнорируем дубликаты (уникальное ограничение)
    }
  }
}

export async function removeSubscription(endpoint: string, groupId: number, userId: number | null) {
  // Найти Subscription
  const sub = await prisma.subscription.findUnique({ where: { endpoint } })
  if (!sub) return

  // Если передан userId, проверяем, что подписка принадлежит этому пользователю (или null)
  if (userId !== null && sub.userId !== userId) {
    throw new Error('Подписка не принадлежит пользователю')
  }

  // Удалить связь с группой
  await prisma.groupSubscription.deleteMany({
    where: {
      subscriptionId: sub.id,
      groupId
    }
  })

  // Если после удаления у подписки не осталось связей, удаляем саму подписку
  const remaining = await prisma.groupSubscription.count({
    where: { subscriptionId: sub.id }
  })
  if (remaining === 0) {
    await prisma.subscription.delete({ where: { id: sub.id } })
  }
}

export async function getUserSubscriptions(userId: number) {
  // Возвращает все группы, на которые подписан пользователь (через его подписки)
  const subs = await prisma.subscription.findMany({
    where: { userId },
    include: {
      groups: {
        include: { group: true }
      }
    }
  })
  // Извлекаем группы из связей
  const groups = subs.flatMap(s => s.groups.map(gs => gs.group))
  return groups
}

// ─── Сообщения ──────────────────────────────────────────
export async function getMessages(groupId: number) {
  return prisma.message.findMany({
    where: { groupId },
    orderBy: { timestamp: 'asc' }
  })
}

export async function addMessage(groupId: number, text: string) {
  return prisma.message.create({
    data: { text, groupId }
  })
}