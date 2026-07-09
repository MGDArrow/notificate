import webpush from 'web-push'

const config = useRuntimeConfig()
const vapidPublic = config.public.vapidPublicKey
const vapidPrivate = config.private.vapidPrivateKey

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidPublic,
  vapidPrivate
)

export async function sendNotification(subscription: any, group: string, message: string) {
  try {
  const payload = JSON.stringify({
    title: 'Новое уведомление',
    body: message,
    group: group,
  })
  await webpush.sendNotification(subscription, payload)
  } catch (err) {
    console.error('Push failed', err)
  }
}