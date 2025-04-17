<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <NuxtLoadingIndicator />
    <div class="fixed top-4 right-4 z-50 flex items-center gap-2">
      <AppLogout />
      <AppColorMode />
    </div>
    <NuxtPage />
    <UNotifications />
  </div>
</template>