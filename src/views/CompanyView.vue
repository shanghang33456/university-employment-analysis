<template>
  <div class="page">
    <div class="grid grid--kpi">
      <StatCard label="主要用人单位性质" :value="topTypeValue" suffix="人" :icon="Suitcase" color="#4f7cff" :foot="stats.topType" />
      <StatCard label="民营企业占比" :value="privateRate" suffix="%" :icon="OfficeBuilding" color="#22c1a4" :digits="1" foot="吸纳毕业生的主力" />
      <StatCard label="国有企业占比" :value="stateRate" suffix="%" :icon="Flag" color="#ffb020" :digits="1" foot="含党政机关 / 事业单位" />
      <StatCard label="大型企业就业占比" :value="largeScaleRate" suffix="%" :icon="Histogram" color="#9b5de5" :digits="1" foot="1000 人以上规模" />
    </div>

    <div class="grid grid--2-1">
      <ChartPanel title="用人单位类型分布" hint="不同性质单位的就业人数占比" :loading="loading">
        <BaseChart :option="typeOption" height="340px" />
      </ChartPanel>

      <ChartPanel title="企业规模分布" hint="按用人单位规模划分的就业人数" :loading="loading">
        <BaseChart :option="scaleOption" height="340px" />
      </ChartPanel>
    </div>

    <div class="grid grid--2">
      <ChartPanel title="不同类型单位平均月薪" hint="国企 / 民企 / 外企等的薪资差异" :loading="loading">
        <BaseChart :option="typeSalaryOption" height="330px" />
      </ChartPanel>

      <ChartPanel title="不同规模企业平均月薪" :loading="loading">
        <BaseChart :option="scaleSalaryOption" height="330px" />
      </ChartPanel>
    </div>

    <ChartPanel title="学院 × 单位性质 热力图" hint="颜色越深代表该学院进入该类型单位的人数越多" :loading="loading">
      <BaseChart :option="heatmapOption" height="380px" />
    </ChartPanel>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Suitcase, OfficeBuilding, Flag, Histogram } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import ChartPanel from '@/components/ChartPanel.vue'
import BaseChart from '@/components/BaseChart.vue'
import { fetchCompany } from '@/api/employment'
import { useAnalysisData } from '@/composables/useAnalysisData'
import { createDonutOption, createRankBarOption } from '@/utils/chartOptions'

const { data: stats, loading } = useAnalysisData(fetchCompany, {
  typeDistribution: [],
  scaleDistribution: [],
  typeSalary: [],
  scaleSalary: [],
  matrix: { types: [], colleges: [], data: [] },
})

const topTypeValue = computed(() => stats.value?.typeDistribution?.[0]?.value || 0)

function ratio(name, keywords) {
  const list = stats.value?.typeDistribution || []
  const total = list.reduce((sum, d) => sum + d.value, 0)
  if (!total) return 0
  const value = list
    .filter((d) => keywords.some((kw) => d.name.includes(kw)))
    .reduce((sum, d) => sum + d.value, 0)
  return Number(((value / total) * 100).toFixed(1))
}

const privateRate = computed(() => ratio('民营企业', ['民营']))
const stateRate = computed(() => ratio('国有', ['国有', '党政机关', '事业单位']))

const largeScaleRate = computed(() => {
  const list = stats.value?.scaleDistribution || []
  const total = list.reduce((sum, d) => sum + d.value, 0)
  if (!total) return 0
  const large = list.find((d) => d.name.includes('大型'))?.value || 0
  return Number(((large / total) * 100).toFixed(1))
})

const typeOption = computed(() =>
  createDonutOption({
    data: stats.value?.typeDistribution || [],
    centerLabel: '单位\n性质',
    radius: ['44%', '70%'],
  }),
)

const scaleOption = computed(() => {
  const list = stats.value?.scaleDistribution || []
  const shortNames = list.map((d) => ({ name: d.name.split('(')[0], value: d.value }))
  return createDonutOption({ data: shortNames, centerLabel: '企业\n规模', radius: ['44%', '70%'] })
})

const typeSalaryOption = computed(() =>
  createRankBarOption({ data: stats.value?.typeSalary || [], color: ['#8fb0ff', '#4f7cff'], unit: '元' }),
)

const scaleSalaryOption = computed(() =>
  createRankBarOption({ data: stats.value?.scaleSalary || [], color: ['#7ee0cd', '#22c1a4'], unit: '元' }),
)

const heatmapOption = computed(() => {
  const matrix = stats.value?.matrix || { types: [], colleges: [], data: [] }
  const points = []
  matrix.data.forEach((row, y) => {
    row.forEach((value, x) => points.push([x, y, value]))
  })
  const maxValue = Math.max(1, ...points.map((p) => p[2]))

  return {
    tooltip: {
      position: 'top',
      formatter: (params) => `${matrix.colleges[params.value[1]]}<br/>${matrix.types[params.value[0]]}<br/>${params.value[2]} 人`,
    },
    grid: { left: 8, right: 20, top: 20, bottom: 56, containLabel: true },
    xAxis: {
      type: 'category',
      data: matrix.types,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e3e8f0' } },
      axisLabel: { color: '#8a97b1', fontSize: 11, interval: 0, rotate: 18 },
      splitArea: { show: true },
    },
    yAxis: {
      type: 'category',
      data: matrix.colleges,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e3e8f0' } },
      axisLabel: { color: '#8a97b1', fontSize: 12 },
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: maxValue,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: { color: ['#eefaf6', '#a6e8d9', '#22c1a4', '#137a68'] },
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
</script>
