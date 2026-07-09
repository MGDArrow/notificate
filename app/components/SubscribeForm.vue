<template>
  <form @submit.prevent="subscribe">
    <input
      v-model="key"
      :disabled="isLoading"
      placeholder="Введите ключ группы"
      maxlength="100"
    />
    <button type="submit" :disabled="isLoading">
      {{ isLoading ? 'Подписка...' : 'Подписаться' }}
    </button>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </form>
</template>

<script setup>
const config = useRuntimeConfig()
const vapidPublicKey = config.public.vapidPublicKey
const emit = defineEmits(['subscribed'])

const key = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function subscribe() {
  errorMessage.value = ''
  successMessage.value = ''

  const trimmedKey = key.value.trim()
  if (!trimmedKey) {
    errorMessage.value = 'Введите ключ группы'
    return
  }

  if (!vapidPublicKey) {
    errorMessage.value = 'VAPID ключ не настроен. Обратитесь к администратору.'
    return
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    errorMessage.value = 'Ваш браузер не поддерживает уведомления'
    return
  }

  isLoading.value = true
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      errorMessage.value = 'Необходимо разрешить уведомления в настройках браузера'
      return
    }

    const registration = await navigator.serviceWorker.ready
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)
    let subscription
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      })
    } catch (pushError) {
      console.error('Push subscription error:', pushError)
      errorMessage.value = 'Ошибка при создании подписки. Попробуйте другой браузер.'
      return
    }

    const result = await $fetch('/api/subscribe', {
      method: 'POST',
      body: { key: trimmedKey, subscription }
    })

    successMessage.value = `Вы подписаны на группу «${result.group}»`
    emit('subscribed', result.group)
    key.value = ''
    // Автоматически скрыть успешное сообщение через 3 секунды
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (err) {
    console.error('Subscribe error:', err)
    if (err.status === 400) {
      errorMessage.value = err.message || 'Неверный ключ группы'
    } else if (err.status === 500) {
      errorMessage.value = 'Ошибка сервера. Попробуйте позже.'
    } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      errorMessage.value = 'Нет соединения с сервером. Проверьте интернет.'
    } else {
      errorMessage.value = 'Произошла ошибка. Попробуйте снова.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.error {
  color: #d32f2f;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}
.success {
  color: #2e7d32;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}
input:disabled, button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>