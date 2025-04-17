export default defineNuxtRouteMiddleware(async (to) => {
  const user = await getCurrentUser()

  // Allow access to login route for unauthenticated users
  if ((to.path === '/a/login' || to.path === '/a/verify') && !user) {
    return
  }

  // Protected routes (/a/* except /a/login and /a/verify)
  if (to.path.startsWith('/a/') && to.path !== '/a/login' && to.path !== '/a/verify' && !user) {
    return navigateTo('/a/login', {
      redirectCode: 301,
      query: { redirect: to.path }
    })
  }

  // Redirect authenticated users away from login page
  if ((to.path === '/a/login' || to.path === '/a/verify') && user) {
    return navigateTo('/a/')
  }

  // Other routes are guest routes, no restrictions
})