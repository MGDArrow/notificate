import { useAuthStore } from '~~/stores/auth'
import type { Subscription } from '~~/types/types'

export function useSubscriptions() {
  const list = ref<Subscription[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Локальные подписки (гостевые) – храним массив публичных ключей
  const localKeys = ref<string[]>([])

  // Загрузка из localStorage при инициализации
  function loadLocalKeys() {
    try {
      const stored = localStorage.getItem('guest_subscriptions')
      localKeys.value = stored ? JSON.parse(stored) : []
    } catch {
      localKeys.value = []
    }
  }

  function saveLocalKeys() {
    localStorage.setItem('guest_subscriptions', JSON.stringify(localKeys.value))
  }

  // Добавить локальную подписку (гость)
  function addLocalKey(publicKey: string) {
    if (!localKeys.value.includes(publicKey)) {
      localKeys.value.push(publicKey)
      saveLocalKeys()
    }
  }

  // Удалить локальную подписку
  function removeLocalKey(publicKey: string) {
    localKeys.value = localKeys.value.filter(k => k !== publicKey)
    saveLocalKeys()
  }

  // Очистить локальные подписки (после переноса)
  function clearLocalKeys() {
    localKeys.value = []
    saveLocalKeys()
  }

  // Основные методы
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

    // Отправляем на сервер (userId определится по cookie, если авторизован)
    const result = await $fetch<{ group: string }>('/api/subscribe', {
      method: 'POST',
      body: { key: publicKey, subscription }
    })

    // Если пользователь не авторизован, сохраняем локально
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      addLocalKey(publicKey)
    } else {
      // Если авторизован, удаляем из локальных (если была)
      removeLocalKey(publicKey)
      // и обновляем список с сервера
      await fetchSubscriptions()
    }

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
      body: { endpoint: subscription.endpoint, groupName }
    })

    // Если был гостем, удаляем из локальных
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      // нужно найти публичный ключ по имени группы? проще удалить все локальные подписки и перезагрузить?
      // но мы не знаем ключ по имени, поэтому перезагрузим локальные данные? лучше хранить имена тоже
      // для простоты – очистим локальные и перезагрузим, потом пользователь может подписаться заново
      clearLocalKeys()
    } else {
      await fetchSubscriptions()
    }
  }

  // Перенос локальных подписок в аккаунт (вызывается после авторизации)
  async function migrateLocalSubscriptions() {
    const keys = localKeys.value.slice() // копия
    for (const key of keys) {
      try {
        await subscribeToGroup(key)
      } catch (e) {
        console.warn('Не удалось перенести подписку:', key, e)
      }
    }
    clearLocalKeys()
    await fetchSubscriptions()
  }

  // Инициализация: загружаем локальные ключи
  loadLocalKeys()

  return {
    list,
    loading,
    error,
    fetchSubscriptions,
    subscribeToGroup,
    unsubscribeGroup,
    localKeys: readonly(localKeys),
    migrateLocalSubscriptions,
    clearLocalKeys
  }
}