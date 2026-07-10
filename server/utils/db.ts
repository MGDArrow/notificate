import prisma from './prisma'


// Генерация случайного ключа (base64url)
function generateKey(): string {
  const buf = crypto.randomBytes(32)
  return buf.toString('base64url')
}

// Создание группы
export async function createGroup(name: string) {
  const publicKey = generateKey()
  const secretKey = generateKey()
  return await prisma.group.create({
    data: { name, publicKey, secretKey }
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

export async function getSubscriptions(groupId: number) {
  return await prisma.subscription.findMany({
    where: { groupId }
  })
}

export async function addSubscription(groupId: number, subscription: PushSubscription) {
  const { endpoint, keys } = subscription;
  const existing = await prisma.subscription.findUnique({ where: { endpoint } })
  if (!existing) {
    await prisma.subscription.create({
      data: {
        endpoint,
        keys: keys as any, // Prisma принимает JSON
        groupId
      }
    })
  }
}

export async function removeSubscription(endpoint: string) {
  await prisma.subscription.deleteMany({ where: { endpoint } })
}

// Сообщения
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
export async function getGroupByName(name: string) {
  return await prisma.group.findFirst({ where: { name } })
}