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
    navigateFallback: null,
    runtimeCaching: [
      {
        // Основная страница и все вложенные маршруты (SPA-навигация)
        urlPattern: ({ request }) => request.mode === 'navigate',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 1 день
          },
          networkTimeoutSeconds: 10,
        },
      },

    ],
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
    vapidPublicKey: process.env.NUXT_PUBLIC_VAPID_PUBLIC_KEY,
  },
  private: {
    vapidPrivateKey: process.env.NUXT_PRIVATE_VAPID_PRIVATE_KEY,
  },
}
})