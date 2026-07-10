<template>
  <div class="ui-input" :class="{ 'ui-input--error': error }">
    <label v-if="label" class="ui-input__label" :for="id">
      {{ label }}
    </label>
    <input
      :id="id"
      class="ui-input__field"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      @input="onInput"
      @blur="emit('blur')"
      @focus="emit('focus')"
    />
    <p v-if="error" class="ui-input__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: Boolean,
  autocomplete: { type: String, default: 'off' }
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
  focus: []
}>()

const id = useId()

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped lang="scss">
.ui-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;

  &__label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
  }

  &__field {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    font-size: var(--font-size-md);
    font-family: var(--font-family-base);
    background: var(--color-bg-base);
    color: var(--color-text-primary);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    width: 100%;
    min-height: 40px;

    &:focus {
      outline: none;
      border-color: var(--color-border-focus);
      box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.2);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &::placeholder {
      color: var(--color-text-muted);
    }
  }

  &--error &__field {
    border-color: var(--color-border-error);
    &:focus {
      box-shadow: 0 0 0 3px rgba(217, 48, 37, 0.2);
    }
  }

  &__error {
    font-size: var(--font-size-sm);
    color: var(--color-error-500);
    margin-top: var(--space-1);
  }
}
</style>