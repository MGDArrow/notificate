export const useSidebar = () => {
  const isOpen = useState<boolean>('sidebar-is-open', () => false)

  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  const close = () => {
    isOpen.value = false
  }

  const open = () => {
    isOpen.value = true
  }

  return { isOpen: readonly(isOpen), toggle, close, open }
}