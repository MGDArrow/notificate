import type { Subscription } from '~~/types/types'

export function useSubscriptions() {
  const list = ref<Subscription[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSubscriptions() {
    loading.value = true
    error.value = null
    try {
      list.value = await $fetch<Subscription[]>('/api/subscriptions')
    } catch (e: any) {
      error.value = e.message || 'Ошибка загрузки подписок'
    } finally {
      loading.value = false
    }
  }

  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  async function subscribeToGroup(publicKey: string): Promise<string> {
    const config = useRuntimeConfig()
    const vapidPublicKey = config.public.vapidPublicKey

    if (!vapidPublicKey) {
      throw new Error('VAPID публичный ключ не настроен')
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Браузер не поддерживает уведомления')
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      throw new Error('Необходимо разрешить уведомления в браузере')
    }

    const registration = await navigator.serviceWorker.ready
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    })

    const result = await $fetch<{ group: string }>('/api/subscribe', {
      method: 'POST',
      body: { key: publicKey, subscription }
    })

    await fetchSubscriptions() // обновить список
    return result.group
  }

  async function unsubscribeGroup(groupName: string) {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      throw new Error('Нет активной подписки')
    }

    await $fetch('/api/unsubscribe', {
      method: 'POST',
      body: { endpoint: subscription.endpoint }
    })

    await fetchSubscriptions() // обновить список
  }

  return { list, loading, error, fetchSubscriptions, subscribeToGroup, unsubscribeGroup }
}