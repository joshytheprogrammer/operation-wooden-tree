<template>
<!-- Footer -->
  <footer 
   v-if="$route.name !== 't-slug'" 
  class="bg-gray-100 dark:bg-gray-800 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-3" @click.prevent="$router.push('/')">
          <AppLogo class="h-8 w-auto" />
          <span class="hidden md:block text-gray-700 dark:text-gray-300 font-medium">Operation Wooden Tree</span>
        </div>
        <div class=" flex items-center gap-2 dark:bg-gray-950 bg-white rounded-md px-4 py-2">
          <AppLogout />
          <AppColorMode />
        </div>
        <div class="mt-6 md:mt-0 text-gray-500 dark:text-gray-400 text-sm">
          © {{ new Date().getFullYear() }} Operation Wooden Tree. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>

</script>

<style lang="scss" scoped>

</style>