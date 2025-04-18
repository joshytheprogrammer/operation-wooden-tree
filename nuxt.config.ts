// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  build: {
    transpile: ['@fingerprintjs/fingerprintjs']
  },
  modules: ['@nuxt/ui', 'nuxt-vuefire'],
  css: ['~/assets/css/tailwind.css'],
  colorMode: {
    preference: 'light'
  },
  runtimeConfig: {
    public: {
      cloudinary: {
        cloudName: '',
        apiKey: '',
        uploadPreset: '',
        apiSecret: ''
      }
    }
  },
  vuefire: {
    auth: {
      enabled: true,
      sessionCookie: true 
    },
    config: {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGE_SENDER_ID,
      appId: process.env.APP_ID,
      measurementId: process.env.MEASUREMENT_ID 
    }
  }
})