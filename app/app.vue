<template>
  <div>
    <NuxtPage/>
  </div>
</template>


<script setup>
onMounted(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered', reg))
      .catch(err => console.error('SW registration failed', err))
  }
})
</script>