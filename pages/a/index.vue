<script setup>
// Composables
import { useTrees } from '~/composables/useTrees'

const { trees, loading, error } = useTrees()

// Create new tree
const createNewTree = () => {
  navigateTo('/a/t/new')
}

// Delete confirmation
const treeToDelete = ref(null)
const isDeleteModalOpen = ref(false)

const confirmDelete = (tree) => {
  treeToDelete.value = tree
  isDeleteModalOpen.value = true
}

const executeDelete = async () => {
  if (treeToDelete.value) {
    await deleteTree(treeToDelete.value.id)
    isDeleteModalOpen.value = false
    treeToDelete.value = null
  }
};
</script>

<template>
  <div class="min-h-full">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center"> 
        <div class="max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-start md:justify-normal md:items-center gap-4 cursor-pointer" @click="$router.push('/')">
          <AppLogo class="h-10 w-auto" />
          <h1 class="hidden md:block text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Operation Wooden Tree
          </h1>
        </div>
        <UButton
          icon="i-heroicons-plus"
          color="primary"
          @click="createNewTree"
        >
          Create New Tree
        </UButton>
      </div>
    </header>

    <!-- Main content -->
    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <!-- Loading state -->
      <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div v-for="i in 4" :key="i" class="overflow-hidden rounded-xl shadow">
          <div class="p-6 h-full flex flex-col space-y-4">
            <!-- Logo skeleton -->
            <div class="flex justify-center mb-4">
              <USkeleton class="h-16 w-16 rounded-full" />
            </div>
            
            <!-- Name skeleton -->
            <div class="space-y-2">
              <USkeleton class="h-6 w-3/4 mx-auto" />
              <USkeleton class="h-4 w-1/2 mx-auto" />
            </div>
            
            <!-- Links skeleton -->
            <div class="mt-auto space-y-2">
              <USkeleton class="h-8 w-full rounded-md" />
              <USkeleton class="h-8 w-full rounded-md" />
              <USkeleton class="h-8 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <UIcon name="i-heroicons-exclamation-circle" class="h-5 w-5 text-red-400 dark:text-red-300" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
              Error loading trees: {{ error }}
            </h3>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!loading && trees.length === 0" class="text-center py-12">
        <UIcon name="i-heroicons-inbox" class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">
          No trees yet
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating your first tree.
        </p>
        <div class="mt-6">
          <UButton
            icon="i-heroicons-plus"
            color="primary"
            @click="createNewTree"
          >
            Create Tree
          </UButton>
        </div>
      </div>

      <!-- Tree grid -->
      <div v-if="trees.length > 0" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="tree in trees"
          :key="tree.id"
          class="group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          :style="{
            backgroundColor: tree.styles?.backgroundColor || '#ffffff',
            color: tree.styles?.textColor || '#000000'
          }"
        >
          <!-- Tree preview -->
          <NuxtLink :to="`/a/t/${tree.id}`" class="block h-full">
            <div class="p-6 h-full flex flex-col">
              <!-- Tree logo -->
              <div class="flex justify-center mb-4">
                <img
                  v-if="tree.logoUrl"
                  :src="tree.logoUrl"
                  :alt="`${tree.name} logo`"
                  class="h-16 w-auto object-contain"
                >
                <div v-else class="h-16 w-16 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <UIcon name="i-heroicons-tree" class="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </div>
              </div>

              <!-- Tree name -->
              <h3 class="text-center text-xl font-semibold mb-2">
                {{ tree.name }}
              </h3>

              <!-- Tree slug -->
              <p class="text-center text-sm opacity-80 mb-4">
                /t/{{ tree.slug }}
              </p>

              <!-- Preview links (mock) -->
              <div class="mt-auto space-y-2">
                <div
                  v-for="i in 3"
                  :key="i"
                  class="h-8 rounded-md"
                  :style="{
                    backgroundColor: tree.styles?.buttonBackgroundColor || '#4f46e5',
                    color: tree.styles?.buttonTextColor || '#ffffff'
                  }"
                ></div>
              </div>
            </div>
          </NuxtLink>

          <!-- Action buttons -->
          <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-1">
            <UTooltip text="Edit">
              <UButton
                icon="i-heroicons-pencil-square"
                color="gray"
                variant="solid"
                size="xs"
                square
                :ui="{ rounded: 'rounded-full' }"
                :to="`/a/t/${tree.id}`"
              />
            </UTooltip>

            <UTooltip text="Delete">
              <UButton
                icon="i-heroicons-trash"
                color="red"
                variant="solid"
                size="xs"
                square
                :ui="{ rounded: 'rounded-full' }"
                @click.stop="confirmDelete(tree)"
              />
            </UTooltip>
          </div>
        </div>
      </div>
    </main>

    <!-- Delete confirmation modal -->
    <UModal v-model="isDeleteModalOpen">
      <UCard>
        <template #header>
          Confirm Deletion
        </template>

        <p class="text-gray-600 dark:text-gray-300">
          Are you sure you want to delete "{{ treeToDelete?.name }}"?
        </p>

        <template #footer>
          <div class="flex justify-end space-x-3">
            <UButton
              color="gray"
              variant="ghost"
              label="Cancel"
              @click="isDeleteModalOpen = false"
            />
            <UButton
              color="red"
              variant="solid"
              label="Delete"
              :loading="loading"
              @click="executeDelete"
            />
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>