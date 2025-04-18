<!-- ~/components/charts/ChartsLine.vue -->
<template>
  <div :id="chartId" class="h-full w-full"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true // Array of {date, count} objects
  },
  color: {
    type: String,
    default: '#1A56DB'
  }
})

const chartId = ref(`line-chart-${Math.random().toString(36).substring(2, 9)}`)
let chart = null

const createChart = async () => {
  if (chart) {
    chart.destroy()
  }
  
  if (!document.getElementById(chartId.value) || !props.data.length) return

  const ApexCharts = (await import('apexcharts')).default
  
  const dates = props.data.map(item => item.date)
  const counts = props.data.map(item => item.count)
  
  const options = {
    series: [
      {
        name: "Clicks",
        data: counts,
        color: props.color
      }
    ],
    chart: {
      height: "100%",
      width: "100%",
      type: "line",
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
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
      type: 'gradient',
      gradient: {
        shade: 'dark',
        gradientToColors: [props.color],
        shadeIntensity: 1,
        type: 'horizontal',
        opacityFrom: 0.7,
        opacityTo: 0.3,
      }
    },
    xaxis: {
      categories: dates,
      labels: {
        show: true,
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
    tooltip: {
      x: {
        format: 'dd/MM/yy'
      }
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

// Re-render chart when data changes
watch(() => props.data, () => {
  createChart()
}, { deep: true });
</script>