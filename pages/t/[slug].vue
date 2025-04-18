<script setup>
import { collection, query, orderBy, where, limit, getDocs  } from 'firebase/firestore'
import { useFirestore } from 'vuefire'


const db = useFirestore()
const route = useRoute()
const { slug } = route.params

// Reactive data
const tree = ref(null)
const links = ref([])
const loading = ref(true)
const error = ref(null)

// Metadata for the page
useHead(() => ({
  title: tree.value?.name || 'Link Tree',
  meta: [
    { name: 'description', content: `Check out ${tree.value?.name || 'this'} link tree` }
  ],
  bodyAttrs: {
    class: 'min-h-screen flex flex-col'
  }
}))

// Computed links - filtered and sorted
const visibleLinks = computed(() => {
  if (!links.value) return []
  
  return [...links.value]
    .filter(link => link.enabled)
    .sort((a, b) => {
      // Sort by pinned first (descending)
      if (a.pinned !== b.pinned) return b.pinned ? 1 : -1
      // Then by order (ascending)
      return a.order - b.order
    })
})

// Fetch tree by slug
const fetchTreeBySlug = async () => {
  try {
    loading.value = true
    error.value = null
    
    const q = query(
      collection(db, 'trees'),
      where('slug', '==', slug),
      limit(1)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      error.value = 'Tree not found'
      return
    }
    
    // Get the first matching document
    const treeDoc = querySnapshot.docs[0]
    tree.value = { id: treeDoc.id, ...treeDoc.data() }
    
    // Now fetch links for this tree
    await fetchLinks(treeDoc.id)
  } catch (err) {
    error.value = err.message
    console.error('Error fetching tree:', err)
  } finally {
    loading.value = false
  }
}

// Fetch links for a tree
const fetchLinks = async (treeId) => {
  try {
    const q = query(
      collection(db, 'trees', treeId, 'links'),
      orderBy('order')
    )
    
    const querySnapshot = await getDocs(q)
    links.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    error.value = err.message
    console.error('Error fetching links:', err)
  }
}

