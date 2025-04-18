<template>
  <div>
    <!-- Navbar -->
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div class="flex justify-start md:justify-normal md:items-center gap-4">
          <AppLogo class="h-10 w-auto" />
          <h1 class="hidden md:block text-2xl font-bold text-gray-900 dark:text-white">Operation Wooden Tree</h1>
        </div>
        <div class="flex space-x-4">
          <UButton v-if="!user" to="/a/login" variant="ghost">Sign In</UButton>
          <UButton v-else to="/a/" variant="ghost">Dashboard</UButton>
          <UButton to="/a/t/new" color="primary">Create</UButton>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div class="text-center">
          <h1 class="text-2xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
            All Your Links in One Place
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Create your personalized tree of links to share with your audience across platforms.
          </p>
          <div class="flex justify-center gap-4">
            <UButton 
              to="/a/t/new" 
              color="primary" 
              size="lg"
              icon="i-heroicons-arrow-right"
              trailing
            >
              Create a Tree
            </UButton>
            <UButton 
              to="#explore" 
              color="gray" 
              variant="outline" 
              size="lg"
            >
              Explore Trees
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Trees Grid -->
    <section id="explore" class="py-12 md:py-20 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Explore Featured Trees
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover how others are showcasing their content and get inspired for your own tree.
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div v-for="i in 8" :key="i" class="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md h-80"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-6 mx-auto max-w-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <UIcon name="i-heroicons-exclamation-circle" class="h-6 w-6 text-red-400 dark:text-red-300" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                We couldn't load the trees
              </h3>
              <p class="mt-2 text-sm text-red-700 dark:text-red-300">
                Please try again later. {{ error }}
              </p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="trees.length === 0" class="text-center py-12">
          <UIcon name="i-heroicons-tree" class="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" />
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No trees available</h3>
          <p class="mt-2 text-gray-500 dark:text-gray-400">Be the first to create a tree!</p>
          <UButton to="/a/t/new" color="primary" class="mt-6">Create Your Tree</UButton>
        </div>

        <!-- Trees Grid -->
        <div 
          v-else 
          class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <NuxtLink
            v-for="tree in trees"
            :key="tree.id"
            :to="`/t/${tree.slug}`"
            class="group flex flex-col overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            :style="{
              backgroundColor: tree.styles?.backgroundColor || '#ffffff',
              color: tree.styles?.textColor || '#000000',
              fontFamily: tree.styles?.fontFamily || 'sans-serif'
            }"
          >
            <!-- Tree Header -->
            <div class="p-6 flex flex-col items-center">
              <!-- Logo -->
              <div class="mb-4">
                <img 
                  v-if="tree.logoUrl" 
                  :src="tree.logoUrl" 
                  :alt="`${tree.name} logo`" 
                  class="h-16 w-16 object-cover rounded-full "
                >
                <div 
                  v-else 
                  class="h-16 w-16 rounded-full flex items-center justify-center"
                  :style="{
                    backgroundColor: tree.styles?.buttonBackgroundColor || '#4f46e5',
                    color: tree.styles?.buttonTextColor || '#ffffff'
                  }"
                >
                  <UIcon name="i-heroicons-tree" class="h-8 w-8" />
                </div>
              </div>
              
              <!-- Tree Name -->
              <h3 class="text-xl font-bold text-center">{{ tree.name }}</h3>
              <p class="text-sm opacity-75 mt-1">@{{ tree.slug }}</p>
            </div>
            
            <!-- Preview Links -->
            <div class="p-6 pt-2 mt-auto space-y-3">
              <div
                v-for="i in 3"
                :key="i"
                class="h-10 rounded-md flex items-center justify-center text-sm font-medium"
                :style="{
                  backgroundColor: tree.styles?.buttonBackgroundColor || '#4f46e5',
                  color: tree.styles?.buttonTextColor || '#ffffff'
                }"
              >
                 
              </div>
            </div>
            
            <!-- View Tree Button -->
            <div class="mt-auto p-4 pt-0">
              <div 
                class="w-full py-2 rounded-md flex items-center justify-center bg-opacity-10 text-sm font-medium"
                :style="{
                  backgroundColor: tree.styles?.buttonBackgroundColor || '#4f46e5',
                  color: tree.styles?.buttonTextColor || '#ffffff',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: tree.styles?.buttonBackgroundColor || '#4f46e5'
                }"
              >
                View Tree
                <UIcon name="i-heroicons-arrow-right" class="ml-1 h-4 w-4" />
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-100 dark:bg-gray-800 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="flex items-center gap-3">
            <AppLogo class="h-8 w-auto" />
            <span class="hidden md:block text-gray-700 dark:text-gray-300 font-medium">Operation Wooden Tree</span>
          </div>
          <div class="mt-6 md:mt-0 text-gray-500 dark:text-gray-400 text-sm">
            © {{ new Date().getFullYear() }} Operation Wooden Tree. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useTrees } from '~/composables/useTrees'

// Fetch trees data
const { trees, loading, error } = useTrees()

const user = useCurrentUser();

// Define page metadata
useHead({
  title: 'Operation Wooden Tree - Share Your Links',
  meta: [
    { name: 'description', content: 'Create a beautiful tree of links to share across your social platforms.' }
  ]
})
</script>