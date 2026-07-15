// server/api/notify.post.ts
import { getGroupBySecretKey, addMessage, getSubscriptionsForGroup } from '../utils/db'
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

  let rawBody = await readBody(event)
  let text: string
  let data: any = {}
  let type: string | null = null

  if (typeof rawBody === 'string') {
    text = rawBody
    data = { message: rawBody }
  } else if (rawBody && typeof rawBody === 'object') {
    data = rawBody
    text = rawBody.message || rawBody.body || rawBody.text || 'Новое уведомление'
    type = rawBody.type || null
  } else {
    throw createError({ status: 400, message: 'Invalid body format' })
  }

  await addMessage(group.id, text, data, type)

  const subscriptions = await getSubscriptionsForGroup(group.id)
  const title = data.title || 'Новое уведомление'
  const results = await Promise.allSettled(
    subscriptions.map(sub =>
      sendNotification(sub, group.name, text, title, group.id)
    )
  )

  return { sent: results.filter(r => r.status === 'fulfilled').length }
})