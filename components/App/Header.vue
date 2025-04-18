<template>
<header class="bg-white dark:bg-gray-800 shadow">
  <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
    <div class="max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex gap-4 cursor-pointer" @click="$router.push('/a')">
      <AppLogo class="h-10 w-auto" />
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Operation Wooden Tree
      </h1>
    </div>
  </div>
</header>
</template>