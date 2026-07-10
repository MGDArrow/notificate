<template>
  <button
    class="ui-button"
    :class="[
      `ui-button--${variant}`,
      { 'ui-button--loading': loading, 'ui-button--disabled': disabled }
    ]"
    :disabled="disabled || loading"
    @click="emitClick"
  >
    <UiSpinner v-if="loading" size="sm" class="ui-button__spinner" />
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  variant: {
    type: String as PropType<'primary' | 'secondary' | 'danger' | 'ghost'>,
    default: 'primary'
  },
  disabled: Boolean,
  loading: Boolean
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function emitClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped lang="scss">
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-family-base);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  line-height: var(--font-line-normal);
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
  white-space: nowrap;
  min-height: 40px;

  &--primary {
    background: var(--color-primary-500);
    color: var(--color-text-inverse);
    &:hover:not(:disabled) {
      background: var(--color-primary-700);
      box-shadow: var(--shadow-sm);
    }
    &:active:not(:disabled) {
      transform: scale(0.97);
    }
  }

  &--secondary {
    background: var(--color-bg-muted);
    color: var(--color-text-primary);
    &:hover:not(:disabled) {
      background: var(--color-neutral-300);
    }
  }

  &--danger {
    background: var(--color-error-500);
    color: var(--color-text-inverse);
    &:hover:not(:disabled) {
      background: var(--color-error-700);
    }
  }

  &--ghost {
    background: transparent;
    color: var(--color-text-link);
    &:hover:not(:disabled) {
      background: var(--color-bg-muted);
    }
  }

  &--disabled,
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  &--loading {
    cursor: wait;
  }

  &__spinner {
    margin-right: var(--space-1);
  }
}
</style>