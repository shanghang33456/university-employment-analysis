<template>
  <div class="page">
    <div class="grid grid--kpi">
      <StatCard label="覆盖行业数" :value="industryCount" suffix="个" :icon="OfficeBuilding" color="#4f7cff" foot="就业毕业生所在行业" />
      <StatCard label="第一大行业" :value="topIndustryValue" suffix="人" :icon="TrendCharts" color="#22c1a4" :foot="stats.topIndustry" />
      <StatCard label="最高薪资行业" :value="topSalary?.value || 0" suffix="元" :icon="Money" color="#ffb020" :foot="topSalary?.name || '—'" />
      <StatCard label="行业集中度 CR3" :value="cr3" suffix="%" :icon="Histogram" color="#9b5de5" :digits="1" foot="前三大行业就业占比" />
    </div>

    <div class="grid grid--2">
      <ChartPanel title="就业行业分布" hint="按签约就业人数排序" :loading="loading">
        <BaseChart :option="distributionOption" height="360px" />
      </ChartPanel>

      <ChartPanel title="各行业平均月薪" hint="仅统计签约就业与灵活就业毕业生" :loading="loading">
        <BaseChart :option="salaryOption" height="360px" />
      </ChartPanel>
    </div>

    <ChartPanel title="学院 × 行业 就业热力图" hint="颜色越深代表该学院进入该行业的人数越多，可用于识别学院的行业优势" :loading="loading">
      <BaseChart :option="heatmapOption" height="380px" />
    </ChartPanel>

    <ChartPanel title="不同学历的行业流向" hint="对比本科、硕士、博士的行业偏好差异" :loading="loading">
      <BaseChart :option="degreeOption" height="340px" />
    </ChartPanel>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { OfficeBuilding, TrendCharts, Money, Histogram } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import ChartPanel from '@/components/ChartPanel.vue'
import BaseChart from '@/components/BaseChart.vue'
import { fetchIndustry } from '@/api/employment'
import { useAnalysisData } from '@/composables/useAnalysisData'
import {
  BASE_GRID,
  categoryAxis,
  valueAxis,
  barGradientH,
  createRankBarOption,
} from '@/utils/chartOptions'

const { data: stats, loading } = useAnalysisData(fetchIndustry, {
  distribution: [],
  salary: [],
  matrix: { industries: [], colleges: [], data: [] },
  byDegree: {},
})

const industryCount = computed(() => stats.value?.distribution?.length || 0)
const topIndustryValue = computed(() => stats.value?.distribution?.[0]?.value || 0)
const topSalary = computed(() => stats.value?.salary?.[0])

const cr3 = computed(() => {
  const list = stats.value?.distribution || []
  const total = list.reduce((sum, d) => sum + d.value, 0)
  if (!total) return 0
  const top3 = list.slice(0, 3).reduce((sum, d) => sum + d.value, 0)
  return Number(((top3 / total) * 100).toFixed(1))
})

const distributionOption = computed(() =>
  createRankBarOption({ data: stats.value?.distribution || [], unit: '人' }),
)

const salaryOption = computed(() => {
  const list = [...(stats.value?.salary || [])].sort((a, b) => a.value - b.value)
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}<br/>平均月薪 {c} 元' },
    grid: { left: 8, right: 48, top: 12, bottom: 8, containLabel: true },
    xAxis: valueAxis({ show: false }),
    yAxis: categoryAxis({
      data: list.map((d) => d.name),
      axisLabel: { color: '#8a97b1', fontSize: 12, width: 90, overflow: 'truncate' },
    }),
    series: [
      {
        type: 'bar',
        barWidth: 14,
        showBackground: true,
        backgroundStyle: { color: '#f4f6fb', borderRadius: 8 },
        itemStyle: { borderRadius: 8, color: barGradientH('#ffd08a', '#ffb020') },
        label: { show: true, position: 'right', color: '#5c6b8a', fontSize: 11, formatter: '{c} 元' },
        data: list.map((d) => d.value),
      },
    ],
  }
})

const heatmapOption = computed(() => {
  const matrix = stats.value?.matrix || { industries: [], colleges: [], data: [] }
  const points = []
  matrix.data.forEach((row, y) => {
    row.forEach((value, x) => {
      points.push([x, y, value])
    })
  })
  const maxValue = Math.max(1, ...points.map((p) => p[2]))

  return {
    tooltip: {
      position: 'top',
      formatter: (params) =>
        `${matrix.colleges[params.value[1]]}<br/>${matrix.industries[params.value[0]]}<br/>${params.value[2]} 人`,
    },
    grid: { left: 8, right: 20, top: 20, bottom: 60, containLabel: true },
    xAxis: categoryAxis({
      data: matrix.industries,
      axisLabel: { color: '#8a97b1', fontSize: 11, interval: 0, rotate: 22 },
      splitArea: { show: true },
    }),
    yAxis: categoryAxis({ data: matrix.colleges, splitArea: { show: true } }),
    visualMap: {
      min: 0,
      max: maxValue,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: { color: ['#eef3ff', '#a9c1ff', '#4f7cff', '#2b4fbf'] },
      textStyle: { color: '#8a97b1', fontSize: 11 },
    },
    series: [
      {
        type: 'heatmap',
        data: points,
        label: { show: true, fontSize: 10, color: '#1f2d4d' },
        itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 4 },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(31,56,110,0.35)' } },
      },
    ],
  }
})

const degreeOption = computed(() => {
  const byDegree = stats.value?.byDegree || {}
  const degrees = Object.keys(byDegree)
  const industries = (stats.value?.distribution || []).slice(0, 7).map((d) => d.name)

  const industriesByDegree = degrees.map((degree) => {
    const row = byDegree[degree] || {}
    const total = Object.values(row).reduce((sum, v) => sum + v, 0)
    return industries.map((name) => (total ? Number((((row[name] || 0) / total) * 100).toFixed(1)) : 0))
  })

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => `${v}%` },
    legend: { top: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { color: '#5c6b8a', fontSize: 12 } },
    grid: { ...BASE_GRID, top: 44 },
    xAxis: categoryAxis({ data: degrees }),
    yAxis: valueAxis({ max: 100, axisLabel: { color: '#8a97b1', fontSize: 12, formatter: '{value}%' } }),
    series: industries.map((name, index) => ({
      name,
      type: 'bar',
      stack: 'total',
      barWidth: 48,
      itemStyle: { borderRadius: index === industries.length - 1 ? [4, 4, 0, 0] : 0 },
      data: degrees.map((_, degreeIndex) => industriesByDegree[degreeIndex][index]),
    })),
  }
})
</script>
