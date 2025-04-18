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
  <div class="min-h-screen flex flex-col">
    <!-- Loading state -->
    <div v-if="loading" class="flex-grow flex items-center justify-center p-4">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <AppSpinner />
      </div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="flex-grow flex items-center justify-center p-4">
      <div class="max-w-md mx-auto text-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="h-16 w-16 text-amber-500 mx-auto" />
        <h1 class="text-2xl font-bold mt-4 mb-2">Oops! Something went wrong</h1>
        <p class="text-gray-600 dark:text-gray-300 mb-6">{{ error || "We couldn't find this tree." }}</p>
        <UButton to="/" color="primary">Go Home</UButton>
      </div>
    </div>

    <div 
      v-else
      class="min-h-screen flex flex-col justify-center"
      :style="{
        backgroundColor: tree?.styles?.backgroundColor || '#ffffff',
        color: tree?.styles?.textColor || '#000000',
        fontFamily: tree?.styles?.fontFamily || 'sans-serif',
        backgroundImage: `linear-gradient(180deg, ${tree?.styles?.backgroundColor || '#ffffff'}dd 0%, ${tree?.styles?.backgroundColor || '#ffffff'} 100%)`
      }"
    >
      <!-- Decorative elements -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div class="fixed -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
          :style="{ backgroundColor: tree?.styles?.buttonBackgroundColor || '#4f46e5' }"></div>
        <div class="fixed -bottom-24 -left-24 w-64 h-64 rounded-full opacity-10"
          :style="{ backgroundColor: tree?.styles?.buttonBackgroundColor || '#4f46e5' }"></div>
      </div>

      <!-- Tree header -->
      <header class="w-full max-w-md mx-auto mt-8 pb-8 px-4">
        <div class="flex flex-col items-center">
          <div class="mb-6">
            <img 
              v-if="tree?.logoUrl" 
              :src="tree.logoUrl" 
              :alt="`${tree.name} logo`" 
              class="object-cover rounded-full shadow-xl border-4 -mt-28 transition-all duration-300 hover:scale-105"
              width="96"
              height="96"
              :style="{
                borderColor: tree?.styles?.buttonBackgroundColor || '#4f46e5',
              }"
            >
            <div 
              v-else 
              class="h-28 w-28 rounded-full flex items-center justify-center shadow-xl -mt-28 transition-all duration-300 hover:scale-105"
              :style="{
                backgroundColor: tree?.styles?.buttonBackgroundColor || '#4f46e5',
                color: tree?.styles?.buttonTextColor || '#ffffff'
              }"
            >
              <UIcon name="mingcute:tree-4-line" class="h-14 w-14" />
            </div>
          </div>

          <!-- Tree name and details -->
          <h1 class="text-3xl font-extrabold text-center mb-2 tracking-tight">
            {{ tree?.name }}
          </h1>
          <p v-if="slug" class="text-lg opacity-70 mb-2 text-center">@{{ slug }}</p>
          
          <!-- Divider -->
          <div class="w-24 h-1 rounded-full my-6"
            :style="{ backgroundColor: tree?.styles?.buttonBackgroundColor || '#4f46e5', opacity: 0.6 }">
          </div>
        </div>
      </header>

      <!-- Links container -->
      <main class="w-full max-w-md mx-auto px-6 pb-16 flex-grow">
        <!-- Empty state -->
        <div 
          v-if="visibleLinks.length === 0" 
          class="text-center py-12 px-4 rounded-2xl bg-opacity-50 backdrop-filter backdrop-blur-sm"
          :style="{ backgroundColor: tree?.styles?.buttonBackgroundColor || '#4f46e5', color: tree?.styles?.buttonTextColor || '#ffffff' }"
        >
          <UIcon name="i-heroicons-link-slash" class="h-12 w-12 mx-auto mb-4 opacity-80" />
          <p class="text-lg font-medium">No links available yet</p>
          <p class="opacity-80 mt-2">Check back soon!</p>
        </div>

        <!-- Links -->
        <TransitionGroup 
          name="links-list"
          tag="div"
          class="space-y-4"
        >
          <div
            v-for="link in visibleLinks" 
            :key="link.id"
            class="group transition-all duration-300 hover:-translate-y-1"
          >
          
            <!-- Pinned indicator -->
            <div 
              v-if="link.pinned"
              class="absolute -right-2 -top-2 bg-white rounded-full w-4 h-4 flex items-center justify-center shadow-md z-10"
              
              :style="{ color: tree?.styles?.buttonBackgroundColor || '#4f46e5' }"
            >
              <UIcon name="ic:round-push-pin" class="w-3 h-3" />
            </div>
            
            <!-- URL Link -->
            <UButton 
              v-if="link.type === 'url'"
              :to="`/go/${tree.id}/${link.id}`"
              size="xl"
              block
              class="group-hover:shadow-lg transition-all duration-300 ease-out rounded-xl border overflow-hidden clear-both"
              :style="{
                backgroundColor: tree?.styles?.buttonBackgroundColor || '#4f46e5',
                color: tree?.styles?.buttonTextColor || '#ffffff',
                borderColor: `${tree?.styles?.buttonBackgroundColor || '#4f46e5'}60`,
              }"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div class="w-full px-1 py-1 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-link" class="w-5 h-5 mr-3 opacity-80" />
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
              class="group-hover:shadow-lg transition-all duration-300 ease-out rounded-xl border overflow-hidden clear-both"
              :style="{
                backgroundColor: tree?.styles?.buttonBackgroundColor || '#4f46e5',
                color: tree?.styles?.buttonTextColor || '#ffffff',
                borderColor: `${tree?.styles?.buttonBackgroundColor || '#4f46e5'}60`,
              }"
            >
              <div class="w-full px-1 py-1 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-envelope" class="w-5 h-5 mr-3 opacity-80" />
                  <span class="font-semibold text-base">{{ link.title }}</span>
                </div>
                <UIcon name="i-heroicons-envelope-open" class="w-4 h-4 opacity-60 transition-all group-hover:scale-110" />
              </div>
            </UButton>

            <!-- Phone Link -->
            <UButton 
              v-else-if="link.type === 'phone'"
              :to="`tel:${link.value}`"
              size="xl"
              block
              class="group-hover:shadow-lg transition-all duration-300 ease-out rounded-xl border overflow-hidden clear-both"
              :style="{
                backgroundColor: tree?.styles?.buttonBackgroundColor || '#4f46e5',
                color: tree?.styles?.buttonTextColor || '#ffffff',
                borderColor: `${tree?.styles?.buttonBackgroundColor || '#4f46e5'}60`,
              }"
            >
              <div class="w-full px-1 py-1 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-phone" class="w-5 h-5 mr-3 opacity-80" />
                  <span class="font-semibold text-base">{{ link.title }}</span>
                </div>
                <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4 opacity-60 transition-all group-hover:scale-110" />
              </div>
            </UButton>
          </div>
        </TransitionGroup>
      </main>

      <!-- Footer with subtle branding -->
      <footer class="w-full py-6 px-4 text-center">
        <div class="max-w-md mx-auto flex items-center justify-center gap-2">
          <p class="text-sm opacity-60">
            Made with 
            <UIcon name="i-heroicons-heart" class="w-4 h-4 inline-block mx-0.5" :style="{ color: tree?.styles?.buttonBackgroundColor || '#4f46e5' }" /> 
            on
          </p>
          <UButton 
            to="/" 
            variant="link" 
            class="text-sm font-medium"
            :style="{ color: tree?.styles?.buttonBackgroundColor || '#4f46e5' }"
          >
            Operation Wooden Tree
          </UButton>
        </div>
      </footer>
    </div>
  </div>
</template>

<style> .links-list-enter-active, .links-list-leave-active { transition: all 0.3s ease; } .links-list-enter-from, .links-list-leave-to { opacity: 0; transform: translateX(30px); } </style>