export default defineNuxtConfig({
  app: {
    head: {
      title: 'Notificate',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
      htmlAttrs: {
        lang: 'ru',
      },
      meta: [
        {
          name: 'description',
          content:
            'Система управления уведомлениями',
        },
        { name: 'keywords', content: 'Notificate' },
        { name: 'theme-color', content: '#e2bd64' },
        { name: 'author', content: 'MGDArrow' },
        { name: 'creator', content: 'MGDArrow' },
        { name: 'robots', content: 'noindex' },
        {
          name: 'apple-mobile-web-app-title',
          content: 'Notificate',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon',  href: '/apple-touch-icon.png', sizes: '180x180' },
        { rel: 'manifest', href: '/manifest.json' },
      ],
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
      jwtSecret: process.env.NUXT_PRIVATE_VAPID_PRIVATE_KEY,
    },
  },
  modules: ['@pinia/nuxt'],
})