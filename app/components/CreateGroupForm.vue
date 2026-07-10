<template>
  <div class="create-group">
    <h3 class="create-group__title">Создать группу</h3>
    <form @submit.prevent="handleCreate" class="create-group__form">
      <UiInput
        v-model="groupName"
        placeholder="Название группы"
        :disabled="loading"
      />
      <UiButton type="submit" :loading="loading">Создать</UiButton>
    </form>
    <p v-if="error" class="create-group__error">{{ error }}</p>

    <div v-if="created" class="create-group__result">
      <p>Группа «<strong>{{ created.groupName }}</strong>» создана!</p>
      <div class="create-group__keys">
        <div class="create-group__key-row">
          <span class="create-group__key-label">Публичный:</span>
          <code class="create-group__key-code">{{ created.publicKey }}</code>
          <UiButton
            variant="ghost"
            size="sm"
            @click="copy(created.publicKey)"
            title="Копировать"
            class="create-group__copy-btn"
          >
            📋
          </UiButton>
        </div>
        <div class="create-group__key-row">
          <span class="create-group__key-label">Секретный:</span>
          <code class="create-group__key-code">{{ created.secretKey }}</code>
          <UiButton
            variant="ghost"
            size="sm"
            @click="copy(created.secretKey)"
            title="Копировать"
            class="create-group__copy-btn"
          >
            📋
          </UiButton>
        </div>
      </div>
      <UiButton variant="ghost" @click="created = null">Закрыть</UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMyGroups } from '~/composables/useMyGroups'
import { useToast } from '~/composables/useToast'

const myGroups = useMyGroups()
const toast = useToast()

const groupName = ref('')
const loading = ref(false)
const error = ref('')
const created = ref<{ groupName: string; publicKey: string; secretKey: string } | null>(null)

async function handleCreate() {
  const name = groupName.value.trim()
  if (!name) return
  loading.value = true
  error.value = ''
  try {
    const result = await myGroups.createGroup(name)
    created.value = result
    groupName.value = ''
    // Автоподписка на созданную группу (если нужно)
    // Можно оставить или убрать — здесь не трогаем
  } catch (err: any) {
    error.value = err.message || 'Ошибка создания группы'
  } finally {
    loading.value = false
  }
}

function copy(text: string) {
  navigator.clipboard.writeText(text)
    .then(() => toast.show('Скопировано!', 'success'))
    .catch(() => toast.show('Не удалось скопировать', 'error'))
}
</script>

<style scoped lang="scss">
.create-group {
  &__title {
    font-size: var(--font-size-md);
    margin-bottom: var(--space-3);
  }

  &__form {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;

    .ui-input {
      flex: 1;
      min-width: 120px;
    }
  }

  &__error {
    color: var(--color-error-500);
    font-size: var(--font-size-sm);
    margin-top: var(--space-2);
  }

  &__result {
    margin-top: var(--space-3);
    padding: var(--space-3);
    background: var(--color-success-100);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--color-success-500);
  }

  &__keys {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin: var(--space-2) 0;
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