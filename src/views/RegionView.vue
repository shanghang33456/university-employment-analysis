<template>
  <div class="page">
    <div class="page__hint">
      <el-icon><InfoFilled /></el-icon>
      <span>
        国家战略地区按就业所在地归类，<strong>四类区域存在交叉</strong>（同一就业地可能同时属于多个区域），
        因此占比相加会超过 100%，不可当作互斥分组
      </span>
    </div>

    <SourceNote :ids="['S4', 'S5', 'S2']" note="区域流向来自 S4，留桂城市来自 S5，区域工资参照来自 S2" />

    <div class="grid grid--kpi">
      <StatCard
        v-for="(item, index) in kpiRegions"
        :key="item.name"
        :label="item.name"
        :value="item.value"
        suffix="%"
        :icon="REGION_ICONS[index]"
        :color="REGION_COLORS[index]"
        :digits="1"
        :foot="`占已就业毕业生 · ${data?.scope || '全部学历'}`"
      />
    </div>

    <div class="grid grid--2">
      <ChartPanel title="国家战略地区流向" hint="占已就业毕业生的比例，当前学历筛选下" :loading="loading">
        <BaseChart :option="regionOption" height="340px" />
      </ChartPanel>

      <ChartPanel title="分学历战略地区流向" hint="同一区域在不同学历间的差异；区域间存在交叉" :loading="loading">
        <BaseChart :option="degreeOption" height="340px" />
      </ChartPanel>
    </div>

    <div class="grid grid--2">
      <ChartPanel title="留桂就业设区市分布" hint="占「留在广西就业」毕业生人数的比例" :loading="loading">
        <BaseChart :option="cityOption" height="420px" />
      </ChartPanel>

      <ChartPanel title="分区域年平均工资参照" hint="城镇单位口径，单位：万元/年；与毕业生起薪不可直接比较" :loading="loading">
        <BaseChart :option="wageOption" height="420px" />
      </ChartPanel>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { InfoFilled, Location, MapLocation, OfficeBuilding, Flag } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import ChartPanel from '@/components/ChartPanel.vue'
import BaseChart from '@/components/BaseChart.vue'
import SourceNote from '@/components/SourceNote.vue'
import { fetchRegion } from '@/api/employment'
import { useAnalysisData } from '@/composables/useAnalysisData'
import {
  BASE_GRID,
  categoryAxis,
  valueAxis,
  barGradientH,
  createRankBarOption,
} from '@/utils/chartOptions'

const REGION_ICONS = [Location, MapLocation, OfficeBuilding, Flag]
const REGION_COLORS = ['#4f7cff', '#22c1a4', '#9b5de5', '#ffb020']
const DEGREE_ROWS = [
  { name: '博士', key: 'doctor', color: '#9b5de5' },
  { name: '硕士', key: 'master', color: '#4f7cff' },
  { name: '本科', key: 'bachelor', color: '#22c1a4' },
  { name: '专科', key: 'college', color: '#ffb020' },
]

const { data, loading } = useAnalysisData(fetchRegion, {
  scope: '全部学历',
  regions: [],
  cities: [],
  wages: [],
})

const kpiRegions = computed(() =>
  (data.value?.regions || []).map((item) => ({ name: item.name, value: item.selected })),
)

const regionOption = computed(() =>
  createRankBarOption({
    data: kpiRegions.value,
    color: ['#8fb0ff', '#4f7cff'],
    unit: '%',
  }),
)

const degreeOption = computed(() => {
  const regions = data.value?.regions || []
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => `${v}%` },
    legend: { top: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { color: '#5c6b8a', fontSize: 12 } },
    grid: { ...BASE_GRID, top: 44 },
    xAxis: categoryAxis({ data: regions.map((r) => r.name) }),
    yAxis: valueAxis({ name: '%', axisLabel: { color: '#8a97b1', fontSize: 12, formatter: '{value}%' } }),
    series: DEGREE_ROWS.map((row) => ({
      name: row.name,
      type: 'bar',
      barWidth: 16,
      itemStyle: { borderRadius: [5, 5, 0, 0], color: row.color },
      data: regions.map((r) => r[row.key] ?? 0),
    })),
  }
})

const cityOption = computed(() =>
  createRankBarOption({
    data: (data.value?.cities || []).map((c) => ({ name: c.name, value: c.share })),
    color: ['#7ee0cd', '#22c1a4'],
    unit: '%',
  }),
)

const wageOption = computed(() => {
  const list = data.value?.wages || []
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
        itemStyle: { borderRadius: [6, 6, 0, 0], color: barGradientH('#c8b4ff', '#9b5de5') },
        label: { show: true, position: 'top', color: '#5c6b8a', fontSize: 11 },
        data: list.map((d) => toWan(d.nonPrivate)),
      },
      {
        name: '私营单位',
        type: 'bar',
        barWidth: 26,
        itemStyle: { borderRadius: [6, 6, 0, 0], color: barGradientH('#7ee0cd', '#22c1a4') },
        label: { show: true, position: 'top', color: '#5c6b8a', fontSize: 11 },
        data: list.map((d) => toWan(d.private)),
      },
    ],
  }
})
</script>
