<template>
  <div class="group-page">
    <div class="group-page__header">
      <NuxtLink to="/" class="group-page__back">← Назад</NuxtLink>
      <h2 class="group-page__title">Группа: {{ route.params.name }}</h2>
      <UiButton @click="refresh" :loading="loading">Обновить</UiButton>
    </div>

    <UiCard v-if="messages.length" class="group-page__messages">
      <ul class="group-page__list">
        <li v-for="msg in messages" :key="msg.id" class="group-page__message">
          <span class="group-page__time">{{ formatTime(msg.timestamp) }}</span>
          <span class="group-page__text">{{ msg.text }}</span>
        </li>
      </ul>
    </UiCard>
    <p v-else-if="!loading" class="group-page__empty">Сообщений пока нет</p>

    <div v-if="loading" class="group-page__skeleton">
      <UiSpinner size="lg" />
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

const route = useRoute()
const messages = ref<any[]>([])
const loading = ref(false)

async function refresh() {
  loading.value = true
  try {
    messages.value = await $fetch(`/api/messages?group=${route.params.name}`)
  } catch (error) {
    console.error('Ошибка загрузки сообщений', error)
  } finally {
    loading.value = false
  }
}

function formatTime(timestamp: string) {
  return dayjs(timestamp).format('DD.MM.YYYY HH:mm')
}

onMounted(refresh)

// SEO
useSeoMeta({
  title: `Группа ${route.params.name} | Notificate`,
  description: `Сообщения группы ${route.params.name}`
})
</script>

<style scoped lang="scss">
.group-page {
  &__header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
  }

  &__back {
    color: var(--color-text-link);
    font-weight: var(--font-weight-medium);
    &:hover {
      text-decoration: underline;
    }
  }

  &__title {
    margin: 0;
    flex: 1;
    font-size: var(--font-size-2xl);
  }

  &__messages {
    padding: var(--space-4);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  &__message {
    display: flex;
    gap: var(--space-4);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    background: var(--color-bg-subtle);
    border-left: 3px solid var(--color-primary-300);

    &:nth-child(odd) {
      background: var(--color-bg-base);
    }
  }

  &__time {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    white-space: nowrap;
    min-width: 130px;
  }

  &__text {
    word-break: break-word;
  }

  &__empty {
    text-align: center;
    color: var(--color-text-muted);
    padding: var(--space-8);
  }

  &__skeleton {
    display: flex;
    justify-content: center;
    padding: var(--space-8);
  }
}
</style>