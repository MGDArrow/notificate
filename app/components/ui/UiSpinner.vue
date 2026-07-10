<template>
  <span class="ui-spinner" :class="`ui-spinner--${size}`" />
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  size: {
    type: String as PropType<'sm' | 'md' | 'lg'>,
    default: 'md'
  }
})
</script>

<style scoped lang="scss">
.ui-spinner {
  display: inline-block;
  border: 2px solid var(--color-border-default);
  border-top-color: var(--color-primary-500);
  border-radius: var(--radius-full);
  animation: spin 0.7s linear infinite;

  &--sm {
    width: 16px;
    height: 16px;
    border-width: 2px;
  }
  &--md {
    width: 24px;
    height: 24px;
    border-width: 3px;
  }
  &--lg {
    width: 36px;
    height: 36px;
    border-width: 4px;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>