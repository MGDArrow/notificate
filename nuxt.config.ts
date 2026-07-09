export default defineNuxtConfig({
  app: {
    head: {
      title: 'Стирка Добра',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=2',
      htmlAttrs: {
        lang: 'ru',
      },
      meta: [
        {
          name: 'description',
          content:
            'Упрвление стирками — Официальный сайт Автономной Некомерческой Организации "ДоброГорловка"',
        },
        { name: 'keywords', content: 'АНО, Доброгорловка' },
        { name: 'theme-color', content: '#a6c729' },
        { name: 'author', content: 'MGDArrow' },
        { name: 'creator', content: 'MGDArrow' },
        { name: 'robots', content: 'noindex' },
        {
          name: 'apple-mobile-web-app-title',
          content: 'Упрвление стирками — Доброгорловка',
        },
      ],
      link: [
        { rel: 'shortcut icon', href: '/favicon.ico' },
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
    },
  }
})