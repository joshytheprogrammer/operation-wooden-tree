<!-- ~/components/charts/ChartsBar.vue -->
<template>
  <ClientOnly>
    <div :id="chartId" class="h-full w-full"></div>
    <template #fallback>
      <div class="h-full w-full flex items-center justify-center">
        <p class="text-gray-500">Loading chart...</p>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  labels: {
    type: Array,
    required: true
  },
  values: {
    type: Array,
    required: true
  },
  horizontal: {
    type: Boolean,
    default: false
  },
  colors: {
    type: Array,
    default: () => ['#1C64F2', '#7E3AF2']
  }
})

// Generate unique ID for each chart instance
const chartId = ref(`bar-chart-${Math.random().toString(36).substring(2, 9)}`)
let chart = null

const createChart = async () => {
  if (chart) {
    chart.destroy()
  }
  
  if (!document.getElementById(chartId.value)) return

  const ApexCharts = (await import('apexcharts')).default
  
  const options = {
    series: [{
      name: "Count",
      color: props.colors[0],
      data: props.values
    }],
    chart: {
      type: "bar",
      height: "100%",
      width: "100%",
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: props.horizontal,
        columnWidth: "70%",
        borderRadius: 6,
        dataLabels: {
          position: "top"
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: props.labels,
      labels: {
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        show: true,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
        }
      }
    },
    grid: {
      show: true,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: -20
      }
    },
    fill: {
      opacity: 1
    }
  }

  chart = new ApexCharts(document.getElementById(chartId.value), options)
  chart.render()
}

onMounted(() => {
  createChart()
})

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
  }
})

// Re-render chart when props change
watch([() => props.labels, () => props.values], () => {
  createChart()
}, { deep: true });
</script>