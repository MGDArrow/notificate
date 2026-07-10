import type { Group } from '~~/types/types'

export function useMyGroups() {
  const groups = ref<Group[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMyGroups() {
    loading.value = true
    error.value = null
    try {
      groups.value = await $fetch<Group[]>('/api/groups/my')
    } catch (e: any) {
      error.value = e.message || 'Ошибка загрузки групп'
    } finally {
      loading.value = false
    }
  }

  async function createGroup(name: string): Promise<{ groupName: string; publicKey: string; secretKey: string }> {
    const result = await $fetch<{ groupName: string; publicKey: string; secretKey: string }>('/api/group/create', {
      method: 'POST',
      body: { name }
    })
    await fetchMyGroups() // обновить список
    return result
  }

  return { groups, loading, error, fetchMyGroups, createGroup }
}