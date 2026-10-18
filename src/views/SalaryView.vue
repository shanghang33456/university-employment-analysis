<template>
  <div class="page">
    <div class="grid grid--kpi">
      <StatCard label="平均月薪" :value="stats.avg" suffix="元" :icon="Money" color="#4f7cff" foot="按样本加权平均" />
      <StatCard label="薪资中位数" :value="stats.median" suffix="元" :icon="Histogram" color="#22c1a4" foot="排除极端值影响" />
      <StatCard label="最高月薪" :value="stats.max" suffix="元" :icon="TrendCharts" color="#ffb020" foot="样本中的最高值" />
      <StatCard label="有效样本量" :value="stats.sampleSize" suffix="人" :icon="User" color="#9b5de5" foot="薪资数据完整的就业毕业生" />
    </div>

    <div class="grid grid--2-1">
      <ChartPanel title="月薪区间分布" hint="各薪资区间的毕业生人数分布" :loading="loading">
        <BaseChart :option="distributionOption" height="340px" />
      </ChartPanel>

      <ChartPanel title="不同学历平均月薪" hint="学历对薪资的影响" :loading="loading">
        <BaseChart :option="degreeOption" height="340px" />
      </ChartPanel>
    </div>

    <div class="grid grid--2">
      <ChartPanel title="各行业平均月薪" :loading="loading">
        <BaseChart :option="industryOption" height="340px" />
      </ChartPanel>

      <ChartPanel title="不同城市等级平均月薪" hint="一线 / 新一线 / 二线 / 其他城市的薪资差异" :loading="loading">
        <BaseChart :option="cityTierOption" height="340px" />
      </ChartPanel>
    </div>

    <div class="grid grid--2">
      <ChartPanel title="高薪专业 TOP8" hint="仅统计样本量 ≥ 8 的专业" :loading="loading">
        <BaseChart :option="majorTopOption" height="330px" />
      </ChartPanel>

      <ChartPanel title="薪资较低专业 TOP8" hint="可作为就业指导重点关注对象" :loading="loading">
        <BaseChart :option="majorBottomOption" height="330px" />
      </ChartPanel>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Money, Histogram, TrendCharts, User } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import ChartPanel from '@/components/ChartPanel.vue'
import BaseChart from '@/components/BaseChart.vue'
import { fetchSalary } from '@/api/employment'
import { useAnalysisData } from '@/composables/useAnalysisData'
import {
  BASE_GRID,
  categoryAxis,
  valueAxis,
  barGradient,
  barGradientH,
  createRankBarOption,
} from '@/utils/chartOptions'

const { data: stats, loading } = useAnalysisData(fetchSalary, {
  distribution: [],
  byDegree: [],
  byIndustry: [],
  byCityTier: [],
  majorTop: [],
  majorBottom: [],
  avg: 0,
  median: 0,
  max: 0,
  sampleSize: 0,
})

const distributionOption = computed(() => {
  const list = stats.value?.distribution || []
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}<br/>{c} 人' },
    grid: { ...BASE_GRID, top: 24 },
    xAxis: categoryAxis({ data: list.map((d) => d.name), axisLabel: { color: '#8a97b1', fontSize: 12, interval: 0 } }),
    yAxis: valueAxis({ name: '人数' }),
    series: [
      {
        type: 'bar',
        barWidth: '52%',
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: barGradient('#8fb0ff', '#4f7cff'),
        },
        label: { show: true, position: 'top', color: '#8a97b1', fontSize: 11 },
        data: list.map((d) => d.value),
      },
    ],
  }
})

const degreeOption = computed(() => {
  const list = [...(stats.value?.byDegree || [])].reverse()
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}<br/>平均月薪 {c} 元' },
    grid: { ...BASE_GRID, top: 24 },
    xAxis: categoryAxis({ data: list.map((d) => d.name) }),
    yAxis: valueAxis({ name: '元' }),
    series: [
      {
        type: 'bar',
        barWidth: 46,
        itemStyle: { borderRadius: [8, 8, 0, 0], color: barGradient('#7ee0cd', '#22c1a4') },
        label: { show: true, position: 'top', color: '#5c6b8a', fontSize: 12, formatter: '{c} 元' },
        data: list.map((d) => d.value),
      },
    ],
  }
})

const industryOption = computed(() =>
  createRankBarOption({ data: stats.value?.byIndustry || [], color: ['#ffd08a', '#ffb020'], unit: '元' }),
)

const cityTierOption = computed(() => {
  const list = stats.value?.byCityTier || []
  return {
    tooltip: { trigger: 'item', formatter: '{b}<br/>平均月薪 {c} 元' },
    grid: { ...BASE_GRID, top: 24 },
    xAxis: categoryAxis({ data: list.map((d) => d.name) }),
    yAxis: valueAxis({ name: '元' }),
    series: [
      {
        type: 'bar',
        barWidth: 40,
        itemStyle: { borderRadius: [8, 8, 0, 0], color: barGradientH('#c8b4ff', '#9b5de5') },
        label: { show: true, position: 'top', color: '#5c6b8a', fontSize: 12, formatter: '{c} 元' },
        data: list.map((d) => d.value),
      },
    ],
  }
})

const majorTopOption = computed(() =>
  createRankBarOption({ data: stats.value?.majorTop || [], color: ['#22c1a4', '#4f7cff'], unit: '元' }),
)

const majorBottomOption = computed(() =>
  createRankBarOption({ data: stats.value?.majorBottom || [], color: ['#ffb020', '#ff6b81'], unit: '元' }),
)
</script>
