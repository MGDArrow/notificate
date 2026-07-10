<template>
  <form @submit.prevent="handleSubscribe" class="subscribe-form">
    <UiInput
      v-model="key"
      placeholder="Введите публичный ключ группы"
      :disabled="isLoading"
      :error="errorMessage"
    />
    <UiButton type="submit" :loading="isLoading">Подписаться</UiButton>
    <p v-if="successMessage" class="subscribe-form__success">{{ successMessage }}</p>
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
.subscribe-form {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: flex-start;

  .ui-input {
    flex: 1;
    min-width: 200px;
  }

  &__success {
    width: 100%;
    color: var(--color-success-500);
    font-size: var(--font-size-sm);
    margin-top: var(--space-1);
  }
}
</style>