import { getSubscriptionsForGroup, addMessage } from '../utils/db'
import { sendNotification } from '../utils/push'

export default defineEventHandler(async (event) => {
  const groupName = getHeader(event, 'x-group')
  const secretKey = getHeader(event, 'x-secret-key')
  if (!groupName || !secretKey) {
    throw createError({ status: 400, message: 'Missing x-group or x-secret-key header' })
  }

  const group = await getGroupBySecretKey(groupName, secretKey)
  if (!group) {
    throw createError({ status: 403, message: 'Invalid group or secret key' })
  }

  const body = await readBody(event)
  console.log(body);
  const text = typeof body === 'string' ? body : body.message || 'Новое уведомление'

  await addMessage(group.id, text)

  // Получаем все подписки для группы
  const subscriptions = await getSubscriptionsForGroup(group.id)
  const results = await Promise.allSettled(
    subscriptions.map(sub => sendNotification(sub, group.name, text))
  )

  return { sent: results.filter(r => r.status === 'fulfilled').length }
})