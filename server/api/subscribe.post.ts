import { getGroupByKey, addSubscription } from '../utils/db'
import { sendNotification } from '../utils/push'

export default defineEventHandler(async (event) => {
  const { key, subscription } = await readBody(event)
  const group = getGroupByKey(key)
  if (!group) {
    throw createError({ status: 400, message: 'Неверный ключ' })
  }
  addSubscription(group, subscription)
  // опционально: отправить приветственное уведомление
  await sendNotification(subscription, `Вы подписаны на группу ${group}`)
  return { success: true, group }
})