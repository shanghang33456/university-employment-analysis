<template>
  <div class="page">
    <div class="page__hint">
      <el-icon><InfoFilled /></el-icon>
      <span>
        单位性质为毕业生填报口径（分母为已就业毕业生），与「登记注册类型」不是同一分类标准；
        当前范围：{{ stats?.scope || '全部学历' }}
      </span>
    </div>

    <SourceNote :ids="['S1', 'S2']" note="单位性质来自 S1 表 1-12，登记注册类型工资来自 S2" />

    <div class="grid grid--kpi">
      <StatCard label="民营企业占比" :value="shareOf('其他企业（含民营企业等）')" suffix="%" :icon="OfficeBuilding" color="#4f7cff" :digits="1" foot="含民营企业等" />
      <StatCard label="国有企业占比" :value="shareOf('国有企业')" suffix="%" :icon="Flag" color="#ffb020" :digits="1" foot="不含机关事业单位" />
      <StatCard label="事业单位类合计" :value="publicRate" suffix="%" :icon="Suitcase" color="#22c1a4" :digits="1" foot="教育 / 医疗 / 高教 / 其他" />
      <StatCard label="机关占比" :value="shareOf('机关')" suffix="%" :icon="Histogram" color="#9b5de5" :digits="1" foot="党政机关" />
    </div>

    <div class="grid grid--2">
      <ChartPanel title="用人单位性质分布 TOP8" hint="占已就业毕业生的比例" :loading="loading">
        <BaseChart :option="typeOption" height="380px" />
      </ChartPanel>

      <ChartPanel title="分登记注册类型年平均工资" hint="城镇单位口径，单位：万元/年；与单位性质并非同一分类" :loading="loading">
        <BaseChart :option="registrationOption" height="380px" />
      </ChartPanel>
    </div>

    <ChartPanel
      title="学历 × 单位性质 热力图"
      hint="同一学历列内合计为 100%，颜色越深代表该学历进入该性质单位的比例越高"
      :loading="loading"
    >
      <BaseChart :option="heatmapOption" height="380px" />
    </ChartPanel>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { InfoFilled, OfficeBuilding, Flag, Suitcase, Histogram } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import ChartPanel from '@/components/ChartPanel.vue'
import BaseChart from '@/components/BaseChart.vue'
import SourceNote from '@/components/SourceNote.vue'
import { fetchCompany } from '@/api/employment'
import { useAnalysisData } from '@/composables/useAnalysisData'
import {
  BASE_GRID,
  categoryAxis,
  valueAxis,
  barGradient,
  createDonutOption,
} from '@/utils/chartOptions'

const DEGREE_ROWS = [
  { name: '博士', key: 'doctor' },
  { name: '硕士', key: 'master' },
  { name: '本科', key: 'bachelor' },
  { name: '专科', key: 'college' },
]

const PUBLIC_TYPES = ['中初教育单位', '医疗卫生单位', '其他事业单位', '高等教育单位']

const { data: stats, loading } = useAnalysisData(fetchCompany, {
  scope: '全部学历',
  types: [],
  registration: [],
})

function shareOf(name) {
  return (stats.value?.types || []).find((t) => t.name === name)?.selected || 0
}

const publicRate = computed(() =>
  Number(PUBLIC_TYPES.reduce((sum, name) => sum + shareOf(name), 0).toFixed(1)),
)

const typeOption = computed(() =>
  createDonutOption({
    data: (stats.value?.types || []).slice(0, 8).map((t) => ({ name: t.name, value: t.selected })),
    unit: '%',
    centerLabel: '单位\n性质',
    radius: ['42%', '68%'],
  }),
)

const heatmapOption = computed(() => {
  const top = (stats.value?.types || []).slice(0, 8)
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
      data: top.map((t) => t.name),
      axisLabel: { color: '#8a97b1', fontSize: 11, interval: 0, rotate: 22, width: 96, overflow: 'truncate' },
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
      inRange: { color: ['#eefaf6', '#a6e8d9', '#22c1a4', '#137a68'] },
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

const registrationOption = computed(() => {
  const list = stats.value?.registration || []
  const toWan = (value) => (value == null ? null : Number((value / 10000).toFixed(1)))
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => `${v} 万元/年` },
    legend: { top: 0, icon: 'roundRect', itemWidth: 10, itemHeight: 10, textStyle: { color: '#5c6b8a', fontSize: 12 } },
    grid: { ...BASE_GRID, top: 44 },
    xAxis: categoryAxis({ data: list.map((d) => d.name) }),
    yAxis: valueAxis({ name: '万元/年' }),
    series: [
      {
        name: '非私营单位',
        type: 'bar',
        barWidth: 26,
        itemStyle: { borderRadius: [6, 6, 0, 0], color: barGradient('#8fb0ff', '#4f7cff') },
        label: { show: true, position: 'top', color: '#5c6b8a', fontSize: 11 },
        data: list.map((d) => toWan(d.nonPrivate)),
      },
      {
        name: '规模以上企业',
        type: 'bar',
        barWidth: 26,
        itemStyle: { borderRadius: [6, 6, 0, 0], color: barGradient('#ffd08a', '#ffb020') },
        label: { show: true, position: 'top', color: '#5c6b8a', fontSize: 11 },
        data: list.map((d) => toWan(d.largeScale)),
      },
    ],
  }
})
</script>
