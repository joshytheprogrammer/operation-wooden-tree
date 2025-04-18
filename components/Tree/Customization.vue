<script setup>
const props = defineProps({
  treeId: {
    type: String,
    required: true
  }
})

const { tree, loading, error, updateTree } = useTree(props.treeId)
const isUploadModalOpen = useState('isUploadModalOpen')

const handleSubmit = async () => {
  await updateTree(tree.value)
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
            Error loading tree: {{ error }}
          </h3>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="space-y-6">
      <USkeleton class="h-10 w-1/3" />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <USkeleton v-for="i in 5" :key="i" class="h-10 w-full" />
      </div>
      <USkeleton class="h-64 w-full" />
    </div>

    <!-- Customization form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <div class="space-y-4">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          Basic Information
        </h3>
        
        <UFormGroup label="Tree Name" name="name" required>
          <UInput v-model="tree.name" placeholder="My Awesome Links" />
        </UFormGroup>

        <UFormGroup label="Slug" name="slug" required>
          <UInput v-model="tree.slug" placeholder="my-awesome-links">
            <template #leading>
              <span class="text-gray-500 dark:text-gray-400">/t/</span>
            </template>
          </UInput>
        </UFormGroup>

        <UFormGroup label="Logo URL" name="logoUrl">
          <UInput v-model="tree.logoUrl" placeholder="https://example.com/logo.png" />
          <div class="w-full flex justify-end">
            <UButton class="my-2" @click="isUploadModalOpen = !isUploadModalOpen">Click to upload</UButton>
          </div>
        </UFormGroup>
      </div>

      <div class="space-y-4">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          Style Customization
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Background Color">
            <UInput v-model="tree.styles.backgroundColor" type="color" />
          </UFormGroup>

          <UFormGroup label="Text Color">
            <UInput v-model="tree.styles.textColor" type="color" />
          </UFormGroup>

          <UFormGroup label="Button Background">
            <UInput v-model="tree.styles.buttonBackgroundColor" type="color" />
          </UFormGroup>

          <UFormGroup label="Button Text Color">
            <UInput v-model="tree.styles.buttonTextColor" type="color" />
          </UFormGroup>

          <UFormGroup label="Font Family">
            <USelect
              v-model="tree.styles.fontFamily"
              :options="[
                { value: 'Poppins', label: 'Poppins' },
                { value: 'Inter', label: 'Inter' },
                { value: 'Montserrat', label: 'Montserrat' },
                { value: 'sans-serif', label: 'Sans-serif' },
                { value: 'serif', label: 'Serif' },
                { value: 'monospace', label: 'Monospace' }
              ]"
            />
          </UFormGroup>
        </div>
      </div>

      <!-- Preview section -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          Preview
        </h3>
        
        <div
          class="p-6 rounded-lg border border-gray-200 dark:border-gray-700"
          :style="{
            backgroundColor: tree.styles.backgroundColor,
            color: tree.styles.textColor,
            fontFamily: tree.styles.fontFamily
          }"
        >
          <div class="flex justify-center mb-4">
            <div v-if="tree.logoUrl" class="h-16 w-16 bg-contain bg-center bg-no-repeat" :style="{ backgroundImage: `url(${tree.logoUrl})` }"></div>
            <div v-else class="h-16 w-16 rounded-full flex items-center justify-center" :style="{ backgroundColor: tree.styles.buttonBackgroundColor, color: tree.styles.buttonTextColor }">
              <UIcon name="i-heroicons-tree" class="h-8 w-8" />
            </div>
          </div>

          <h3 class="text-center text-xl font-semibold mb-2">
            {{ tree.name || 'Your Tree Name' }}
          </h3>

          <div class="mt-4 space-y-2">
            <div
              v-for="i in 3"
              :key="i"
              class="h-10 rounded-md flex items-center justify-center"
              :style="{
                backgroundColor: tree.styles.buttonBackgroundColor,
                color: tree.styles.buttonTextColor
              }"
            >
              Link {{ i }}
            </div>
          </div>
        </div>
      </div>

      <!-- Form actions -->
      <div class="flex justify-end pt-6">
        <UButton
          type="submit"
          color="primary"
          label="Save Changes"
          :loading="loading"
        />
      </div>
    </form>
  </div>
</template>