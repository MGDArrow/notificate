export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt'],
  pwa: {
    manifest: {
      name: 'Group Notifier',
      short_name: 'Notifier',
      description: 'Получайте уведомления по группам',
      theme_color: '#ffffff',
      icons: [
        {
          src: 'icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
    },
      injectRegister: 'auto',
  registerSw: true,
  swUrl: '/sw.js',
    registerType: 'autoUpdate',
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
  nitro: {
    preset: 'node-server', // для Docker
  },
  runtimeConfig: {
    public: {
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
    },
    private: {
      vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
    },
  },
})