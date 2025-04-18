<script setup>
import { collection, addDoc } from 'firebase/firestore'

const tree = ref({
  name: '',
  slug: '',
  styles: {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    buttonBackgroundColor: '#4f46e5',
    buttonTextColor: '#ffffff',
    fontFamily: 'sans-serif'
  },
  logoUrl: ''
})

const user = useCurrentUser();
const loading = ref(false)
const toast = useToast()

const createTree = async () => {
  if (!tree.value.name || !tree.value.slug) {
    toast.add({
      title: 'Validation Error',
      description: 'Please complete all required fields',
      icon: 'i-heroicons-exclamation-circle',
      color: 'red'
    })
    return
  }

  try {
    loading.value = true
    
    // Add creation metadata
    const newTree = {
      ...tree.value,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.value.uid
    }

    // Add to Firestore
    await addDoc(collection(useFirestore(), 'trees'), newTree)
    
    // Show success notification
    toast.add({
      title: 'Tree created',
      description: `${tree.value.name} has been created successfully`,
      icon: 'i-heroicons-check-circle',
      color: 'green'
    })
    
    // Redirect to dashboard
    navigateTo('/a')
  } catch (err) {
    toast.add({
      title: 'Error creating tree',
      description: err.message || 'Failed to create tree',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
};
</script>

<template>
  <div class="min-h-full">
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-lg md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Create New Tree
        </h1>
        <UButton
          color="gray"
          variant="ghost"
          to="/a"
        >
          Back to Dashboard
        </UButton>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <UForm @submit="createTree" class="space-y-6">
          <!-- Basic info -->
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
            </UFormGroup>
          </div>

          <!-- Style customization -->
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
          <div class="flex justify-end space-x-3 pt-6">
            <UButton
              color="gray"
              variant="ghost"
              label="Cancel"
              to="/a"
            />
            <UButton
              type="submit"
              color="primary"
              label="Create Tree"
              :loading="loading"
            />
          </div>
        </UForm>
      </div>
    </main>
  </div>
</template>