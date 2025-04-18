<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <NuxtLoadingIndicator />
    <div class="fixed bottom-4 left-4 z-50 flex items-center gap-2 dark:bg-gray-950 bg-white rounded-md px-4 py-2">
      <AppLogout />
      <AppColorMode />
    </div>
    <NuxtPage />
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