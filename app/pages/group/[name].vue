<!-- pages/group/[name].vue -->
<template>
  <div class="group-page">
    <header class="group-page__header">
      <NuxtLink to="/" class="group-page__back">← Назад</NuxtLink>
      <h2 class="group-page__title">Группа: {{ route.params.name }}</h2>
      <UiButton
        @click="refresh"
        :loading="loading"
        :disabled="loading"
      >
        Обновить
      </UiButton>
    </header>

    <!-- Список сообщений -->
    <UiCard v-if="messages.length" class="group-page__messages">
      <ul class="group-page__list">
        <li
          v-for="msg in messages"
          :key="msg.id"
          class="group-page__message-item"
        >
          <MessageCard
            :text="msg.text"
            :data="msg.data"
            :type="msg.type"
            :timestamp="msg.timestamp"
          />
        </li>
      </ul>
    </UiCard>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="group-page__skeleton">
      <UiSpinner size="lg" />
    </div>

    <!-- Нет сообщений -->
    <p v-else-if="!messages.length" class="group-page__empty">
      Сообщений пока нет
    </p>

    <!-- Ошибка -->
    <p v-if="error" class="group-page__error">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

const route = useRoute()
const messages = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function refresh() {
  loading.value = true
  error.value = null
  try {
    messages.value = await $fetch(`/api/messages?group=${route.params.name}`)
  } catch (err: any) {
    error.value = err.message || 'Не удалось загрузить сообщения'
  } finally {
    loading.value = false
  }
}

// SEO
useSeoMeta({
  title: `Группа ${route.params.name} | Notificate`,
  description: `Сообщения группы ${route.params.name}`,
  ogTitle: `Группа ${route.params.name}`,
  ogDescription: `Сообщения группы ${route.params.name}`,
})

// Загружаем при монтировании
onMounted(refresh)
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
    word-break: break-word;
  }

  &__messages {
    padding: var(--space-2);
    background: var(--color-bg-base);
    border: 1px solid var(--color-border-default);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  &__message-item {
    list-style: none;
  }

  &__empty {
    text-align: center;
    color: var(--color-text-muted);
    padding: var(--space-8);
    font-style: italic;
  }

  &__error {
    color: var(--color-error-500);
    padding: var(--space-4);
    border: 1px solid var(--color-border-error);
    border-radius: var(--radius-md);
    margin-top: var(--space-4);
    text-align: center;
  }

  &__skeleton {
    display: flex;
    justify-content: center;
    padding: var(--space-8);
  }
}

@media (min-width: 768px) {
  .group-page {
    &__messages {
      padding: var(--space-4);
    }
  }
}
</style>