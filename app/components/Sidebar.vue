<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="sidebar-overlay" @click="close" />
    </Transition>
    <Transition name="slide">
      <aside v-if="isOpen" class="sidebar" role="dialog" aria-label="Боковое меню">
        <div class="sidebar__header">
          <span class="sidebar__title">Меню</span>
          <UiButton variant="ghost" @click="close" class="sidebar__close">
            ✕
          </UiButton>
        </div>

        <div v-if="auth.isAuthenticated" class="sidebar__content">
          <div class="sidebar__user">
            <span class="sidebar__email">{{ auth.user?.email }}</span>
            <UiButton variant="ghost" @click="logout" class="sidebar__logout">
              Выйти
            </UiButton>
          </div>

          <hr class="sidebar__divider" />

          <CreateGroupForm @created="onGroupCreated" />

          <hr class="sidebar__divider" />

          <GroupList
            :groups="myGroups.groups.value"
            @refresh="myGroups.fetchMyGroups()"
          />
        </div>

        <div v-else class="sidebar__guest">
          <p>Войдите, чтобы управлять группами</p>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useAuthStore } from '~~/stores/auth'
import { useMyGroups } from '~/composables/useMyGroups'
import { useSidebar } from '~/composables/useSidebar'

const auth = useAuthStore()
const myGroups = useMyGroups()
const { isOpen, close } = useSidebar()

onMounted(() => {
  if (auth.isAuthenticated) {
    myGroups.fetchMyGroups()
  }
})

watch(
  () => auth.isAuthenticated,
  (isAuth) => {
    if (isAuth) {
      myGroups.fetchMyGroups()
    } else {
      myGroups.groups.value = []
    }
  },
  { immediate: false }
)

async function logout() {
  await auth.logout()
  myGroups.groups.value = []
  close()
}

function onGroupCreated() {
  myGroups.fetchMyGroups()
}
</script>

<style scoped lang="scss">
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: var(--z-modal);
  backdrop-filter: blur(2px);
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  background: var(--color-bg-base);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-modal);
  display: flex;
  flex-direction: column;
  padding: var(--space-4) var(--space-6);
  overflow-y: auto;
  transition: transform var(--transition-base);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-3);
    border-bottom: 1px solid var(--color-border-default);
  }

  &__title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
  }

  &__close {
    padding: 0;
    width: 32px;
    height: 32px;
    font-size: var(--font-size-lg);
    line-height: 1;
    border-radius: var(--radius-full);
    background: transparent;
    border: none;
    cursor: pointer;
    &:hover {
      background: var(--color-bg-muted);
    }
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  &__user {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
  }

  &__email {
    font-weight: var(--font-weight-medium);
    word-break: break-all;
  }

  &__logout {
    flex-shrink: 0;
  }

  &__divider {
    border: none;
    border-top: 1px solid var(--color-border-default);
    margin: 0;
  }

  &__guest {
    padding: var(--space-6) 0;
    text-align: center;
    color: var(--color-text-secondary);
  }
}

// Анимации
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform var(--transition-base);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

@media (min-width: 768px) {
  .sidebar {
    max-width: 400px; // увеличено с 320px до 400px
  }
}
</style>