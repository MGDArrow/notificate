// composables/useToast.ts
import type { ToastMessage } from '~/types/types'

export function useToast() {
  const messages = useState<ToastMessage[]>('toast-messages', () => [])

  function show(text: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
    const id = Date.now() + Math.random()
    messages.value.push({ id, text, type })
    setTimeout(() => {
      messages.value = messages.value.filter(m => m.id !== id)
    }, duration)
  }

  function clear() {
    messages.value = []
  }

  return { messages: readonly(messages), show, clear }
}