import prisma from './prisma'
import { randomBytes } from 'node:crypto'

// Генерация случайного ключа (base64url)
function generateKey(): string {
  const buf = randomBytes(32)
  return buf.toString('base64url')
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
  return await prisma.group.create({
    data: { name, publicKey, secretKey, userId }
  })
}

export async function getGroupByPublicKey(publicKey: string) {
  return await prisma.group.findUnique({ where: { publicKey } })
}

export async function getGroupBySecretKey(groupName: string, secretKey: string) {
  return await prisma.group.findFirst({
    where: {
      name: groupName,
      secretKey: secretKey
    }
  })
}

export async function getGroupByName(name: string) {
  return await prisma.group.findFirst({ where: { name } })
}

export async function getGroupsByUserId(userId: number) {
  return await prisma.group.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getGroupById(id: number) {
  return await prisma.group.findUnique({ where: { id } })
}

// ─── Подписки ──────────────────────────────────────────
export async function getSubscriptions(groupId: number) {
  return await prisma.subscription.findMany({
    where: { groupId }
  })
}

export async function addSubscription(groupId: number, subscription: PushSubscription, userId: number) {
  const { endpoint, keys } = subscription
  const existing = await prisma.subscription.findUnique({ where: { endpoint } })
  if (!existing) {
    await prisma.subscription.create({
      data: {
        endpoint,
        keys: keys as any,
        groupId,
        userId
      }
    })
  } else {
    // Если подписка уже существует, но принадлежит другому пользователю – обновляем владельца
    if (existing.userId !== userId) {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: { userId }
      })
    }
  }
}

export async function removeSubscription(endpoint: string, userId: number) {
  await prisma.subscription.deleteMany({
    where: {
      endpoint,
      userId
    }
  })
}

export async function getUserSubscriptions(userId: number) {
  return await prisma.subscription.findMany({
    where: { userId },
    include: { group: true }
  })
}

// ─── Сообщения ──────────────────────────────────────────
export async function getMessages(groupId: number) {
  return await prisma.message.findMany({
    where: { groupId },
    orderBy: { timestamp: 'asc' }
  })
}

export async function addMessage(groupId: number, text: string) {
  return await prisma.message.create({
    data: { text, groupId }
  })
}