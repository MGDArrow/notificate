import { getGroupByName, getSubscriptions, addMessage } from '../utils/db'
import { sendNotification } from '../utils/push'

export default defineEventHandler(async (event) => {
  const groupName = getHeader(event, 'x-group')
  const secretKey = getHeader(event, 'x-secret-key')
  if (!groupName || !secretKey) {
    throw createError({ status: 400, message: 'Missing x-group or x-secret-key header' })
  }

  // Проверяем группу по имени и секретному ключу
  const { getGroupBySecretKey } = await import('../utils/db')
  const group = await getGroupBySecretKey(groupName, secretKey)
  if (!group) {
    throw createError({ status: 403, message: 'Invalid group or secret key' })
  }

  const body = await readBody(event)
  const text = typeof body === 'string' ? body : body.message || 'Новое уведомление'

  await addMessage(group.id, text)

  const subscriptions = await getSubscriptions(group.id)
  const results = await Promise.allSettled(
    subscriptions.map(sub => sendNotification(sub, group.name, text))
  )

  return { sent: results.filter(r => r.status === 'fulfilled').length }
})