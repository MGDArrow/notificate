<template>
  <div class="subscription-list">
    <h3 class="subscription-list__title">Мои подписки</h3>
    <SubscribeForm @subscribed="onSubscribed" />
    <div v-if="loading" class="subscription-list__loading">
      <UiSpinner size="sm" />
    </div>
    <ul v-else-if="list.length" class="subscription-list__items">
      <li v-for="s in list" :key="s.id" class="subscription-list__item">
        <NuxtLink :to="`/group/${s.groupName}`" class="subscription-list__link">
          {{ s.groupName }}
        </NuxtLink>
        <UiButton variant="danger" size="sm" @click="unsubscribe(s.groupName)">
          Отписаться
        </UiButton>
      </li>
    </ul>
    <p v-else class="subscription-list__empty">Вы не подписаны ни на одну группу.</p>
    <p v-if="error" class="subscription-list__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { useSubscriptions } from '~/composables/useSubscriptions'

const subscriptions = useSubscriptions()
const { list, loading, error } = storeToRefs(subscriptions)

async function onSubscribed() {
  await subscriptions.fetchSubscriptions()
}

async function unsubscribe(groupName: string) {
  try {
    await subscriptions.unsubscribeGroup(groupName)
  } catch (err: any) {
    // ошибка уже в subscriptions.error
  }
}

// Загружаем при монтировании
onMounted(() => {
  subscriptions.fetchSubscriptions()
})
</script>

<style scoped lang="scss">
.subscription-list {
  &__title {
    font-size: var(--font-size-2xl);
    margin-bottom: var(--space-4);
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-top: var(--space-4);
  }

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) var(--space-4);
    background: var(--color-bg-subtle);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-default);
  }

  &__link {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-link);
    &:hover {
      text-decoration: underline;
    }
  }

  &__empty {
    color: var(--color-text-muted);
    font-style: italic;
    padding: var(--space-4) 0;
    text-align: center;
  }

  &__error {
    color: var(--color-error-500);
    margin-top: var(--space-2);
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: var(--space-4);
  }
}
</style>