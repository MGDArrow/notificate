<!-- components/MessageCard.vue -->
<template>
  <div class="message-card" :class="{ 'message-card--has-type': type }">
    <!-- Заголовок (если есть) -->
    <div v-if="title" class="message-card__title">{{ title }}</div>
    <!-- Основной текст -->
    <div class="message-card__text">{{ text }}</div>
    <!-- Дополнительные поля -->
    <div v-if="type" class="message-card__details">
      <template v-if="type === 'build'">
        <div class="message-card__detail">
          <span class="label">Проект:</span> {{ data.projectName }}
        </div>
        <div class="message-card__detail">
          <span class="label">Приложение:</span> {{ data.applicationName }}
        </div>
        <div class="message-card__detail" v-if="data.buildLink">
          <span class="label">Ссылка:</span>
          <a :href="data.buildLink" target="_blank" rel="noopener">Открыть сборку</a>
        </div>
        <div class="message-card__detail" v-if="data.status">
          <span class="label">Статус:</span>
          <span :class="`status-${data.status}`">{{ data.status }}</span>
        </div>
      </template>
      <template v-else-if="type === 'dokploy-backup'">
        <div class="message-card__detail">
          <span class="label">Тип бэкапа:</span> {{ data.backupType }}
        </div>
        <div class="message-card__detail">
          <span class="label">Размер:</span> {{ data.backupSize }}
        </div>
        <div class="message-card__detail" v-if="data.status">
          <span class="label">Статус:</span>
          <span :class="`status-${data.status}`">{{ data.status }}</span>
        </div>
      </template>
      <!-- Для всех остальных типов или при отсутствии type показываем все поля -->
      <template v-else>
        <div v-for="(value, key) in extraFields" :key="key" class="message-card__detail">
          <span class="label">{{ formatKey(key) }}:</span>
          <span v-if="isUrl(value)"><a :href="value" target="_blank" rel="noopener">{{ value }}</a></span>
          <span v-else>{{ value }}</span>
        </div>
      </template>
    </div>
    <div class="message-card__timestamp">{{ formattedTimestamp }}</div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

const props = defineProps<{
  text: string
  data: any
  type?: string | null
  timestamp: string
}>()

const title = computed(() => props.data?.title)
const formattedTimestamp = computed(() => dayjs(props.timestamp).format('DD.MM.YYYY HH:mm'))

// Поля, которые не являются служебными (title, message, text, timestamp, type, group)
const extraFields = computed(() => {
  if (!props.data) return {}
  const ignore = ['title', 'message', 'text', 'timestamp', 'type', 'group']
  return Object.fromEntries(
    Object.entries(props.data).filter(([key]) => !ignore.includes(key))
  )
})

function formatKey(key: string): string {
  // Преобразуем camelCase в читаемый заголовок
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

function isUrl(value: any): boolean {
  return typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))
}
</script>

<style scoped lang="scss">
.message-card {
  background: var(--color-bg-subtle);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-primary-300);
  margin-bottom: var(--space-2);

  &--has-type {
    border-left-color: var(--color-secondary-500);
  }

  &__title {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-md);
    margin-bottom: var(--space-1);
    color: var(--color-text-primary);
  }

  &__text {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-2);
  }

  &__details {
    margin: var(--space-2) 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  &__detail {
    font-size: var(--font-size-sm);
    display: flex;
    gap: var(--space-2);
    .label {
      font-weight: var(--font-weight-medium);
      color: var(--color-text-muted);
      min-width: 80px;
    }
    a {
      color: var(--color-text-link);
      &:hover {
        text-decoration: underline;
      }
    }
    .status-success {
      color: var(--color-success-500);
    }
    .status-error {
      color: var(--color-error-500);
    }
  }

  &__timestamp {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    margin-top: var(--space-2);
    text-align: right;
  }
}
</style>