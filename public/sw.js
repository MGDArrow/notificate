self.addEventListener('push', (event) => {
  let data = {}
  if (event.data) {
    try {
      data = event.data.json()
    } catch {
      data = { title: 'Новое уведомление', body: event.data.text() }
    }
  }
  const options = {
    body: data.body || 'У вас новое уведомление',
    icon: '/web-app-manifest-192x192.png',
    data: { group: data.group || '' },
    vibrate: [500, 50, 50, 50, 50, 50, 50],
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Уведомление', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const group = event.notification.data?.group || ''
  const url = group ? `/group/${group}` : '/'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})