<template>
  <div class="page">
    <div class="page__hint">
      <el-icon><InfoFilled /></el-icon>
      <span>
        当前范围：{{ stats?.scope || '全部学历' }}；行业占比分母为<strong>已就业毕业生</strong>，
        工资数据另为城镇单位口径，二者不可直接比较
      </span>
    </div>

    <SourceNote :ids="['S3', 'S2']" note="行业流向来自 S3 行业 × 学历交叉表，工资参照来自国家统计局 S2" />

    <div class="grid grid--kpi">
      <StatCard label="覆盖行业数" :value="industryCount" suffix="个" :icon="OfficeBuilding" color="#4f7cff" foot="国民经济行业门类" />
      <StatCard label="第一大行业" :value="topIndustry?.selected || 0" suffix="%" :icon="TrendCharts" color="#22c1a4" :digits="1" :foot="topIndustry?.name || '—'" />
      <StatCard label="行业集中度 CR3" :value="cr3" suffix="%" :icon="Histogram" color="#9b5de5" :digits="1" foot="前三大行业合计占比" />
      <StatCard label="最高工资行业" :value="topWage" suffix="万/年" :icon="Money" color="#ffb020" :digits="1" :foot="stats?.wages?.[0]?.name || '—'" />
    </div>

    <div class="grid grid--2">
      <ChartPanel title="就业行业分布 TOP12" hint="占已就业毕业生的比例，按当前学历筛选" :loading="loading">
        <BaseChart :option="distributionOption" height="400px" />
      </ChartPanel>

      <ChartPanel title="学历 × 行业 热力图" hint="行内合计为 100%，颜色越深代表该学历进入该行业的比例越高" :loading="loading">
        <BaseChart :option="heatmapOption" height="400px" />
      </ChartPanel>
    </div>

    <ChartPanel
      title="行业年平均工资参照（城镇单位）"
      hint="国家统计局 2025 年城镇单位就业人员年平均工资，单位：万元/年；统计对象为城镇法人单位，不是毕业生起薪"
      :loading="loading"
    >
      <BaseChart :option="wageOption" height="420px" />
    </ChartPanel>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { InfoFilled, OfficeBuilding, TrendCharts, Histogram, Money } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import ChartPanel from '@/components/ChartPanel.vue'
import BaseChart from '@/components/BaseChart.vue'
import SourceNote from '@/components/SourceNote.vue'
import { fetchIndustry } from '@/api/employment'
import { useAnalysisData } from '@/composables/useAnalysisData'
import {
  categoryAxis,
  valueAxis,
  barGradientH,
  createRankBarOption,
} from '@/utils/chartOptions'

const DEGREE_ROWS = [
  { name: '博士', key: 'doctor' },
  { name: '硕士', key: 'master' },
  { name: '本科', key: 'bachelor' },
  { name: '专科', key: 'college' },
]

const { data: stats, loading } = useAnalysisData(fetchIndustry, {
  scope: '全部学历',
  industries: [],
  wages: [],
})

const industryCount = computed(() => stats.value?.industries?.length || 0)
const topIndustry = computed(() => stats.value?.industries?.[0])
const topWage = computed(() => {
  const value = stats.value?.wages?.[0]?.nonPrivate || 0
  return Number((value / 10000).toFixed(1))
})

const cr3 = computed(() => {
  const list = stats.value?.industries || []
  const total = list.reduce((sum, d) => sum + d.selected, 0)
  if (!total) return 0
  const top3 = list.slice(0, 3).reduce((sum, d) => sum + d.selected, 0)
  return Number(((top3 / total) * 100).toFixed(1))
})

const distributionOption = computed(() =>
  createRankBarOption({
    data: (stats.value?.industries || []).slice(0, 12).map((d) => ({ name: d.name, value: d.selected })),
    unit: '%',
  }),
)

/** 学历 × 行业热力图（取占比最高的 10 个行业） */
const heatmapOption = computed(() => {
  const top = (stats.value?.industries || []).slice(0, 10)
  const points = []
  DEGREE_ROWS.forEach((row, y) => {
    top.forEach((item, x) => {
      points.push([x, y, item[row.key] ?? 0])
    })
  })
  const maxValue = Math.max(1, ...points.map((p) => p[2]))

  return {
    tooltip: {
      position: 'top',
      formatter: (params) => {
        const [x, y, value] = params.value
        return `${DEGREE_ROWS[y].name}<br/>${top[x].name}<br/>${value}%`
      },
    },
    grid: { left: 8, right: 20, top: 20, bottom: 60, containLabel: true },
    xAxis: categoryAxis({
      data: top.map((d) => d.name),
      axisLabel: { color: '#8a97b1', fontSize: 11, interval: 0, rotate: 26, width: 84, overflow: 'truncate' },
      splitArea: { show: true },
    }),
    yAxis: categoryAxis({ data: DEGREE_ROWS.map((d) => d.name), splitArea: { show: true } }),
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
        label: { show: true, fontSize: 10, color: '#1f2d4d', formatter: '{c}%' },
        itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 4 },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(31,56,110,0.35)' } },
      },
    ],
  }
})

/** 行业年平均工资（万元/年，非私营 vs 私营） */
const wageOption = computed(() => {
  const list = (stats.value?.wages || []).slice(0, 10).reverse()
  const toWan = (value) => (value == null ? null : Number((value / 10000).toFixed(1)))
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value) => (value == null ? '—' : `${value} 万元/年`),
    },
    legend: { top: 0, icon: 'roundRect', itemWidth: 10, itemHeight: 10, textStyle: { color: '#5c6b8a', fontSize: 12 } },
    grid: { left: 8, right: 56, top: 42, bottom: 8, containLabel: true },
    xAxis: valueAxis({ show: false }),
    yAxis: categoryAxis({
      data: list.map((d) => d.name),
      axisLabel: { color: '#8a97b1', fontSize: 12, width: 130, overflow: 'truncate' },
    }),
    series: [
      {
        name: '非私营单位',
        type: 'bar',
        barWidth: 9,
        itemStyle: { borderRadius: 5, color: barGradientH('#8fb0ff', '#4f7cff') },
        label: { show: true, position: 'right', color: '#4a5878', fontSize: 11, formatter: '{c}万' },
        data: list.map((d) => toWan(d.nonPrivate)),
      },
      {
        name: '私营单位',
        type: 'bar',
        barWidth: 9,
        itemStyle: { borderRadius: 5, color: barGradientH('#7ee0cd', '#22c1a4') },
        label: { show: true, position: 'right', color: '#4a5878', fontSize: 11, formatter: '{c}万' },
        data: list.map((d) => toWan(d.private)),
      },
    ],
  }
})
</script>
