<template>
  <div class="page">
    <div class="grid grid--kpi">
      <StatCard label="去向落实率" :value="stats.fulfillRate" suffix="%" :icon="CircleCheck" color="#4f7cff" :digits="1" foot="除待就业外均计入" />
      <StatCard label="签约就业占比" :value="rate('签约就业')" suffix="%" :icon="Suitcase" color="#22c1a4" :digits="1" />
      <StatCard label="升学（含出国）" :value="rate('国内升学') + rate('出国出境')" suffix="%" :icon="Reading" color="#9b5de5" :digits="1" />
      <StatCard label="待就业占比" :value="rate('待就业')" suffix="%" :icon="Warning" color="#ff6b81" :digits="1" />
    </div>

    <div class="grid grid--2-1">
      <ChartPanel title="各学院毕业去向构成" hint="百分比堆叠，直观对比学院之间的去向差异" :loading="loading">
        <BaseChart :option="collegeStackOption" height="360px" />
      </ChartPanel>

      <ChartPanel title="整体去向分布" hint="当前筛选范围内各去向人数" :loading="loading">
        <BaseChart :option="distributionOption" height="360px" />
      </ChartPanel>
    </div>

    <div class="grid grid--2">
      <ChartPanel title="不同学历的去向结构" hint="学历层次对升学、就业选择的影响" :loading="loading">
        <BaseChart :option="degreeOption" height="320px" />
      </ChartPanel>

      <ChartPanel title="毕业去向年度趋势" hint="各类去向人数的逐年变化（不受年份筛选影响）" :loading="loading">
        <BaseChart :option="trendOption" height="320px" />
      </ChartPanel>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CircleCheck, Suitcase, Reading, Warning } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import ChartPanel from '@/components/ChartPanel.vue'
import BaseChart from '@/components/BaseChart.vue'
import { fetchDestination } from '@/api/employment'
import { useAnalysisData } from '@/composables/useAnalysisData'
import { createDonutOption, categoryAxis, valueAxis, BASE_GRID } from '@/utils/chartOptions'

const DESTINATION_ORDER = ['签约就业', '国内升学', '出国出境', '灵活就业', '自主创业', '待就业']
const DESTINATION_COLORS = ['#4f7cff', '#9b5de5', '#00bbf9', '#22c1a4', '#ffb020', '#ff6b81']

const { data, loading } = useAnalysisData(fetchDestination, { distribution: [], byDegree: {}, byCollege: {}, trend: [] })

const stats = computed(() => {
  const total = (data.value?.distribution || []).reduce((sum, d) => sum + d.value, 0)
  const fulfilled = (data.value?.distribution || [])
    .filter((d) => d.name !== '待就业')
    .reduce((sum, d) => sum + d.value, 0)
  return { fulfillRate: total ? Number(((fulfilled / total) * 100).toFixed(1)) : 0 }
})

function rate(name) {
  const total = (data.value?.distribution || []).reduce((sum, d) => sum + d.value, 0)
  if (!total) return 0
  const item = (data.value?.distribution || []).find((d) => d.name === name)
  return Number((((item?.value || 0) / total) * 100).toFixed(1))
}

/** 各学院去向百分比堆叠 */
const collegeStackOption = computed(() => {
  const byCollege = data.value?.byCollege || {}
  const colleges = Object.keys(byCollege)
  const series = DESTINATION_ORDER.map((name, index) => ({
    name,
    type: 'bar',
    stack: 'total',
    barWidth: '46%',
    itemStyle: { color: DESTINATION_COLORS[index], borderRadius: index === DESTINATION_ORDER.length - 1 ? [4, 4, 0, 0] : 0 },
    emphasis: { focus: 'series' },
    data: colleges.map((college) => {
      const row = byCollege[college] || {}
      const total = DESTINATION_ORDER.reduce((sum, key) => sum + (row[key] || 0), 0)
      return total ? Number((((row[name] || 0) / total) * 100).toFixed(1)) : 0
    }),
  }))

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => `${v}%` },
    legend: { top: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { color: '#5c6b8a', fontSize: 12 } },
    grid: { ...BASE_GRID, top: 44 },
    xAxis: categoryAxis({ data: colleges, axisLabel: { color: '#8a97b1', fontSize: 12, interval: 0, rotate: colleges.length > 5 ? 24 : 0 } }),
    yAxis: valueAxis({ max: 100, axisLabel: { color: '#8a97b1', fontSize: 12, formatter: '{value}%' } }),
    series,
  }
})

const distributionOption = computed(() =>
  createDonutOption({
    data: (data.value?.distribution || []).map((d) => ({ name: d.name, value: d.value })),
    centerLabel: '去向\n分布',
    radius: ['42%', '68%'],
  }),
)

const degreeOption = computed(() => {
  const byDegree = data.value?.byDegree || {}
  const degrees = Object.keys(byDegree)
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { top: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { color: '#5c6b8a', fontSize: 12 } },
    grid: { ...BASE_GRID, top: 44, bottom: 4 },
    xAxis: categoryAxis({ data: degrees }),
    yAxis: valueAxis({ name: '人数' }),
    series: DESTINATION_ORDER.map((name, index) => ({
      name,
      type: 'bar',
      stack: 'total',
      barWidth: 42,
      itemStyle: { color: DESTINATION_COLORS[index], borderRadius: index === DESTINATION_ORDER.length - 1 ? [4, 4, 0, 0] : 0 },
      data: degrees.map((degree) => byDegree[degree]?.[name] || 0),
    })),
  }
})

const trendOption = computed(() => {
  const trend = data.value?.trend || []
  return {
    tooltip: { trigger: 'axis' },
    legend: { top: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { color: '#5c6b8a', fontSize: 12 } },
    grid: { ...BASE_GRID, top: 44 },
    xAxis: categoryAxis({ data: trend.map((t) => `${t.year} 届`) }),
    yAxis: valueAxis({ name: '人数' }),
    series: DESTINATION_ORDER.map((name, index) => ({
      name,
      type: 'line',
      smooth: true,
      symbolSize: 6,
      lineStyle: { width: 2.5, color: DESTINATION_COLORS[index] },
      itemStyle: { color: DESTINATION_COLORS[index] },
      areaStyle: index < 2 ? { opacity: 0.12, color: DESTINATION_COLORS[index] } : undefined,
      data: trend.map((t) => t[name] || 0),
    })),
  }
})
</script>
