<!-- ~/components/AnalyticsDashboard.vue -->
<template>
  <div>
    <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <UIcon name="i-heroicons-exclamation-circle" class="h-5 w-5 text-red-400 dark:text-red-300" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
            Error loading analytics: {{ error }}
          </h3>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="flex justify-center py-12">
      <AppSpinner />
    </div>
    
    <template v-else-if="metrics">
      <!-- Overview Panel -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <UCard class="text-center">
          <div class="text-4xl font-bold text-primary-500">{{ metrics.overview.totalClicks }}</div>
          <div class="text-gray-500 dark:text-gray-400">Total Clicks</div>
        </UCard>
        
        <UCard class="text-center">
          <div class="text-4xl font-bold text-purple-500">{{ metrics.overview.uniqueClicks }}</div>
          <div class="text-gray-500 dark:text-gray-400">Unique Clicks</div>
        </UCard>
        
        <UCard class="text-center">
          <div class="text-4xl font-bold text-amber-500">{{ metrics.overview.conversionRate }}</div>
          <div class="text-gray-500 dark:text-gray-400">Clicks Per User </div>
        </UCard>
      </div>
      
      <!-- Time Series Chart -->
      <UCard class="mb-6">
        <template #header>
          <div class="flex items-center">
            <UIcon name="i-heroicons-chart-bar" class="mr-2 h-5 w-5" />
            <h3 class="font-semibold">Click Trends</h3>
          </div>
        </template>
        
        <div class="h-64">
          <ChartsLine :data="metrics.timeSeries.clicksByDate" />
        </div>
      </UCard>
      
      <!-- Geographic Distribution -->
      <UCard class="mb-6">
        <template #header>
          <div class="flex items-center">
            <UIcon name="i-heroicons-globe-alt" class="mr-2 h-5 w-5" />
            <h3 class="font-semibold">Geographic Distribution</h3>
          </div>
        </template>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Country Chart -->
          <div>
            <h4 class="font-medium mb-2">Top Countries</h4>
            <div class="h-48">
              <ChartsBar 
                :labels="metrics.geography.countries.slice(0, 5).map(c => c.name)"
                :values="metrics.geography.countries.slice(0, 5).map(c => c.count)"
              />
            </div>
          </div>
          
          <!-- City Chart -->
          <div>
            <h4 class="font-medium mb-2">Top Cities</h4>
            <div class="h-48">
              <ChartsBar 
                :labels="metrics.geography.cities.slice(0, 5).map(c => c.name)"
                :values="metrics.geography.cities.slice(0, 5).map(c => c.count)"
              />
            </div>
          </div>
        </div>
      </UCard>
      
      <!-- Device Analytics -->
      <UCard class="mb-6">
        <template #header>
          <div class="flex items-center">
            <UIcon name="i-heroicons-device-phone-mobile" class="mr-2 h-5 w-5" />
            <h3 class="font-semibold">Device Analytics</h3>
          </div>
        </template>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Device Types -->
          <div>
            <h4 class="font-medium mb-2">Device Types</h4>
            <div class="h-48">
              <ChartsPie 
                :labels="metrics.devices.types.map(d => d.type)"
                :values="metrics.devices.types.map(d => d.count)"
              />
            </div>
          </div>
          
          <!-- Browsers -->
          <div>
            <h4 class="font-medium mb-2">Browsers</h4>
            <div class="h-48">
              <ChartsPie 
                :labels="metrics.devices.browsers.map(b => b.browser)"
                :values="metrics.devices.browsers.map(b => b.count)"
              />
            </div>
          </div>
          
          <!-- Operating Systems -->
          <div>
            <h4 class="font-medium mb-2">Operating Systems</h4>
            <div class="h-48">
              <ChartsPie 
                :labels="metrics.devices.operatingSystems.map(os => os.os)"
                :values="metrics.devices.operatingSystems.map(os => os.count)"
              />
            </div>
          </div>
        </div>
      </UCard>
      
      <!-- Link Performance -->
      <UCard class="mb-6">
        <template #header>
          <div class="flex items-center">
            <UIcon name="i-heroicons-link" class="mr-2 h-5 w-5" />
            <h3 class="font-semibold">Link Performance</h3>
          </div>
        </template>
        
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs uppercase bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3">Link</th>
                <th class="px-6 py-3 text-right">Clicks</th>
                <th class="px-6 py-3 text-right">Unique Clicks</th>
                <th class="px-6 py-3 text-right">% of Clicks</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="link in metrics.links" :key="link.id" class="border-b dark:border-gray-700">
                <td class="px-6 py-4 font-medium">{{ link.title }}</td>
                <td class="px-6 py-4 text-right">{{ link.clicks }}</td>
                <td class="px-6 py-4 text-right">{{ link.uniqueClicks }}</td>
                <td class="px-6 py-4 text-right">
                  {{ calculateCTR(link.uniqueClicks, metrics.overview.uniqueClicks) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
      
      <!-- Referrers -->
      <UCard>
        <template #header>
          <div class="flex items-center">
            <UIcon name="i-heroicons-arrow-path" class="mr-2 h-5 w-5" />
            <h3 class="font-semibold">Traffic Sources</h3>
          </div>
        </template>
        
        <div class="h-64">
          <ChartsBar 
            :labels="metrics.referrers.slice(0, 5).map(r => r.source)"
            :values="metrics.referrers.slice(0, 5).map(r => r.count)"
          />
        </div>
      </UCard>

    </template>
    
    <div v-else-if="!loading" class="text-center py-12">
      <UIcon name="i-heroicons-chart-bar" class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
      <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">
        No analytics data available
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Start sharing your links to collect analytics data.
      </p>
    </div>
  </div>
</template>

<script setup>
import { useTreeAnalytics } from '~/composables/useTreeAnalytics'

const props = defineProps({
  treeId: {
    type: String,
    required: true
  }
})

const { loading, error, metrics, refreshData } = useTreeAnalytics(props.treeId)

// Helper function to calculate CTR
const calculateCTR = (clicks, total) => {
  if (!total || !clicks) return '0%'
  return ((clicks / total) * 100).toFixed(2) + '%'
};
</script>