<script setup>
import { sendSignInLinkToEmail } from 'firebase/auth'
import { useStorage } from '@vueuse/core'

const email = ref('')
const emailForSignIn = useStorage('emailForSignIn', '')
const isLoading = ref(false)
const toast = useToast()

const auth = useFirebaseAuth()

const signInWithEmail = async () => {
  if (!email.value) {
    toast.add({
      title: 'Error',
      description: 'Please enter your email address',
      color: 'red'
    })
    return
  }

  isLoading.value = true

  try {
    const actionCodeSettings = {
      url: window.location.origin + '/a/verify',
      handleCodeInApp: true,
    }

    await sendSignInLinkToEmail(auth, email.value, actionCodeSettings)
    emailForSignIn.value = email.value
    toast.add({
      title: 'Success',
      description: `Login link sent. Remember to check spam!`,
      color: 'green'
    })
  } catch (err) {
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to send login link',
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center p-6">
    
    <UCard class="w-full max-w-md">
      <div class="flex justify-center mb-6">
        <AppLogo class="h-12 w-auto text-primary" />
      </div>
      
      <h1 class="text-2xl font-semibold text-center mb-1">
        Admin Portal
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
        Enter your email to receive a secure login link
      </p>
      
      <form @submit.prevent="signInWithEmail">
        <UFormGroup label="Email address" name="email">
          <UInput
            v-model="email"
            type="email"
            placeholder="name@wandggroup.com"
            autocomplete="email"
            :disabled="isLoading"
            required
          />
        </UFormGroup>
        <UButton
          type="submit"
          block
          color="primary"
          :loading="isLoading"
          class="mt-6"
        >
          {{ isLoading ? 'Sending link...' : 'Send login link' }}
        </UButton>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Secure, passwordless authentication
        </p>
      </div>
    </UCard>
  </div>
</template>