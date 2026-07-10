<template>
  <div class="ui-toast-container">
    <div
      v-for="msg in messages"
      :key="msg.id"
      class="ui-toast"
      :class="`ui-toast--${msg.type}`"
    >
      {{ msg.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { messages } = useToast()
</script>

<style scoped lang="scss">
.ui-toast-container {
  position: fixed;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  pointer-events: none;
}

.ui-toast {
  pointer-events: auto;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.3s ease;
  max-width: 90vw;

  &--success {
    background: var(--color-success-500);
  }
  &--error {
    background: var(--color-error-500);
  }
  &--info {
    background: var(--color-primary-500);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>