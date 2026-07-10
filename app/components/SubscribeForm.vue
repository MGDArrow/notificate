<template>
  <form @submit.prevent="handleSubscribe">
    <input
      v-model="key"
      :disabled="isLoading"
      placeholder="Введите публичный ключ группы"
      maxlength="100"
    />
    <button type="submit" :disabled="isLoading">
      {{ isLoading ? 'Подписка...' : 'Подписаться' }}
    </button>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </form>
</template>

<script setup lang="ts">
import { useSubscriptions } from '~/composables/useSubscriptions'

const emit = defineEmits<{
  subscribed: [groupName: string]
}>()

const { subscribeToGroup } = useSubscriptions()

const key = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleSubscribe() {
  errorMessage.value = ''
  successMessage.value = ''
  const trimmedKey = key.value.trim()
  if (!trimmedKey) {
    errorMessage.value = 'Введите публичный ключ группы'
    return
  }

  isLoading.value = true
  try {
    const groupName = await subscribeToGroup(trimmedKey)
    successMessage.value = `Вы подписаны на группу «${groupName}»`
    emit('subscribed', groupName)
    key.value = ''
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (err: any) {
    errorMessage.value = err.message || 'Ошибка подписки'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped lang="scss">
form {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin: var(--space-3) 0;

  input {
    flex: 1;
    min-width: 200px;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    font-size: var(--font-size-md);
    &:disabled {
      opacity: 0.6;
    }
  }

  button {
    padding: var(--space-2) var(--space-4);
    background: var(--color-primary-500);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.error {
  color: var(--color-error-500);
  margin-top: var(--space-2);
  font-size: var(--font-size-sm);
}

.success {
  color: var(--color-success-500);
  margin-top: var(--space-2);
  font-size: var(--font-size-sm);
}
</style>