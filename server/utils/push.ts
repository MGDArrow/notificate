import webpush from 'web-push'
import { useRuntimeConfig } from '#imports'

export async function sendNotification(subscription: any, group: string, message: string) {
  const config = useRuntimeConfig()
  const publicKey = config.public.vapidPublicKey
  const privateKey = config.private.vapidPrivateKey

  if (!publicKey || !privateKey) {
    console.error('VAPID keys are missing! Check environment variables.')
    throw new Error('VAPID keys not configured')
  }

  // Устанавливаем VAPID-детали при каждом вызове (можно вынести, но безопаснее здесь)
  webpush.setVapidDetails(
    'mailto:your-email@example.com',
    publicKey,
    privateKey
  )

  const payload = JSON.stringify({
    title: 'Новое уведомление',
    body: message,
    group: group,
  })

  try {
    await webpush.sendNotification(subscription, payload)
  } catch (err) {
    console.error('Push failed for subscription:', subscription.endpoint, err)
    throw err // или обработайте по-своему
  }
}