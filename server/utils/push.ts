// server/utils/push.ts
import webpush from 'web-push'
import { removeSubscription } from './db'

export async function sendNotification(
  subscription: any,
  groupName: string,
  message: string,
  title?: string,
  groupId?: number
) {
  const config = useRuntimeConfig()
  const publicKey = config.public.vapidPublicKey
  const privateKey = config.private.vapidPrivateKey

  if (!publicKey || !privateKey) {
    console.error('VAPID keys missing')
    return
  }

  webpush.setVapidDetails('mailto:your-email@example.com', publicKey, privateKey)

  const payload = JSON.stringify({
    title: title || 'Новое уведомление',
    body: message,
    group: groupName,
  })

  try {
    await webpush.sendNotification(subscription, payload)
  } catch (err: any) {
    if (err.statusCode === 410 && groupId) {
      console.log(`[Push] Removing expired subscription for group ${groupName}:`, subscription.endpoint)
      // Исправленный вызов: endpoint, groupId, userId = null
      await removeSubscription(subscription.endpoint, groupId, null)
    } else {
      console.error(`[Push] Failed for ${subscription.endpoint}:`, err)
    }
    throw err
  }
}