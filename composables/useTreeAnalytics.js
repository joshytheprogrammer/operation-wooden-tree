// ~/composables/useTreeAnalytics.js
import { collection, query, where, orderBy, getDocs, getDoc, doc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { ref, computed } from 'vue'

export const useTreeAnalytics = (treeId) => {
  const db = useFirestore()
  const loading = ref(true)
  const error = ref(null)
  const clicksData = ref([])
  const links = ref([])
  const treeData = ref(null)

  // Aggregated metrics
  const metrics = computed(() => {
    if (!clicksData.value.length) return null
    
    // Time-based analytics
    const clicksByDate = {}
    // Geographic data
    const countries = {}
    const cities = {}
    // Device analytics
    const devices = {}
    const browsers = {}
    const operatingSystems = {}
    // Referrers
    const referrers = {}
    
    clicksData.value.forEach(click => {
      // Process date (format: YYYY-MM-DD)
      const date = new Date(click.timestamp.toDate()).toISOString().split('T')[0]
      clicksByDate[date] = (clicksByDate[date] || 0) + 1
      
      // Process location
      const country = click.location?.country || 'Unknown'
      countries[country] = (countries[country] || 0) + 1
      
      const city = click.location?.city || 'Unknown'
      countries[city] = (countries[city] || 0) + 1
      
      // Process device
      const device = click.device?.type || 'Unknown'
      devices[device] = (devices[device] || 0) + 1
      
      const browser = click.device?.browser || 'Unknown'
      browsers[browser] = (browsers[browser] || 0) + 1
      
      const os = click.device?.os || 'Unknown'
      operatingSystems[os] = (operatingSystems[os] || 0) + 1
      
      // Process referrer
      const referrer = click.referrer || 'direct'
      referrers[referrer] = (referrers[referrer] || 0) + 1
    })
    
    // Link performance
    const linkPerformance = links.value.map(link => ({
      id: link.id,
      title: link.title,
      clicks: link.clickCount || 0,
      uniqueClicks: link.uniqueClickCount || 0
    })).sort((a, b) => b.clicks - a.clicks)
    
    return {
      overview: {
        totalClicks: treeData.value?.totalClicks || 0,
        uniqueClicks: treeData.value?.uniqueClicks || 0,
        conversionRate: treeData.value?.uniqueClicks && treeData.value?.uniqueClicks > 0 ? ((treeData.value.uniqueClicks / treeData.value.totalClicks) * 100).toFixed(2) + '%' : '0%'
      },
      timeSeries: {
        clicksByDate: Object.entries(clicksByDate).map(([date, count]) => ({ date, count }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
      },
      geography: {
        countries: Object.entries(countries).map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        cities: Object.entries(cities).map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
      },
      devices: {
        types: Object.entries(devices).map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count),
        browsers: Object.entries(browsers).map(([browser, count]) => ({ browser, count }))
          .sort((a, b) => b.count - a.count),
        operatingSystems: Object.entries(operatingSystems).map(([os, count]) => ({ os, count }))
          .sort((a, b) => b.count - a.count)
      },
      referrers: Object.entries(referrers).map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count),
      links: linkPerformance
    }
  })

  const fetchAnalyticsData = async () => {
    try {
      loading.value = true
      error.value = null

      // Fetch tree data
      const treeRef = doc(db, 'trees', treeId)
      const treeSnapshot = await getDoc(treeRef)
      if (treeSnapshot.exists()) {
        treeData.value = treeSnapshot.data()
      }

      // Fetch links data
      const linksQuery = query(
        collection(db, 'trees', treeId, 'links'),
        orderBy('order', 'asc')
      )
      const linksSnapshot = await getDocs(linksQuery)
      links.value = linksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Fetch clicks data - limited to last 30 days for performance
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const clicksQuery = query(
        collection(db, 'clicks'),
        where('treeId', '==', treeId),
        where('timestamp', '>=', thirtyDaysAgo),
        orderBy('timestamp', 'desc')
      )
      const clicksSnapshot = await getDocs(clicksQuery)
      clicksData.value = clicksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      error.value = err.message
      console.error('Error fetching analytics data:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch data immediately
  fetchAnalyticsData()

  return { 
    loading, 
    error, 
    metrics, 
    refreshData: fetchAnalyticsData ()
  }
}