<!-- ~/components/charts/ChartsPie.vue -->
<template>
  <div :id="chartId" class="h-full w-full"></div>
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
  colors: {
    type: Array,
    default: () => ["#1C64F2", "#16BDCA", "#9061F9", "#E74694", "#FACA15"]
  }
})

const chartId = ref(`pie-chart-${Math.random().toString(36).substring(2, 9)}`)
let chart = null

const createChart = async () => {
  if (chart) {
    chart.destroy()
  }
  
  if (!document.getElementById(chartId.value)) return

  const ApexCharts = (await import('apexcharts')).default
  
  const options = {
    series: props.values,
    colors: props.colors.slice(0, props.values.length),
    chart: {
      height: "100%",
      width: "100%",
      type: "pie",
      toolbar: {
        show: false
      }
    },
    stroke: {
      colors: ["white"],
      width: 2
    },
    plotOptions: {
      pie: {
        size: "100%",
        donut: {
          size: '0%'
        },
        expandOnClick: true,
        dataLabels: {
          offset: -25
        }
      }
    },
    labels: props.labels,
    dataLabels: {
      enabled: true,
      style: {
        fontFamily: "Inter, sans-serif",
        colors: ["#fff"]
      },
      background: {
        enabled: false
      },
      dropShadow: {
        enabled: false
      }
    },
    legend: {
      position: "bottom",
      fontFamily: "Inter, sans-serif",
      fontSize: '14px',
      markers: {
        width: 12,
        height: 12,
        radius: 12
      }
    },
    tooltip: {
      fillSeriesColor: false
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom'
        }
      }
    }]
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