<script setup >
import { useDropZone } from '@vueuse/core'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'uploaded'])

// Add user reference
const user = useCurrentUser()
const db = useFirestore()

// State management
const dropZoneRef = ref()
const selectedFiles = ref([])
const fileInput = ref(null)
const uploadedUrls = ref([])
const uploading = ref(false)
const currentUpload = ref(0)
const totalUploads = ref(0)
const toast = useToast()

// Cloudinary configuration
const cloudinaryConfig = useRuntimeConfig().public.cloudinary
const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`


// Fetch existing uploads on mount
onMounted(async () => {
  if (user.value?.uid) {
    const q = query(
      collection(db, 'uploads'),
      where('uid', '==', user.value.uid)
    )
    const querySnapshot = await getDocs(q)
    uploadedUrls.value = querySnapshot.docs.map(doc => doc.data().url)
  }
})

// Drop zone functionality
const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: (files) => {
    if (files) {
      selectedFiles.value = [...selectedFiles.value, ...files]
    }
  },
  dataTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
  multiple: true
})

const onFileChange = (e) => {
  if (fileInput.value?.files) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(fileInput.value.files)]
  }
}

// Generate Cloudinary signature
const generateSignature = async (folder, timestamp) => {
  const paramsToSign = { folder, timestamp }
  const serializedParams = Object.entries(paramsToSign)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  const signatureString = `${serializedParams}${cloudinaryConfig.apiSecret}`
  
  const encoder = new TextEncoder()
  const data = encoder.encode(signatureString)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')
}

const storeUploadRecord = async (file, url) => {
  if (!user.value?.uid) return
  
  await addDoc(collection(db, 'uploads'), {
    url,
    filename: file.name,
    uid: user.value.uid,
    createdAt: serverTimestamp()
  })
}

// Upload to Cloudinary
const uploadFile = async (file) => {
  const timestamp = Math.floor(Date.now() / 1000)
  const folder = 'operation-wooden-tree/logos'

  const signature = await generateSignature(folder, timestamp)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)
  formData.append('timestamp', timestamp)
  formData.append('signature', signature)
  formData.append('api_key', cloudinaryConfig.apiKey)
  // formData.append('upload_preset', cloudinaryConfig.uploadPreset)

  const response = await $fetch(cloudinaryUrl, {
    method: 'POST',
    body: formData
  })

  await storeUploadRecord(file, response.secure_url)

  return response.secure_url
}

// Process all selected files
const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) {
    toast.add({
      title: 'No files selected',
      description: 'Please select or drop files to upload',
      color: 'red'
    })
    return
  }

  uploading.value = true
  currentUpload.value = 0
  totalUploads.value = selectedFiles.value.length
  // uploadedUrls.value

  try {
    for (const file of selectedFiles.value) {
      try {
        const url = await uploadFile(file)
        uploadedUrls.value.push(url)
        toast.add({
          title: 'Upload successful',
          description: `${file.name} uploaded successfully`,
          color: 'green'
        })
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        toast.add({
          title: 'Upload failed',
          description: `Failed to upload ${file.name}`,
          color: 'red'
        })
      } finally {
        currentUpload.value++
      }
    }
  } finally {
    uploading.value = false
  }
}

// Copy URL to clipboard
const copyUrl = (url) => {
  navigator.clipboard.writeText(url)
  toast.add({
    title: 'Copied!',
    description: 'URL copied to clipboard',
    color: 'green'
  })
}

// Clear selected files
const clearFiles = () => {
  selectedFiles.value = []
}

const openFileSelector = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}
// Close modal
const closeModal = () => {
  emit('update:modelValue', false)
};
</script>

<template>
  <UModal 
    :model-value="modelValue" 
    @update:modelValue="val => emit('update:modelValue', val)"
    fullscreen
  >
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">Upload Logo</h2>
          <UButton 
            color="gray" 
            variant="ghost" 
            icon="i-heroicons-x-mark" 
            @click="closeModal"
          />
        </div>
      </template>

      <div class="md:grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Upload Section -->
        <div 
          ref="dropZoneRef"
          class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
          :class="{
            'border-primary-500 bg-primary-50 dark:bg-primary-900/10': isOverDropZone,
            'border-gray-300 dark:border-gray-700': !isOverDropZone
          }"
        >
          <div class="flex flex-col items-center justify-center space-y-4">
            <UIcon name="i-heroicons-cloud-arrow-up" class="w-12 h-12 text-gray-400" />
            <div>
              <p class="font-medium">Drag and drop files here</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">or</p>
            </div>
            <UButton
              icon="i-heroicons-photo"
              label="Select Files"
              @click.prevent="openFileSelector"
            />
            <input
              ref="fileInput"
              id="file-input"
              type="file"
              class="hidden"
              accept="image/png, image/jpeg, image/webp, image/svg+xml"
              multiple
              @change="onFileChange"
            />
          </div>

          <!-- Selected files list -->
          <div v-if="selectedFiles.length > 0" class="mt-6 space-y-2">
            <div v-for="(file, index) in selectedFiles" :key="index" class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div class="flex items-center space-x-2 truncate">
                <UIcon name="i-heroicons-document" class="w-5 h-5 flex-shrink-0" />
                <span class="truncate">{{ file.name }}</span>
              </div>
              <UButton
                icon="i-heroicons-trash"
                color="red"
                variant="ghost"
                size="xs"
                square
                @click="selectedFiles.splice(index, 1)"
              />
            </div>
          </div>

          <!-- Upload button -->
          <div class="mt-6">
            <UButton
              block
              color="primary"
              :loading="uploading"
              :disabled="selectedFiles.length === 0"
              @click="uploadFiles"
            >
              {{ uploading ? `Uploading ${currentUpload} of ${totalUploads}` : 'Upload Files' }}
            </UButton>
          </div>
        </div>

        <!-- Uploaded URLs Section -->
        <div class="space-y-4 py-4">
          <h3 class="font-medium">File History</h3>
          
          <div v-if="uploadedUrls.length === 0" class="text-center py-8">
            <UIcon name="i-heroicons-inbox" class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p class="mt-2 text-gray-500 dark:text-gray-400">Uploaded logos will appear here</p>
          </div>

          <div v-else class="space-y-3">
            <div v-for="(url, index) in uploadedUrls" :key="index" class="group relative p-3 border rounded-lg hover:shadow-sm transition-all">
              <div class="flex items-center space-x-3">
                <img :src="url" class="w-12 h-12 object-contain rounded" alt="Uploaded logo">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ url.split('/').pop() }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ url }}</p>
                </div>
                <UButton
                  icon="i-heroicons-clipboard-document"
                  color="gray"
                  variant="ghost"
                  size="xs"
                  square
                  @click="copyUrl(url)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <UButton
            color="gray"
            variant="ghost"
            label="Close"
            @click="closeModal"
          />
          <UButton
            v-if="uploadedUrls.length > 0"
            color="primary"
            label="Use Selected"
            @click="emit('uploaded', uploadedUrls[uploadedUrls.length - 1])"
          />
        </div>
      </template>
    </UCard>
  </UModal>
</template>