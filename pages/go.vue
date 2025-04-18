<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
    <!-- Main Content Card -->
    <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-500">
      <!-- Logo Section -->
      <div class="p-6 bg-primary-500 dark:bg-primary-600 flex justify-center">
        <div class="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
          <UIcon name="i-heroicons-link" class="w-8 h-8 text-primary-500" />
        </div>
      </div>
      
      <!-- Status Section -->
      <div class="p-6 text-center">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ statusMessage }}
        </h2>
        
        <p v-if="!error" class="text-gray-500 dark:text-gray-400 mt-2">
          You'll be redirected in a moment...
        </p>
        
        <p v-if="error" class="text-red-500 dark:text-red-400 mt-2">
          {{ error }}
        </p>
        
        <!-- Loading Animation -->
        <div v-if="loading" class="mt-6 mb-4">
          <div class="flex justify-center">
            <div class="relative w-16 h-16">
              <div class="absolute top-0 w-full h-full rounded-full border-4 border-primary-200 dark:border-primary-900"></div>
              <div class="absolute top-0 w-full h-full rounded-full border-4 border-t-primary-500 animate-spin"></div>
            </div>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Processing your request...
          </p>
        </div>
        
        <!-- Error Actions -->
        <div v-if="error" class="mt-6">
          <UButton 
            color="primary"
            block
            @click="goBack"
          >
            Go back
          </UButton>
        </div>
        
        <!-- Destination Preview -->
        <div v-if="destination && !error" class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-left">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Destination:
          </p>
          <p class="text-gray-800 dark:text-gray-200 truncate">
            {{ destination }}
          </p>
        </div>
      </div>
    </div>
        <!-- Footer -->
    <p class="mt-8 text-sm text-gray-500 dark:text-gray-400">
      Powered by Operation Wooden Tree
    </p>

    <!-- Privacy Notice -->
    <p class="mt-8 text-xs text-gray-500 dark:text-gray-400 text-center max-w-md">
      This site uses analytics to improve user experience. By continuing, you consent to our use of cookies and tracking.
    </p>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

// State
const loading = ref(true)
const error = ref(null)
const destination = ref(null)
const statusMessage = ref('Preparing your redirect...')
const fingerprintData = ref(null)

// Get parameters
const treeId = route.query.treeId
const linkId = route.query.linkId

const generateFingerprint = async () => {
  try {
    // Load the FingerprintJS agent
    const fp = await (await import('@fingerprintjs/fingerprintjs')).load();
    const result = await fp.get();

    // Remove only the specified problematic components
    delete result.components.canvas;
    delete result.components.webGlBasics; 
    delete result.components.webGlExtensions;
    delete result.components.math;

    // Flatten arrays to comma-separated strings
    const flattenArrays = (obj) => {
      if (Array.isArray(obj)) {
        return obj.flat().join(','); // Flatten nested arrays and join
      }
      return obj;
    };

    // Process components to flatten arrays
    const processedComponents = {};
    for (const [key, value] of Object.entries(result.components)) {
      processedComponents[key] = {
        ...value,
        value: flattenArrays(value.value)
      };
    }

    // Enhanced data with screen info
    const enhancedData = {
      visitorId: result.visitorId,
      confidence: result.confidence,
      version: result.version,
      components: processedComponents,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth,
        pixelRatio: window.devicePixelRatio
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      languages: navigator.languages.join(','),
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: navigator.deviceMemory || 0,
      sessionStorage: !!window.sessionStorage,
      localStorage: !!window.localStorage,
      indexedDB: !!window.indexedDB,
      touchSupport: 'ontouchstart' in window,
      timestamp: new Date().toISOString()
    };

    return enhancedData;
  } catch (err) {
    console.error('Fingerprint generation failed:', err);
    return {
      error: 'fingerprint_failed',
      timestamp: new Date().toISOString()
    };
  }
};

// Process redirect
onMounted(async () => {
  // Validate parameters
  if (!treeId || !linkId) {
    error.value = 'Missing parameters for redirect'
    loading.value = false
    statusMessage.value = 'Redirect failed'
    return
  }

  try {
    // Generate fingerprint
    statusMessage.value = 'Verifying your browser...'

    try{
      fingerprintData.value = await generateFingerprint();
    } catch(e) {
      console.log(e)
    }
    
    // Make API call
    statusMessage.value = 'Connecting you...'
    
    const response = await $fetch('/api/go/', {
      method: 'POST',
      body: {
        treeId,
        linkId,
        fingerprintData: fingerprintData.value
      }
    })
    
    if (response.error) {
      throw new Error(response.error || 'Failed to process redirect')
    }
    
    if (!response.url) {
      throw new Error('No destination URL provided')
    }
    
    // Store destination for preview
    destination.value = response.url
    
    // Update status
    statusMessage.value = 'Redirecting you now!'
    
    // Redirect after a brief delay to show the animation
    setTimeout(() => {
      window.location.href = response.url
    }, 1500)
  } 
  catch (err) {
    error.value = err.message || 'Failed to redirect'
    statusMessage.value = 'Redirect failed'
    loading.value = false
  }
})

// Go back function
function goBack() {
  router.back()
}
</script>