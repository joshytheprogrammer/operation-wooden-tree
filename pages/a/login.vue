<script setup>
import { sendSignInLinkToEmail, signInWithEmailAndPassword } from 'firebase/auth'
import { useStorage } from '@vueuse/core'

const email = ref('')
const password = ref('')
const emailForSignIn = useStorage('emailForSignIn', '')
const isLoading = ref(false)
const toast = useToast()
const authMethod = ref('password') // Toggle between authentication methods

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
}

const signInWithPassword = async () => {
  if (!email.value || !password.value) {
    toast.add({
      title: 'Error',
      description: 'Please enter both email and password',
      color: 'red'
    })
    return
  }

  isLoading.value = true

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    toast.add({
      title: 'Success',
      description: 'Login successful',
      color: 'green'
    })
    // Redirect will depend on your routing
    navigateTo('/a')
  } catch (err) {
    toast.add({
      title: 'Error',
      description: err.message || 'Invalid email or password',
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = () => {
  authMethod.value === 'passwordless' ? signInWithEmail() : signInWithPassword()
};
</script>

<template>
  <div class="flex flex-col items-center justify-center p-6">
    <!-- Authentication method toggle -->
    <div class="flex justify-center mb-6 w-full">
      <UButtonGroup size="sm" :ui="{ rounded: 'rounded-full' }">
        <UButton
          :color="authMethod === 'passwordless' ? 'primary' : 'gray'"
          @click="authMethod = 'passwordless'"
          class="px-4"
        >
          <UIcon name="i-heroicons-envelope" class="mr-1 h-4 w-4" />
          Email Link
        </UButton>
        <UButton
          :color="authMethod === 'password' ? 'primary' : 'gray'"
          @click="authMethod = 'password'"
          class="px-4"
        >
          <UIcon name="i-heroicons-key" class="mr-1 h-4 w-4" />
          Password
        </UButton>
      </UButtonGroup>
    </div>
    <UCard class="w-full max-w-md">
      <div class="flex justify-center mb-6">
        <AppLogo class="h-12 w-auto text-primary" />
      </div>
      
      <h1 class="text-2xl font-semibold text-center mb-1">
        Admin Portal
      </h1>
      
      
      <p class="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
        {{ authMethod === 'passwordless' ? 
          'Receive a secure login link via email' : 
          'Sign in with your email and password' 
        }}
      </p>
      
      <form @submit.prevent="handleSubmit">
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
        
        <transition name="fade">
          <UFormGroup v-if="authMethod === 'password'" label="Password" name="password" class="mt-4">
            <UInput
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              :disabled="isLoading"
              required
            />
          </UFormGroup>
        </transition>
        
        <UButton
          type="submit"
          block
          color="primary"
          :loading="isLoading"
          class="mt-6"
        >
          {{ isLoading ? 
            (authMethod === 'passwordless' ? 'Sending link...' : 'Signing in...') : 
            (authMethod === 'passwordless' ? 'Send login link' : 'Sign in') 
          }}
        </UButton>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ authMethod === 'passwordless' ? 
            'Secure, passwordless authentication' : 
            'Secure authentication with password' 
          }}
        </p>
      </div>
    </UCard>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>