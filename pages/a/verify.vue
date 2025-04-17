<script setup>
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { useStorage } from '@vueuse/core'

const isLoading = ref(true)
const error = ref('')
const emailForSignIn = useStorage('emailForSignIn', '')
const toast = useToast()
const router = useRouter()
const auth = useFirebaseAuth()

onMounted(async () => {
  try {
    // Check if the current URL is a sign-in link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = emailForSignIn.value
      
      // If email is not found in storage, prompt the user
      if (!email) {
        email = window.prompt('Please provide your email for confirmation:')
        
        if (!email) {
          throw new Error('Email is required to complete sign in')
        }
      }
      
      // Sign in with the email link
      await signInWithEmailLink(auth, email, window.location.href)
      
      // Clear email from storage
      emailForSignIn.value = ''
      
      toast.add({
        title: 'Success',
        description: 'You have successfully logged in',
        color: 'green'
      })
      
      // Redirect to dashboard or home page
      router.push('/a/')
    } else {
      throw new Error('Invalid sign-in link')
    }
  } catch (err) {
    error.value = err.message || 'Sign-in failed'
    toast.add({
      title: 'Error',
      description: error.value,
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
    <UCard class="w-full max-w-md">
      <div class="flex justify-center mb-6">
        <AppLogo class="h-12 w-auto text-primary" />
      </div>
      
      <div v-if="isLoading" class="flex flex-col items-center py-6">
        <UIcon name="i-heroicons-arrow-path" class="text-primary animate-spin h-12 w-12 mb-4" />
        <h2 class="text-xl font-medium">Verifying your login...</h2>
      </div>
      
      <div v-else-if="error" class="mx-auto py-6">
        <UAlert
          color="red"
          variant="soft"
          title="An error occurred during verification"
          icon="i-heroicons-exclamation-triangle"
          class="mb-4"
        >
          {{ error }}
        </UAlert>
        
        <UButton
          to="/a/login"
          block
          color="primary"
          class="mt-4"
        >
          Back to Login
        </UButton>
      </div>
      
      <div v-else class="py-6 text-center">
        <UIcon name="i-heroicons-check-circle" class="text-green-500 h-16 w-16 mx-auto mb-4" />
        <h2 class="text-xl font-medium mb-2">Successfully logged in!</h2>
        <p class="text-gray-500 mb-4">Redirecting you to your dashboard...</p>
      </div>
    </UCard>
  </div>
</template>