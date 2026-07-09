<template>
  <div>
    <h2>Группа {{ route.params.name }}</h2>
    <button @click="refresh">Обновить</button>
    <ul>
      <li v-for="msg in messages" :key="msg.id">
        {{ msg.timestamp }} — {{ msg.text }}
      </li>
    </ul>
  </div>
</template>

<script setup>
const route = useRoute()
const messages = ref([])

async function refresh() {
  messages.value = await $fetch(`/api/messages?group=${route.params.name}`)
}
onMounted(refresh)
</script>