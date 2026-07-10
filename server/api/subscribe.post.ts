import { getGroupByPublicKey, addSubscription } from '../utils/db'

export default defineEventHandler(async (event) => {
  const { key, subscription } = await readBody(event) // key – публичный ключ группы
  const group = await getGroupByPublicKey(key)
  if (!group) {
    throw createError({ status: 400, message: 'Неверный ключ' })
  }
  await addSubscription(group.id, subscription)

  const { sendNotification } = await import('../utils/push')
  await sendNotification(subscription, group.name, `Вы подписаны на группу ${group.name}`)
  return { success: true, group: group.name }
})