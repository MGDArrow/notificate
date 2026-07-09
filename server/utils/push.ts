import webpush from 'web-push'
import { useRuntimeConfig } from '#imports'
import { removeSubscription } from './db' // добавьте импорт

export async function sendNotification(subscription: any, group: string, message: string) {
  const config = useRuntimeConfig()
  const publicKey = config.public.vapidPublicKey
  const privateKey = config.private.vapidPrivateKey

  if (!publicKey || !privateKey) {
    console.error('VAPID keys missing')
    return
  }

  webpush.setVapidDetails('mailto:your-email@example.com', publicKey, privateKey)

  const payload = JSON.stringify({
    title: 'Новое уведомление',
    body: message,
    group: group,
  })

  try {
    await webpush.sendNotification(subscription, payload)
  } catch (err: any) {
    // Если подписка устарела или аннулирована — удаляем её из базы
    if (err.statusCode === 410) {
      console.log(`[Push] Removing expired subscription for group ${group}:`, subscription.endpoint)
      removeSubscription(group, subscription.endpoint)
    } else {
      console.error(`[Push] Failed for ${subscription.endpoint}:`, err)
    }
    throw err // или обработайте по-своему
  }
}