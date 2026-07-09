<template>
  <form @submit.prevent="subscribe">
    <input v-model="key" placeholder="Введите ключ группы" />
    <button type="submit">Подписаться</button>
  </form>
</template>

<script setup>
const emit = defineEmits(['subscribed'])
const key = ref('')

async function subscribe() {
  if (!key.value.trim()) return
  // запрашиваем разрешение и получаем подписку
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return alert('Нужно разрешение')

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(useRuntimeConfig().public.vapidPublicKey)
  })

  const result = await $fetch('/api/subscribe', {
    method: 'POST',
    body: { key: key.value, subscription }
  })
  emit('subscribed', result.group)
  key.value = ''
}

// вспомогательная функция
function urlBase64ToUint8Array(base64String) {
  // Добавляем недостающие '=' для корректного декодирования
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')   // Base64URL использует '-' вместо '+'
    .replace(/_/g, '/')   // и '_' вместо '/'

  const rawData = atob(base64)              // декодируем Base64 в строку
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
</script>