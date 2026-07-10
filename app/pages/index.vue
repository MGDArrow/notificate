<template>
  <div class="home">
    <h1 class="home__title">Notificate</h1>

    <!-- Блок авторизации -->
    <UiCard v-if="!auth.isAuthenticated" class="home__auth-card">
      <h2>{{ isLoginMode ? 'Вход' : 'Регистрация' }}</h2>
      <form @submit.prevent="handleAuth">
        <UiInput v-model="authForm.email" type="email" label="Email" placeholder="example@mail.com" :error="authError"
          autocomplete="email" />
        <UiInput v-model="authForm.password" type="password" label="Пароль" placeholder="••••••••" :error="authError"
          :autocomplete="isLoginMode ? 'current-password' : 'new-password'" />
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

    <!-- Основной контент для авторизованных -->
    <template v-else>
      <div class="home__user-bar">
        <span class="home__user-email">{{ auth.user?.email }}</span>
        <UiButton variant="ghost" @click="logout">Выйти</UiButton>
      </div>

      <!-- Создание группы -->
      <UiCard class="home__create-group">
        <h3>Создать группу</h3>
        <form @submit.prevent="handleCreateGroup" class="home__create-form">
          <UiInput v-model="newGroupName" placeholder="Название группы" :disabled="myGroups.loading.value" />
          <UiButton type="submit" :loading="myGroups.loading.value">Создать</UiButton>
        </form>
        <div v-if="createdGroup" class="home__created-info">
          <p>Группа «<strong>{{ createdGroup.groupName }}</strong>» создана!</p>
          <div class="home__keys">
            <p>
              <span class="home__keys-label">Публичный ключ:</span>
              <code>{{ createdGroup.publicKey }}</code>
              <UiButton variant="ghost" size="sm" @click="copyText(createdGroup.publicKey)">
                Копировать
              </UiButton>
            </p>
            <p>
              <span class="home__keys-label">Секретный ключ:</span>
              <code>{{ createdGroup.secretKey }}</code>
              <UiButton variant="ghost" size="sm" @click="copyText(createdGroup.secretKey)">
                Копировать
              </UiButton>
            </p>
          </div>
          <UiButton variant="ghost" @click="createdGroup = null">Закрыть</UiButton>
        </div>
        <p v-if="myGroups.error" class="home__error">{{ myGroups.error }}</p>
      </UiCard>

      <!-- Мои группы -->
      <div v-if="myGroups.groups.value.length" class="home__section">
        <h3>Мои группы</h3>
        <ul class="home__group-list">
          <li v-for="g in myGroups.groups.value" :key="g.id" class="home__group-item">
      <NuxtLink :to="{ name: 'group-name', params: { name: g.name } }" class="home__group-link">
      {{ g.name }}
    </NuxtLink>
            <UiButton variant="ghost" size="sm" @click="toggleKeys(g.id)">
              {{ expandedGroupId === g.id ? 'Скрыть ключи' : 'Показать ключи' }}
            </UiButton>
            <div v-if="expandedGroupId === g.id" class="home__keys">
              <p>
                <span class="home__keys-label">Public:</span>
                <code>{{ g.publicKey }}</code>
                <UiButton variant="ghost" size="sm" @click="copyText(g.publicKey)">
                  Копировать
                </UiButton>
              </p>
              <p>
                <span class="home__keys-label">Secret:</span>
                <code>{{ g.secretKey }}</code>
                <UiButton variant="ghost" size="sm" @click="copyText(g.secretKey)">
                  Копировать
                </UiButton>
              </p>
            </div>
          </li>
        </ul>
      </div>

      <!-- Подписки -->
      <div class="home__section">
        <h3>Мои подписки</h3>
        <SubscribeForm @subscribed="handleSubscribed" />
        <ul v-if="subscriptions.list.value.length" class="home__subscription-list">
          <li v-for="s in subscriptions.list.value" :key="s.id" class="home__subscription-item">
      <NuxtLink :to="{ name: 'group-name', params: { name: s.groupName } }" class="home__subscription-link">
      {{ s.groupName }}
    </NuxtLink>
            <UiButton variant="danger" size="sm" @click="unsubscribe(s.groupName)"
              :loading="subscriptions.loading.value">
              Отписаться
            </UiButton>
          </li>
        </ul>
        <p v-else class="home__empty">Вы не подписаны ни на одну группу.</p>
        <p v-if="subscriptions.error" class="home__error">{{ subscriptions.error }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~~/stores/auth'
import { useSubscriptions } from '~/composables/useSubscriptions'
import { useMyGroups } from '~/composables/useMyGroups'

// --- Состояние авторизации ---
const auth = useAuthStore()
const authForm = ref({ email: '', password: '' })
const isLoginMode = ref(true)
const authLoading = ref(false)
const authError = ref('')

// --- Композаблы ---
const subscriptions = useSubscriptions()
const myGroups = useMyGroups()

// --- Состояние создания группы ---
const newGroupName = ref('')
const createdGroup = ref<{ groupName: string; publicKey: string; secretKey: string } | null>(null)

// --- Состояние отображения ключей ---
const expandedGroupId = ref<number | null>(null)

// --- Загрузка данных при монтировании ---
onMounted(async () => {
  await auth.fetchMe()
  if (auth.isAuthenticated) {
    await Promise.all([
      subscriptions.fetchSubscriptions(),
      myGroups.fetchMyGroups(),
    ])
  }
})

// --- Обработчики авторизации ---
async function handleAuth() {
  authError.value = ''
  authLoading.value = true
  try {
    if (isLoginMode.value) {
      await auth.login(authForm.value.email, authForm.value.password)
    } else {
      await auth.register(authForm.value.email, authForm.value.password)
    }
    await Promise.all([
      subscriptions.fetchSubscriptions(),
      myGroups.fetchMyGroups(),
    ])
    authForm.value = { email: '', password: '' }
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

async function logout() {
  await auth.logout()
  subscriptions.list.value = []
  myGroups.groups.value = []
}

// --- Создание группы ---
async function handleCreateGroup() {
  if (!newGroupName.value.trim()) return
  try {
    const result = await myGroups.createGroup(newGroupName.value.trim())
    createdGroup.value = result
    newGroupName.value = ''

    // Автоматическая подписка на созданную группу
    try {
      await subscriptions.subscribeToGroup(result.publicKey)
      await subscriptions.fetchSubscriptions()
    } catch (subErr: any) {
      console.warn('Автоподписка не удалась:', subErr.message)
    }
  } catch (err: any) {
    // ошибка уже в myGroups.error
  }
}

// --- Отображение ключей ---
function toggleKeys(id: number) {
  expandedGroupId.value = expandedGroupId.value === id ? null : id
}

// --- Подписки ---
async function handleSubscribed(groupName: string) {
  await subscriptions.fetchSubscriptions()
}

async function unsubscribe(groupName: string) {
  try {
    await subscriptions.unsubscribeGroup(groupName)
  } catch (err: any) {
    // ошибка уже в subscriptions.error
  }
}

// --- Копирование в буфер обмена с уведомлением ---
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    alert('Скопировано!')
  } catch {
    alert('Не удалось скопировать')
  }
}

// --- SEO ---
useSeoMeta({
  title: 'Главная | Notificate',
  description: 'Управление группами и подписками',
})
</script>

<style scoped lang="scss">
.home {
  &__title {
    text-align: center;
    margin-bottom: var(--space-8);
    font-weight: var(--font-weight-bold);
    letter-spacing: -0.02em;
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

  &__user-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) var(--space-4);
    background: var(--color-bg-muted);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-6);
  }

  &__user-email {
    font-weight: var(--font-weight-medium);
  }

  &__create-group {
    margin-bottom: var(--space-6);
  }

  &__create-form {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;

    .ui-input {
      flex: 1;
      min-width: 200px;
    }
  }

  &__created-info {
    margin-top: var(--space-4);
    padding: var(--space-4);
    background: var(--color-success-100);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--color-success-500);

    p {
      margin-bottom: var(--space-2);
    }
  }

  &__section {
    margin-top: var(--space-8);
  }

  &__group-list,
  &__subscription-list {
      display: flex;
  flex-direction: column;
  gap: var(--space-4);          /* было var(--space-3) */
  padding: var(--space-2) 0; 
  }

  &__group-item,
  &__subscription-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-5);
    background: var(--color-bg-subtle);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-default);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    flex-wrap: wrap;

    &:hover {
      border-color: var(--color-border-strong);
      box-shadow: var(--shadow-xs);
    }
  }

  &__group-link,
  &__subscription-link {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-link);
    transition: color var(--transition-fast);

    &:hover {
      color: var(--color-text-link-hover);
      text-decoration: underline;
    }
  }

  &__subscription-item {
    .ui-button {
      margin-left: auto;
    }
  }

  &__keys {
    width: 100%;
    padding: var(--space-3) var(--space-4);
    background: var(--color-bg-base);
    border-radius: var(--radius-sm);
    margin-top: var(--space-2);
    border: 1px dashed var(--color-border-default);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);

    p {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
      margin: 0;
      word-break: break-all;
    }

    code {
      flex: 1;
      background: var(--color-neutral-100);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-sm);
      font-size: 0.9em;
    }

    .ui-button {
      flex-shrink: 0;
    }
  }

  &__keys-label {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    min-width: 60px;
  }

  &__error {
    color: var(--color-error-500);
    margin-top: var(--space-2);
    font-size: var(--font-size-sm);
  }

  &__empty {
    color: var(--color-text-muted);
    font-style: italic;
    padding: var(--space-3);
    text-align: center;
  }
}
</style>