<template>
  <div class="container">
    <h1>Мои группы</h1>
    <div v-if="groups.length">
      <ul>
        <li v-for="g in groups" :key="g">
          <NuxtLink :to="`/group/${g}`">{{ g }}</NuxtLink>
          <button @click="unsubscribe(g)">Отписаться</button>
        </li>
      </ul>
    </div>
    <SubscribeForm @subscribed="addGroup" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SubscribeForm from '~/components/SubscribeForm.vue'

const groups = ref([])

onMounted(() => {
  const stored = localStorage.getItem('subscribedGroups')
  if (stored) groups.value = JSON.parse(stored)
})

function addGroup(group) {
  if (!groups.value.includes(group)) {
    groups.value.push(group)
    localStorage.setItem('subscribedGroups', JSON.stringify(groups.value))
  }
}

async function unsubscribe(group) {
  // отписка на сервере
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (subscription) {
    await $fetch('/api/unsubscribe', {
      method: 'POST',
      body: { group, endpoint: subscription.endpoint }
    })
  }
  groups.value = groups.value.filter(g => g !== group)
  localStorage.setItem('subscribedGroups', JSON.stringify(groups.value))
}
</script>