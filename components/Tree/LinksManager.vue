<script setup>
import { useDraggable } from '@vueuse/core'

const props = defineProps({
  treeId: {
    type: String,
    required: true
  }
})

const { links, error, loading, addLink, updateLink, deleteLink, reorderLinks } = useTreeLinks(props.treeId)

const newLink = ref({
  title: '',
  type: 'url',
  value: '',
  enabled: true,
  pinned: false
})

const isAddLinkModalOpen = ref(false)
const linkToDelete = ref(null)
const isDeleteModalOpen = ref(false)

const handleAddLink = async () => {
  await addLink(newLink.value)
  isAddLinkModalOpen.value = false
  newLink.value = {
    title: '',
    type: 'url',
    value: '',
    enabled: true,
    pinned: false
  }
}

const handleDeleteLink = async () => {
  if (linkToDelete.value) {
    await deleteLink(linkToDelete.value.id)
    isDeleteModalOpen.value = false
    linkToDelete.value = null
  }
}

// Add these new state variables
const draggedLink = ref(null)
const dragOverLink = ref(null)
const isDragging = ref(false)
const linksContainer = useTemplateRef('linksContainer')

const { style: containerStyle } = useDraggable(linksContainer, {
  preventDefault: true,
})

// New handler functions for drag and drop
const handleDragStart = (link) => {
  draggedLink.value = link
  isDragging.value = true
}

const handleDragOver = (e, link) => {
  e.preventDefault()
  if (draggedLink.value && draggedLink.value.id !== link.id) {
    dragOverLink.value = link
  }
}

const handleDragEnd = async () => {
  isDragging.value = false
  
  if (draggedLink.value && dragOverLink.value) {
    // Get current links array
    const currentLinks = [...links.value]
    
    // Find indices of dragged and target links
    const draggedIndex = currentLinks.findIndex(l => l.id === draggedLink.value.id)
    const targetIndex = currentLinks.findIndex(l => l.id === dragOverLink.value.id)
    
    // Reorder array
    const [removed] = currentLinks.splice(draggedIndex, 1)
    currentLinks.splice(targetIndex, 0, removed)
    
    // Update order property based on new positions
    const updatedLinks = currentLinks.map((link, index) => ({
      ...link,
      order: index
    }))

    console.log(updatedLinks)
    
    // Update Firestore with new order
    await reorderLinks(updatedLinks)
  }
  
  // Reset drag state
  draggedLink.value = null
  dragOverLink.value = null
};
</script>

