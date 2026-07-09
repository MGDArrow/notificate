import { getSubscriptions, addMessage } from '../utils/db'
import { sendNotification } from '../utils/push'

export default defineEventHandler(async (event) => {
  const group = getHeader(event, 'x-group')
  if (!group) {
    throw createError({ status: 400, message: 'Missing x-group header' })
  }
  const body = await readBody(event)
  const text = typeof body === 'string' ? body : body.message || 'Новое уведомление'

  console.log( body);

  addMessage(group, text)

  console.log('Добавлен Message');
  
  const subscriptions = getSubscriptions(group)
  console.log('Подписки', subscriptions);
  const results = await Promise.allSettled(
    subscriptions.map(sub => sendNotification(sub, group, text))
  )
  console.log('Результаты', results);
  return { sent: results.filter(r => r.status === 'fulfilled').length }
})