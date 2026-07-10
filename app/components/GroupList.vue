<template>
  <div v-if="groups.length" class="group-list">
    <h3 class="group-list__title">Мои группы</h3>
    <ul class="group-list__items">
      <li v-for="g in groups" :key="g.id" class="group-list__item">
        <div class="group-list__item-header">
          <span class="group-list__name">{{ g.name }}</span>
          <div class="group-list__actions">
            <UiButton
              variant="ghost"
              size="sm"
              @click="toggleKeys(g.id)"
              title="Показать ключи"
            >
              👁️
            </UiButton>
            <UiButton
              variant="ghost"
              size="sm"
              @click="refresh(g.id)"
              :loading="refreshing[g.id]"
              title="Обновить ключи"
            >
              🔄
            </UiButton>
            <UiButton
              variant="danger"
              size="sm"
              @click="remove(g.id)"
              :loading="deleting[g.id]"
              title="Удалить группу"
            >
              🗑️
            </UiButton>
          </div>
        </div>
        <div v-if="expandedId === g.id" class="group-list__keys">
          <div class="group-list__key-row">
            <span class="group-list__key-label">Public:</span>
            <code class="group-list__key-code">{{ g.publicKey }}</code>
            <UiButton
              variant="ghost"
              size="sm"
              @click="copy(g.publicKey)"
              class="group-list__copy-btn"
              title="Копировать"
            >
              📋
            </UiButton>
          </div>
          <div class="group-list__key-row">
            <span class="group-list__key-label">Secret:</span>
            <code class="group-list__key-code">{{ g.secretKey }}</code>
            <UiButton
              variant="ghost"
              size="sm"
              @click="copy(g.secretKey)"
              class="group-list__copy-btn"
              title="Копировать"
            >
              📋
            </UiButton>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Group } from '~/types/types'
import { useMyGroups } from '~/composables/useMyGroups'
import { useToast } from '~/composables/useToast'

const props = defineProps<{
  groups: Group[]
}>()

const emit = defineEmits<{
  refresh: []
}>()

const myGroups = useMyGroups()
const toast = useToast()

const expandedId = ref<number | null>(null)
const refreshing = ref<Record<number, boolean>>({})
const deleting = ref<Record<number, boolean>>({})

function toggleKeys(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}

async function refresh(id: number) {
  refreshing.value[id] = true
  try {
    const result = await $fetch<{ publicKey: string; secretKey: string }>(
      `/api/group/${id}/refresh-keys`,
      { method: 'POST' }
    )
    const group = props.groups.find(g => g.id === id)
    if (group) {
      group.publicKey = result.publicKey
      group.secretKey = result.secretKey
    }
    toast.show('Ключи обновлены', 'success')
    emit('refresh')
  } catch (err: any) {
    toast.show(err.message || 'Ошибка обновления ключей', 'error')
  } finally {
    delete refreshing.value[id]
  }
}

async function remove(id: number) {
  if (!confirm('Удалить группу? Это действие необратимо.')) return
  deleting.value[id] = true
  try {
    await $fetch(`/api/group/${id}`, { method: 'DELETE' })
    toast.show('Группа удалена', 'success')
    emit('refresh')
  } catch (err: any) {
    toast.show(err.message || 'Ошибка удаления группы', 'error')
  } finally {
    delete deleting.value[id]
  }
}

function copy(text: string) {
  navigator.clipboard.writeText(text)
    .then(() => toast.show('Скопировано!', 'success'))
    .catch(() => toast.show('Не удалось скопировать', 'error'))
}
</script>

<style scoped lang="scss">
.group-list {
  &__title {
    font-size: var(--font-size-md);
    margin-bottom: var(--space-3);
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  &__item {
    background: var(--color-bg-subtle);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3); // уменьшены вертикальные отступы
    border: 1px solid var(--color-border-default);

    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-1); // уменьшен зазор
    }
  }

  &__name {
    font-weight: var(--font-weight-medium);
    flex: 1;                 // название растягивается
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis; // длинные названия обрезаются
  }

  &__actions {
    display: flex;
    gap: var(--space-1);
    flex-shrink: 0;          // кнопки не сжимаются
  }

  &__keys {
    margin-top: var(--space-3);
    padding-top: var(--space-3);
    border-top: 1px dashed var(--color-border-default);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  &__key-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-sm);
  }

  &__key-label {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    white-space: nowrap;
  }

  &__key-code {
    flex: 1;
    overflow-x: auto;
    white-space: nowrap;
    background: var(--color-bg-base);
    padding: 0.2rem 0.6rem;
    border-radius: var(--radius-sm);
    font-family: var(--font-family-mono);
    font-size: 0.9em;
    min-width: 0;
    scrollbar-width: thin;
  }

  &__copy-btn {
    flex-shrink: 0;
    min-width: 28px;
    height: 28px;
    padding: 0;
    font-size: var(--font-size-sm);
    line-height: 1;
    border-radius: var(--radius-full);
  }
}
</style>