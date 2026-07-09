import { getSubscriptions, addMessage } from '../utils/db'
import { sendNotification } from '../utils/push'

export default defineEventHandler(async (event) => {
  const group = getHeader(event, 'x-group')
  if (!group) {
    throw createError({ status: 400, message: 'Missing x-group header' })
  }
  const body = await readBody(event)
  const text = typeof body === 'string' ? body : body.text || 'Новое уведомление'

  console.log(text, body);

  return text
  
  // // сохраняем в архив
  // addMessage(group, text)
  
  // // отправляем push всем подписанным
  // const subscriptions = getSubscriptions(group)
  // const results = await Promise.allSettled(
  //   subscriptions.map(sub => sendNotification(sub, text))
  // )
  // return { sent: results.filter(r => r.status === 'fulfilled').length }
})