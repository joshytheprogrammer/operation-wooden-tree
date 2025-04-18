<script setup>
const route = useRoute()
const treeId = route.params.id

const tabs = [
  {
    slot: 'links',
    label: 'Link Collection',
    icon: 'i-heroicons-link',
    description: 'Manage your collection of links and their appearance.'
  },
  {
    slot: 'customization',
    label: 'Branding',
    icon: 'i-heroicons-paint-brush',
    description: 'Customize the look and feel of your link tree.'
  },
  {
    slot: 'analytics',
    label: 'Analytics',
    icon: 'i-heroicons-chart-bar',
    description: 'View insights and statistics about your link performance.'
  }
];

const isUploadModalOpen = ref(false);
</script>

<template>
  <div class="min-h-full">
    <AppHeader />

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <UTabs :items="tabs" class="w-full">
        <template #links="{ item }">
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon :name="item.icon" class="w-5 h-5" />
                <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                  {{ item.label }}
                </h3>
              </div>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ item.description }}
              </p>
            </template>
            
            <TreeLinksManager :tree-id="treeId" />
          </UCard>
        </template>
        
        <template #customization="{ item }">
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon :name="item.icon" class="w-5 h-5" />
                <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                  {{ item.label }}
                </h3>
              </div>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ item.description }}
              </p>
            </template>
            
            <TreeCustomization :tree-id="treeId" />
          </UCard>
        </template>
        
        <template #analytics="{ item }">
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon :name="item.icon" class="w-5 h-5" />
                <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                  {{ item.label }}
                </h3>
                <UBadge label="Soon" size="xs" />
              </div>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ item.description }}
              </p>
            </template>
            
            <div class="text-center py-12">
              <UIcon name="i-heroicons-chart-bar" class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                Analytics Coming Soon
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                We're working on bringing you detailed analytics for your tree.
              </p>
              <button @click="isUploadModalOpen = !isUploadModalOpen">Click to upload</button>
              <AppUpload v-model="isUploadModalOpen" @uploaded="console.log($event)" />
            </div>
          </UCard>
        </template>
      </UTabs>
    </main>
  </div>
</template>