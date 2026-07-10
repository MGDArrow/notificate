<template>
  <div class="app">
    <UiContainer size="lg" class="app__container">
      <header class="app__header">
        <NuxtLink to="/" class="app__logo">
          <img src="/logo.png" alt="Notificate" width="200" height="auto" />
        </NuxtLink>
      </header>
      <main class="app__main">
        <NuxtPage />
      </main>
      <footer class="app__footer">
        <p>&copy; {{ new Date().getFullYear() }} Notificate</p>
      </footer>
    </UiContainer>
  </div>
</template>

<script setup lang="ts">
// Регистрация Service Worker
onMounted(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .catch(err => console.error('SW registration failed', err))
  }
})
</script>

<style scoped lang="scss">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-base);

  &__container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding-top: var(--space-4);
    padding-bottom: var(--space-4);
  }

  &__header {
    display: flex;
    justify-content: center;
    padding: var(--space-6) 0;
    // линия убрана
    margin-bottom: var(--space-6);
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
  }

  &__footer {
    margin-top: var(--space-8);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-border-default);
    text-align: center;
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }
}
</style>