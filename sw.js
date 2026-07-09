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