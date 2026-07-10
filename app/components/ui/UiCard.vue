<template>
  <div class="ui-card" :class="{ 'ui-card--clickable': clickable }" @click="emitClick">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  clickable?: boolean
}>()

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function emitClick(event: MouseEvent) {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style scoped lang="scss">
.ui-card {
  background: var(--color-bg-base);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base), transform var(--transition-fast);
  border: 1px solid var(--color-border-default);

  &--clickable {
    cursor: pointer;
    &:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    &:active {
      transform: translateY(0);
    }
  }
}
</style>