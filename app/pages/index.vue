<template>
  <div class="container">
    <h1>Мои группы</h1>

    <!-- Блок создания -->
    <div class="create-group">
      <h3>Создать новую группу</h3>
      <form @submit.prevent="createGroup">
        <input
          v-model="newGroupName"
          placeholder="Название группы"
          :disabled="creating"
        />
        <button type="submit" :disabled="creating">
          {{ creating ? 'Создание...' : 'Создать' }}
        </button>
      </form>
      <div v-if="createdGroup">
        <p>Группа «{{ createdGroup.groupName }}» создана!</p>
        <p><strong>Публичный ключ (для подписки):</strong> <code>{{ createdGroup.publicKey }}</code></p>
        <p><strong>Секретный ключ (для отправки):</strong> <code>{{ createdGroup.secretKey }}</code></p>
        <button @click="createdGroup = null">Закрыть</button>
      </div>
    </div>

    <!-- Список подписок -->
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
const newGroupName = ref('')
const creating = ref(false)
const createdGroup = ref(null)

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
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (subscription) {
    await $fetch('/api/unsubscribe', {
      method: 'POST',
      body: { endpoint: subscription.endpoint }
    })
  }
  groups.value = groups.value.filter(g => g !== group)
  localStorage.setItem('subscribedGroups', JSON.stringify(groups.value))
}

async function createGroup() {
  if (!newGroupName.value.trim()) return
  creating.value = true
  try {
    const result = await $fetch('/api/group/create', {
      method: 'POST',
      body: { name: newGroupName.value.trim() }
    })
    createdGroup.value = result
    newGroupName.value = ''
  } catch (err) {
    console.error('Ошибка создания группы', err)
    alert('Не удалось создать группу')
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
.create-group {
  margin: 1.5rem 0;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.create-group code {
  background: #f0f0f0;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  word-break: break-all;
}
</style>