import { defineStore } from 'pinia'
import type { User } from '~/types/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = ref(false)

  async function fetchMe() {
    isLoading.value = true
    try {
      const data = await $fetch<User>('/api/auth/me')
      user.value = data
    } catch {
      user.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function login(email: string, password: string) {
    const data = await $fetch<User>('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    user.value = data
  }

  async function register(email: string, password: string) {
    const data = await $fetch<User>('/api/auth/register', {
      method: 'POST',
      body: { email, password }
    })
    user.value = data
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, isAuthenticated, isLoading, fetchMe, login, register, logout }
})