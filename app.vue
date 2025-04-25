<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <NuxtLoadingIndicator />
    <NuxtPage />
    <AppFooter />
    <AppUpload v-model="isUploadModalOpen" @uploaded="uploaded($event)" />
    <UNotifications />
  </div>
</template>

<script setup>
import { useClipboard } from '@vueuse/core'

const { copy } = useClipboard({ source: 'copy me' })
const isUploadModalOpen = useState('isUploadModalOpen', () => false);

function uploaded(e) {
  copy(e)
  isUploadModalOpen.value = false
}
</script>