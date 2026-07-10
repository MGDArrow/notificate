<template>
  <div class="home">
    <header class="home__header">
      <button class="home__menu-btn" @click="toggle" aria-label="Открыть меню">
        ☰
      </button>
      <NuxtLink to="/" class="home__logo">
        <img :src="logoPath" alt="Notificate" width="200" height="auto" />
      </NuxtLink>
    </header>

    <main class="home__main">
      <h1 class="home__title">Notificate</h1>

      <!-- Гостевая часть -->
      <template v-if="!auth.isAuthenticated">
        <UiCard class="home__guest-card">
          <h2 class="home__guest-title">Гостевая подписка</h2>
          <p class="home__guest-hint">
            Подпишитесь на группу, чтобы получать уведомления. Ваши подписки сохранятся в браузере.
            При регистрации они будут привязаны к аккаунту.
          </p>
          <SubscribeForm @subscribed="handleGuestSubscribed" />

          <div v-if="subscriptions.localKeys.value.length" class="home__local-list">
            <h4>Ваши локальные подписки:</h4>
            <ul>
              <li v-for="key in subscriptions.localKeys.value" :key="key" class="home__local-item">
                <code>{{ key }}</code>
                <UiButton variant="danger" size="sm" @click="removeLocalKey(key)">
                  Удалить
                </UiButton>
              </li>
            </ul>
          </div>
        </UiCard>

        <div class="home__auth-toggle">
          <p>Уже есть аккаунт?</p>
          <UiButton @click="showAuthForm = !showAuthForm">
            {{ showAuthForm ? 'Скрыть форму' : 'Войти / Зарегистрироваться' }}
          </UiButton>
        </div>

        <UiCard v-if="showAuthForm" class="home__auth-card">
          <h2>{{ isLoginMode ? 'Вход' : 'Регистрация' }}</h2>
          <form @submit.prevent="handleAuth">
            <UiInput
              v-model="authForm.email"
              type="email"
              label="Email"
              placeholder="example@mail.com"
              :error="authError"
              autocomplete="email"
            />
            <UiInput
              v-model="authForm.password"
              type="password"
              label="Пароль"
              placeholder="••••••••"
              :error="authError"
              :autocomplete="isLoginMode ? 'current-password' : 'new-password'"
            />
            <div class="home__auth-actions">
              <UiButton type="submit" :loading="authLoading">
                {{ isLoginMode ? 'Войти' : 'Зарегистрироваться' }}
              </UiButton>
              <UiButton variant="ghost" @click="toggleAuthMode" type="button" :disabled="authLoading">
                {{ isLoginMode ? 'Нет аккаунта?' : 'Уже есть аккаунт?' }}
              </UiButton>
            </div>
          </form>
        </UiCard>
      </template>

      <!-- Авторизованная часть: только подписки -->
      <template v-else>
        <SubscriptionList />
      </template>
    </main>

    <Sidebar />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~~/stores/auth'
import { useSubscriptions } from '~/composables/useSubscriptions'
import { useSidebar } from '~/composables/useSidebar'

const logoPath = '/logo.png'

const auth = useAuthStore()
const subscriptions = useSubscriptions()
const { toggle } = useSidebar()

// --- Гостевая часть ---
const authForm = ref({ email: '', password: '' })
const isLoginMode = ref(true)
const authLoading = ref(false)
const authError = ref('')
const showAuthForm = ref(false)

// --- Подписки (гостевые) ---
function handleGuestSubscribed() {
  // подписка уже сохранена в localStorage
}
function removeLocalKey(key: string) {
  subscriptions.removeLocalKey(key)
}

// --- Авторизация ---
async function handleAuth() {
  authError.value = ''
  authLoading.value = true
  try {
    if (isLoginMode.value) {
      await auth.login(authForm.value.email, authForm.value.password)
    } else {
      await auth.register(authForm.value.email, authForm.value.password)
    }
    await subscriptions.migrateLocalSubscriptions()
    await subscriptions.syncAfterLogin()
    authForm.value = { email: '', password: '' }
    showAuthForm.value = false
  } catch (err: any) {
    authError.value = err.message || 'Ошибка авторизации'
  } finally {
    authLoading.value = false
  }
}

function toggleAuthMode() {
  isLoginMode.value = !isLoginMode.value
  authError.value = ''
}

// SEO
useSeoMeta({
  title: 'Главная | Notificate',
  description: 'Управление группами и подписками',
})

onMounted(async () => {
  await auth.fetchMe()
  if (auth.isAuthenticated) {
    await subscriptions.fetchSubscriptions()
  }
})
</script>

<style scoped lang="scss">
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    align-items: center;
    padding: var(--space-4) var(--space-6);
    background: var(--color-bg-base);
    border-bottom: 1px solid var(--color-border-default);
    position: relative;
    justify-content: center;
  }

  &__menu-btn {
    position: absolute;
    left: var(--space-6);
    font-size: var(--font-size-2xl);
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-1);
    color: var(--color-text-primary);
    line-height: 1;
    &:hover {
      opacity: 0.7;
    }
  }

  &__logo {
    display: flex;
    align-items: center;
    text-decoration: none;

    img {
      width: 200px;
      height: auto;
    }
  }

  &__main {
    flex: 1;
    padding: var(--space-6);
    max-width: var(--container-lg);
    margin: 0 auto;
    width: 100%;
  }

  &__title {
    text-align: center;
    margin-bottom: var(--space-8);
    font-weight: var(--font-weight-bold);
    letter-spacing: -0.02em;
  }

  // Гостевая часть
  &__guest-card {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--space-8);
  }

  &__guest-title {
    text-align: center;
    margin-bottom: var(--space-2);
  }

  &__guest-hint {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    margin-bottom: var(--space-4);
  }

  &__local-list {
    margin-top: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-border-default);

    h4 {
      font-size: var(--font-size-md);
      margin-bottom: var(--space-3);
    }

    ul {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
  }

  &__local-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    background: var(--color-bg-subtle);
    border-radius: var(--radius-sm);

    code {
      flex: 1;
      font-size: var(--font-size-sm);
      word-break: break-all;
    }
  }

  &__auth-toggle {
    text-align: center;
    margin: var(--space-6) 0;
    p {
      margin-bottom: var(--space-2);
      color: var(--color-text-secondary);
    }
  }

  &__auth-card {
    max-width: 420px;
    margin: 0 auto;
    padding: var(--space-8);
    background: var(--color-bg-subtle);

    h2 {
      text-align: center;
      margin-bottom: var(--space-6);
    }

    form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
  }

  &__auth-actions {
    display: flex;
    gap: var(--space-3);
    justify-content: space-between;
    align-items: center;
    margin-top: var(--space-2);
    flex-wrap: wrap;
  }
}
</style>