<template>
  <div>
    <!-- Error state -->
    <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <UIcon name="i-heroicons-exclamation-circle" class="h-5 w-5 text-red-400 dark:text-red-300" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
            Error loading links: {{ error }}
          </h3>
        </div>
      </div>
    </div>
    <!-- Loading state -->
    <div v-if="loading" class="space-y-4 flex justify-center">
      <AppSpinner />
    </div>

    <!-- Links list -->
    <div v-else class="space-y-4">
      <div class="flex justify-end">
        <UButton
          icon="i-heroicons-plus"
          color="primary"
          @click="isAddLinkModalOpen = true"
        >
          Add Link
        </UButton>
      </div>

      <div
        class="space-y-3"
        :style="containerStyle"
      >
      <div
        v-for="link in links"
        :key="link.id"
        ref="linksContainer"
        class="group relative p-4 border rounded-lg hover:shadow-md transition-all"
        :class="{
          'ring-2 ring-primary-500': draggedLink?.id === link.id,
          'bg-gray-50 dark:bg-gray-800': dragOverLink?.id === link.id
        }"
        draggable="true"
        @dragstart="handleDragStart(link)"
        @dragover="handleDragOver($event, link)"
        @dragend="handleDragEnd"
        @dragleave="dragOverLink = null"
      >
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center">
                <span class="font-medium">{{ link.title }}</span>
                <span v-if="link.pinned" class="ml-2">
                  <UBadge color="amber" size="xs" label="Pinned" />
                </span>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ link.type }}: {{ link.value }}
              </p>
            </div>

            <div class="flex items-center gap-1">
              <!-- Pinned Toggle -->
              <UTooltip :text="link.pinned ? 'Unpin link' : 'Pin to top'">
                <UButton
                  :icon="link.pinned ? 'heroicons-solid:star' : 'heroicons-outline:star'"
                  :color="link.pinned ? 'amber' : 'gray'"
                  variant="ghost"
                  size="sm"
                  square
                  :class="link.pinned ? 'text-amber-500 hover:text-amber-600' : 'text-gray-400 hover:text-gray-600'"
                  @click="link.pinned = !link.pinned; updateLink(link)"
                />
              </UTooltip>

              <!-- Enabled Toggle -->
              <UTooltip :text="link.enabled ? 'Disable link' : 'Enable link'">
                <UButton
                  :icon="link.enabled ? 'i-heroicons-eye' : 'i-heroicons-eye-slash'"
                  :color="link.enabled ? 'green' : 'gray'"
                  variant="ghost"
                  size="sm"
                  square
                  :class="link.enabled ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-600'"
                  @click="link.enabled = !link.enabled; updateLink(link)"
                />
              </UTooltip>

              <!-- Delete Button -->
              <UTooltip text="Delete link">
                <UButton
                  icon="i-heroicons-trash"
                  color="red"
                  variant="ghost"
                  size="sm"
                  square
                  class="text-red-500 hover:text-red-600"
                  @click="linkToDelete = link; isDeleteModalOpen = true"
                />
              </UTooltip>

              <!-- Drag Handle -->
              <UTooltip text="Drag to reorder">
                <div class="handle cursor-move px-1 ">
                  <UIcon name="i-heroicons-bars-3" class="w-4 h-4" />
                </div>
              </UTooltip>
            </div>
          </div>
        </div>
      </div>

      <div v-if="links.length === 0" class="text-center py-12">
        <UIcon name="i-heroicons-link" class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">
          No links yet
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add your first link to get started
        </p>
        <div class="mt-6">
          <UButton
            icon="i-heroicons-plus"
            color="primary"
            @click="isAddLinkModalOpen = true"
          >
            Add Link
          </UButton>
        </div>
      </div>
    </div>

    <!-- Add Link Modal -->
    <UModal v-model="isAddLinkModalOpen">
      <form @submit.prevent="handleAddLink" class="p-4">
        <UCard>
          <template #header>
            Add New Link
          </template>

          <div class="space-y-4">
            <UFormGroup label="Title" name="title" required>
              <UInput v-model="newLink.title" placeholder="My Awesome Link" />
            </UFormGroup>

            <UFormGroup label="Type" name="type" required>
              <USelect
                v-model="newLink.type"
                :options="[
                  { value: 'url', label: 'URL' },
                  { value: 'email', label: 'Email' },
                  { value: 'phone', label: 'Phone' }
                ]"
              />
            </UFormGroup>

            <UFormGroup label="Value" name="value" required>
              <UInput v-model="newLink.value" :placeholder="newLink.type === 'url' ? 'https://example.com' : newLink.type === 'email' ? 'email@example.com' : '+1234567890'" />
            </UFormGroup>

            <UFormGroup label="Status" name="enabled">
              <UToggle v-model="newLink.enabled" />
            </UFormGroup>

            <UFormGroup label="Pinned" name="pinned">
              <UToggle v-model="newLink.pinned" />
            </UFormGroup>
          </div>

          <template #footer>
            <div class="flex justify-end space-x-3">
              <UButton
                color="gray"
                variant="ghost"
                label="Cancel"
                @click="isAddLinkModalOpen = false"
              />
              <UButton
                type="submit"
                color="primary"
                label="Add Link"
              />
            </div>
          </template>
        </UCard>
      </form>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="isDeleteModalOpen">
      <UCard>
        <template #header>
          Confirm Deletion
        </template>

        <p class="text-gray-600 dark:text-gray-300">
          Are you sure you want to delete "{{ linkToDelete?.title }}"?
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
              @click="handleDeleteLink"
            />
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<style scoped>
.handle {
  cursor: move;
  transition: opacity 0.2s;
}

.group:hover .handle {
  opacity: 1;
}
</style>