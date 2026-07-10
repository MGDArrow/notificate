<template>
  <div class="page">
    <h1>Notificate</h1>

    <!-- Блок авторизации -->
    <div v-if="!auth.isAuthenticated" class="auth-block">
      <h2>Вход / Регистрация</h2>
      <form @submit.prevent="handleAuth">
        <div class="form-group">
          <label>Email</label>
          <input v-model="authForm.email" type="email" required />
        </div>
        <div class="form-group">
          <label>Пароль</label>
          <input v-model="authForm.password" type="password" required minlength="6" />
        </div>
        <div class="auth-actions">
          <button type="submit" :disabled="authLoading">
            {{ isLoginMode ? 'Войти' : 'Зарегистрироваться' }}
          </button>
          <button type="button" @click="toggleAuthMode" :disabled="authLoading">
            {{ isLoginMode ? 'Нет аккаунта? Регистрация' : 'Уже есть аккаунт? Вход' }}
          </button>
        </div>
        <p v-if="authError" class="error">{{ authError }}</p>
      </form>
    </div>

    <!-- Основной контент для авторизованных -->
    <div v-else>
      <div class="user-bar">
        <span>{{ auth.user?.email }}</span>
        <button @click="logout">Выйти</button>
      </div>

      <!-- Создание группы -->
      <div class="create-group">
        <h3>Создать новую группу</h3>
        <form @submit.prevent="handleCreateGroup">
          <input v-model="newGroupName" placeholder="Название группы" :disabled="myGroups.loading" />
          <button type="submit" :disabled="myGroups.loading">
            {{ myGroups.loading ? 'Создание...' : 'Создать' }}
          </button>
        </form>
        <div v-if="createdGroup">
          <p>Группа «{{ createdGroup.groupName }}» создана!</p>
          <p><strong>Публичный ключ:</strong> <code>{{ createdGroup.publicKey }}</code></p>
          <p><strong>Секретный ключ:</strong> <code>{{ createdGroup.secretKey }}</code></p>
          <button @click="createdGroup = null">Закрыть</button>
        </div>
        <p v-if="myGroups.error" class="error">{{ myGroups.error }}</p>
      </div>

      <!-- Мои группы -->
      <div v-if="myGroups.groups.length">
        <h3>Мои группы</h3>
        <ul>
          <li v-for="g in myGroups.groups" :key="g.id">
            <strong>{{ g.name }}</strong>
            <button @click="toggleKeys(g.id)">Показать ключи</button>
            <div v-if="expandedGroupId === g.id" class="keys">
              <p><strong>Public:</strong> <code>{{ g.publicKey }}</code></p>
              <p><strong>Secret:</strong> <code>{{ g.secretKey }}</code></p>
            </div>
          </li>
        </ul>
      </div>

      <!-- Подписки -->
      <div>
        <h3>Мои подписки</h3>
        <SubscribeForm
          @subscribed="handleSubscribed"
          :loading="subscriptions.loading"
        />
        <ul v-if="subscriptions.list.length">
          <li v-for="s in subscriptions.list" :key="s.id">
            {{ s.groupName }}
            <button @click="unsubscribe(s.groupName)" :disabled="subscriptions.loading">Отписаться</button>
          </li>
        </ul>
        <p v-else>Вы не подписаны ни на одну группу.</p>
        <p v-if="subscriptions.error" class="error">{{ subscriptions.error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~~/stores/auth'
import { useSubscriptions } from '~/composables/useSubscriptions'
import { useMyGroups } from '~/composables/useMyGroups'
import SubscribeForm from '~/components/SubscribeForm.vue'

// Авторизация
const auth = useAuthStore()
const authForm = ref({ email: '', password: '' })
const isLoginMode = ref(true)
const authLoading = ref(false)
const authError = ref('')

// Подписки и группы
const subscriptions = useSubscriptions()
const myGroups = useMyGroups()
const newGroupName = ref('')
const createdGroup = ref<{ groupName: string; publicKey: string; secretKey: string } | null>(null)
const expandedGroupId = ref<number | null>(null)

// Загрузка данных при монтировании
onMounted(async () => {
  await auth.fetchMe()
  if (auth.isAuthenticated) {
    await Promise.all([
      subscriptions.fetchSubscriptions(),
      myGroups.fetchMyGroups()
    ])
  }
})

// Обработчик авторизации
async function handleAuth() {
  authError.value = ''
  authLoading.value = true
  try {
    if (isLoginMode.value) {
      await auth.login(authForm.value.email, authForm.value.password)
    } else {
      await auth.register(authForm.value.email, authForm.value.password)
    }
    // После успешного входа загружаем данные
    await Promise.all([
      subscriptions.fetchSubscriptions(),
      myGroups.fetchMyGroups()
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
  // очищаем локальные данные
  subscriptions.list.value = []
  myGroups.groups.value = []
}

// Создание группы
async function handleCreateGroup() {
  if (!newGroupName.value.trim()) return
  try {
    const result = await myGroups.createGroup(newGroupName.value.trim())
    createdGroup.value = result
    newGroupName.value = ''
  } catch (err: any) {
    // ошибка уже в myGroups.error
  }
}

// Раскрытие ключей
function toggleKeys(id: number) {
  expandedGroupId.value = expandedGroupId.value === id ? null : id
}

// Подписка (вызывается из SubscribeForm)
async function handleSubscribed(groupName: string) {
  await subscriptions.fetchSubscriptions()
}

// Отписка
async function unsubscribe(groupName: string) {
  try {
    await subscriptions.unsubscribeGroup(groupName)
  } catch (err: any) {
    // ошибка уже в subscriptions.error
  }
}
</script>

<style scoped lang="scss">
.page {
  max-width: var(--container-lg);
  margin: 0 auto;
  padding: var(--space-6);

  h1 {
    font-size: var(--font-size-3xl);
    margin-bottom: var(--space-6);
  }

  .auth-block {
    max-width: 400px;
    margin: 0 auto;
    padding: var(--space-6);
    background: var(--color-bg-subtle);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);

    .form-group {
      margin-bottom: var(--space-4);
      label {
        display: block;
        font-weight: var(--font-weight-medium);
        margin-bottom: var(--space-1);
      }
      input {
        width: 100%;
        padding: var(--space-2) var(--space-3);
        border: 1px solid var(--color-border-default);
        border-radius: var(--radius-md);
        font-size: var(--font-size-md);
      }
    }

    .auth-actions {
      display: flex;
      gap: var(--space-3);
      flex-wrap: wrap;
      button {
        padding: var(--space-2) var(--space-4);
        border: none;
        border-radius: var(--radius-md);
        background: var(--color-primary-500);
        color: white;
        cursor: pointer;
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        &:last-child {
          background: transparent;
          color: var(--color-text-link);
          text-decoration: underline;
        }
      }
    }
  }

  .user-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) var(--space-4);
    background: var(--color-bg-muted);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-6);
  }

  .create-group {
    background: var(--color-bg-subtle);
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-6);

    form {
      display: flex;
      gap: var(--space-3);
      input {
        flex: 1;
        padding: var(--space-2) var(--space-3);
        border: 1px solid var(--color-border-default);
        border-radius: var(--radius-md);
        font-size: var(--font-size-md);
      }
      button {
        padding: var(--space-2) var(--space-4);
        background: var(--color-primary-500);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }
    .keys {
      margin-top: var(--space-3);
      padding: var(--space-3);
      background: var(--color-bg-base);
      border-radius: var(--radius-md);
      code {
        background: var(--color-neutral-100);
        padding: 0.2rem 0.4rem;
        border-radius: var(--radius-sm);
        word-break: break-all;
        font-size: var(--font-size-sm);
      }
    }
  }

  ul {
    list-style: none;
    padding: 0;
    li {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2) 0;
      border-bottom: 1px solid var(--color-border-default);
      button {
        background: var(--color-error-500);
        color: white;
        border: none;
        border-radius: var(--radius-sm);
        padding: var(--space-1) var(--space-3);
        cursor: pointer;
        &:disabled {
          opacity: 0.6;
        }
      }
    }
  }

  .error {
    color: var(--color-error-500);
    margin-top: var(--space-2);
  }
}
</style>