<script setup>
import { signOut, onAuthStateChanged } from 'firebase/auth'

const auth = useFirebaseAuth()
const toast = useToast()
const router = useRouter()
const isLoading = ref(false)
const isUserLoggedIn = ref(false)

onMounted(() => {
  // Set up auth state listener
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    isUserLoggedIn.value = !!user
  })
  
  // Clean up listener on component unmount
  onUnmounted(() => unsubscribe())
})

const handleLogout = async () => {
  try {
    isLoading.value = true
    await signOut(auth)
    toast.add({
      title: 'Success',
      description: 'You have been logged out',
      color: 'green'
    })
    router.push('/a/login')
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to log out',
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
};
</script>

<template>
  <UButton
    v-if="isUserLoggedIn"
    icon="i-heroicons-arrow-right-on-rectangle"
    color="gray"
    variant="ghost"
    :loading="isLoading"
    @click="handleLogout"
    aria-label="Logout"
  />
</template>