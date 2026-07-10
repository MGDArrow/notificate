<template>
  <div class="ui-container" :class="`ui-container--${size}`">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  size: {
    type: String as PropType<'sm' | 'md' | 'lg' | 'xl'>,
    default: 'lg'
  }
})
</script>

<style scoped lang="scss">
.ui-container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-4);

  &--sm { max-width: var(--container-sm); }
  &--md { max-width: var(--container-md); }
  &--lg { max-width: var(--container-lg); }
  &--xl { max-width: var(--container-xl); }
}
</style>