// Fetch data on component mount
onMounted(fetchTreeBySlug);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-gray-950">
    
    <!-- Loading state -->
    <div v-if="loading" class="flex-grow flex items-center justify-center p-6">
      <div class="text-center">
        <AppSpinner />
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex-grow flex items-center justify-center p-6">
      <div class="max-w-md w-full text-center space-y-4">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-amber-500 mx-auto" />
        <h1 class="text-2xl font-bold">Oops! Something went wrong</h1>
        <p class="text-gray-600 dark:text-gray-300">{{ error || "We couldn't find this tree." }}</p>
        <UButton to="/" color="primary">Go Home</UButton>
      </div>
    </div>

    <!-- Content -->
    <div 
      v-else
      class="min-h-screen flex flex-col items-center "
      :style="{
        backgroundColor: tree?.styles?.backgroundColor || '#ffffff',
        color: tree?.styles?.textColor || '#000000',
        fontFamily: tree?.styles?.fontFamily || 'sans-serif',
        backgroundImage: `linear-gradient(180deg, ${tree?.styles?.backgroundColor || '#ffffff'}dd 0%, ${tree?.styles?.backgroundColor || '#ffffff'} 100%)`
      }"
    >

      <!-- Decorative background elements -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
          :style="{ backgroundColor: tree?.styles?.buttonBackgroundColor || '#4f46e5' }"></div>
        <div class="absolute -bottom-24 -left-24 w-64 h-64 rounded-full opacity-10"
          :style="{ backgroundColor: tree?.styles?.buttonBackgroundColor || '#4f46e5' }"></div>
      </div>

      <!-- Tree Header -->
      <header class="w-full max-w-md px-6 pt-16 pb-8 text-center">
        <div class="flex flex-col items-center">
          <div class="mb-6">
            <img 
              v-if="tree?.logoUrl"
              :src="tree.logoUrl"
              :alt="`${tree.name} logo`"
              class="rounded-full shadow-xl border-4 transition-transform duration-300 hover:scale-105 w-24 h-24 object-cover"
              :style="{ borderColor: tree?.styles?.buttonBackgroundColor || '#4f46e5' }"
            />
            <div 
              v-else 
              class="w-28 h-28 rounded-full flex items-center justify-center shadow-xl -mt-28 transition-transform duration-300 hover:scale-105"
              :style="{
                backgroundColor: tree?.styles?.buttonBackgroundColor || '#4f46e5',
                color: tree?.styles?.buttonTextColor || '#ffffff'
              }"
            >
              <UIcon name="mingcute:tree-4-line" class="h-14 w-14" />
            </div>
          </div>

          <h1 class="text-3xl font-extrabold mb-2">{{ tree?.name }}</h1>
          <p v-if="slug" class="text-lg opacity-70 mb-2">@{{ slug }}</p>

          <div class="w-24 h-1 rounded-full my-4"
            :style="{ backgroundColor: tree?.styles?.buttonBackgroundColor || '#4f46e5', opacity: 0.6 }"
          />
        </div>
      </header>

      <!-- Links -->
      <main class="w-full max-w-md px-6 pb-16 flex-grow">
        <!-- Empty State -->
        <div 
          v-if="visibleLinks.length === 0" 
          class="text-center py-12 px-4 rounded-2xl backdrop-blur-sm bg-opacity-50"
          :style="{ backgroundColor: tree?.styles?.buttonBackgroundColor || '#4f46e5', color: tree?.styles?.buttonTextColor || '#ffffff' }"
        >
          <UIcon name="i-heroicons-link-slash" class="w-12 h-12 mx-auto mb-4 opacity-80" />
          <p class="text-lg font-medium">No links available yet</p>
          <p class="opacity-80 mt-1">Check back soon!</p>
        </div>

        <!-- Link Cards -->
        <TransitionGroup name="links-list" tag="div" class="space-y-4 mt-4">
          <div
            v-for="link in visibleLinks"
            :key="link.id"
            class="relative group transition-transform duration-300 hover:-translate-y-1"
          >
            <!-- Pinned icon -->
            <div 
              v-if="link.pinned"
              class="absolute -right-2 -top-2 bg-white rounded-full w-4 h-4 flex items-center justify-center shadow z-10"
              :style="{ color: tree?.styles?.buttonBackgroundColor || '#4f46e5' }"
            >
              <UIcon name="ic:round-push-pin" class="w-3 h-3" />
            </div>

            <!-- Button -->
            <UButton 
              v-if="link.type === 'url'"
              :to="`/go?treeId=${tree.id}&linkId=${link.id}`"
              size="xl"
              block
              class="rounded-xl border transition-all duration-300 group-hover:shadow-lg"
              :style="{
                backgroundColor: tree?.styles?.buttonBackgroundColor || '#4f46e5',
                color: tree?.styles?.buttonTextColor || '#ffffff',
                borderColor: `${tree?.styles?.buttonBackgroundColor || '#4f46e5'}60`,
              }"
              rel="noopener noreferrer"
              target="_blank"
            >
              <div class="flex items-center justify-between w-full px-1 py-1">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-link" class="w-5 h-5 opacity-80" />
                  <span class="font-semibold text-base">{{ link.title }}</span>
                </div>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 opacity-60 transition-transform group-hover:translate-x-1" />
              </div>
            </UButton>

            <!-- Email Link -->
            <UButton 
              v-else-if="link.type === 'email'"
              :to="`mailto:${link.value}`"
              size="xl"
              block
              class="rounded-xl border transition-all duration-300 group-hover:shadow-lg"
              :style="{
                backgroundColor: tree?.styles?.buttonBackgroundColor || '#4f46e5',
                color: tree?.styles?.buttonTextColor || '#ffffff',
                borderColor: `${tree?.styles?.buttonBackgroundColor || '#4f46e5'}60`,
              }"
            >
              <div class="flex items-center justify-between w-full px-1 py-1">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-envelope" class="w-5 h-5 opacity-80" />
                  <span class="font-semibold text-base">{{ link.title }}</span>
                </div>
                <UIcon name="i-heroicons-envelope-open" class="w-4 h-4 opacity-60 transition-transform group-hover:scale-110" />
              </div>
            </UButton>

            <!-- Phone Link -->
            <UButton 
              v-else-if="link.type === 'phone'"
              :to="`tel:${link.value}`"
              size="xl"
              block
              class="rounded-xl border transition-all duration-300 group-hover:shadow-lg"
              :style="{
                backgroundColor: tree?.styles?.buttonBackgroundColor || '#4f46e5',
                color: tree?.styles?.buttonTextColor || '#ffffff',
                borderColor: `${tree?.styles?.buttonBackgroundColor || '#4f46e5'}60`,
              }"
            >
              <div class="flex items-center justify-between w-full px-1 py-1">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-phone" class="w-5 h-5 opacity-80" />
                  <span class="font-semibold text-base">{{ link.title }}</span>
                </div>
                <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4 opacity-60 transition-transform group-hover:scale-110" />
              </div>
            </UButton>
          </div>
        </TransitionGroup>
      </main>

      <!-- Footer -->
      <footer class="w-full px-6 py-6 text-center text-sm opacity-60">
        <div class="flex items-center justify-center gap-1">
          <span>Made with</span>
          <UIcon name="i-heroicons-heart" class="w-4 h-4" :style="{ color: tree?.styles?.buttonBackgroundColor || '#4f46e5' }" />
          <span>on</span>
          <UButton 
            to="/" 
            variant="link" 
            class="font-medium"
            :style="{ color: tree?.styles?.buttonBackgroundColor || '#4f46e5' }"
          >
            Operation Wooden Tree
          </UButton>
        </div>
      </footer>
    </div>
  </div>
</template>

<style>
.links-list-enter-active,
.links-list-leave-active {
  transition: all 0.3s ease;
}
.links-list-enter-from,
.links-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
