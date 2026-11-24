<template>
  <div class="page">
    <div class="page__hint">
      <el-icon><InfoFilled /></el-icon>
      <span>
        本页为<strong>城镇单位就业人员工资</strong>与<strong>毕业生起薪参照</strong>两套独立口径；
        前者统计城镇法人单位在岗人员，后者为抽样调查的应届生月收入，二者不可直接比较
      </span>
    </div>

    <SourceNote :ids="['S2', 'S6']" note="工资为国家统计局 2025 年发布数据；起薪为麦可思抽样调查，仅作参照" />

    <div class="grid grid--kpi">
      <StatCard
        label="全国城镇非私营单位"
        :value="toWan(national?.nonPrivate?.value)"
        suffix="万元/年"
        :icon="Money"
        color="#4f7cff"
        :digits="1"
        :foot="`同比 +${national?.nonPrivate?.growth || 0}%`"
      />
      <StatCard
        label="全国城镇私营单位"
        :value="toWan(national?.private?.value)"
        suffix="万元/年"
        :icon="OfficeBuilding"
        color="#22c1a4"
        :digits="1"
        :foot="`同比 +${national?.private?.growth || 0}%`"
      />
      <StatCard
        label="规模以上企业"
        :value="toWan(national?.largeScale?.value)"
        suffix="万元/年"
        :icon="Histogram"
        color="#9b5de5"
        :digits="1"
        :foot="`同比 +${national?.largeScale?.growth || 0}%`"
      />
      <StatCard
        label="本科毕业生起薪"
        :value="startSalary?.[0]?.value || 0"
        suffix="元/月"
        :icon="User"
        color="#ffb020"
        foot="毕业半年后税前月收入"
      />
    </div>

    <div class="grid grid--2">
      <ChartPanel
        title="分行业年平均工资 TOP12"
        hint="城镇单位就业人员税前年平均工资，单位：万元/年"
        :loading="loading"
      >
        <template #extra>
          <el-radio-group v-model="metric" size="small">
            <el-radio-button value="nonPrivate">非私营</el-radio-button>
            <el-radio-button value="private">私营</el-radio-button>
            <el-radio-button value="largeScale">规模以上</el-radio-button>
          </el-radio-group>
        </template>
        <BaseChart :option="industryOption" height="420px" />
      </ChartPanel>

      <ChartPanel title="分区域年平均工资" hint="东部 / 中部 / 西部 / 东北，非私营与私营对比" :loading="loading">
        <BaseChart :option="regionOption" height="420px" />
      </ChartPanel>
    </div>

    <div class="grid grid--2">
      <ChartPanel title="分登记注册类型年平均工资" hint="内资 / 港澳台投资 / 外商投资" :loading="loading">
        <BaseChart :option="registrationOption" height="330px" />
      </ChartPanel>

      <ChartPanel title="行业工资增速（2024 → 2025）" hint="城镇非私营单位，红色为负增长" :loading="loading">
        <BaseChart :option="growthOption" height="330px" />
      </ChartPanel>
    </div>

    <ChartPanel
      title="毕业生起薪参照"
      hint="麦可思 2025 届全国应届毕业生毕业半年后税前月收入抽样均值，与左侧城镇单位工资口径不同"
      :loading="loading"
    >
      <BaseChart :option="startOption" height="260px" />
    </ChartPanel>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { InfoFilled, Money, OfficeBuilding, Histogram, User } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import ChartPanel from '@/components/ChartPanel.vue'
import BaseChart from '@/components/BaseChart.vue'
import SourceNote from '@/components/SourceNote.vue'
import { fetchSalary } from '@/api/employment'
import { useAnalysisData } from '@/composables/useAnalysisData'
import { BASE_GRID, categoryAxis, valueAxis, barGradient, barGradientH } from '@/utils/chartOptions'

const METRIC_LABEL = {
  nonPrivate: '非私营单位',
  private: '私营单位',
  largeScale: '规模以上企业',
}

const { data, loading } = useAnalysisData(fetchSalary, {
  industry: [],
  region: [],
  registration: [],
  national: null,
  startSalary: [],
})

const metric = ref('nonPrivate')

const national = computed(() => data.value?.national)
const startSalary = computed(() => data.value?.startSalary || [])

const toWan = (value) => (value == null ? 0 : Number((value / 10000).toFixed(1)))

const industryOption = computed(() => {
  const list = (data.value?.industry || [])
    .filter((d) => d[metric.value] != null)
    .slice(0, 12)
    .map((d) => ({ name: d.name, value: toWan(d[metric.value]) }))
    .sort((a, b) => a.value - b.value)

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => `${v} 万元/年` },
    grid: { left: 8, right: 52, top: 14, bottom: 8, containLabel: true },
    xAxis: valueAxis({ show: false }),
    yAxis: categoryAxis({
      data: list.map((d) => d.name),
      axisLabel: { color: '#8a97b1', fontSize: 12, width: 132, overflow: 'truncate' },
    }),
    series: [
      {
        name: METRIC_LABEL[metric.value],
        type: 'bar',
        barWidth: 14,
        showBackground: true,
        backgroundStyle: { color: '#f4f6fb', borderRadius: 8 },
        itemStyle: { borderRadius: 8, color: barGradientH('#8fb0ff', '#4f7cff') },
        label: { show: true, position: 'right', color: '#5c6b8a', fontSize: 11, formatter: '{c}万' },
        data: list.map((d) => d.value),
      },
    ],
  }
})

const regionOption = computed(() => {
  const list = data.value?.region || []
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
        barWidth: 22,
        itemStyle: { borderRadius: [6, 6, 0, 0], color: barGradient('#8fb0ff', '#4f7cff') },
        label: { show: true, position: 'top', color: '#5c6b8a', fontSize: 11 },
        data: list.map((d) => toWan(d.nonPrivate)),
      },
      {
        name: '私营单位',
        type: 'bar',
        barWidth: 22,
        itemStyle: { borderRadius: [6, 6, 0, 0], color: barGradient('#7ee0cd', '#22c1a4') },
        label: { show: true, position: 'top', color: '#5c6b8a', fontSize: 11 },
        data: list.map((d) => toWan(d.private)),
      },
    ],
  }
})

const registrationOption = computed(() => {
  const list = data.value?.registration || []
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
        itemStyle: { borderRadius: [6, 6, 0, 0], color: barGradient('#c8b4ff', '#9b5de5') },
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

const growthOption = computed(() => {
  const list = [...(data.value?.industry || [])].sort((a, b) => a.growth - b.growth)
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => `${v}%` },
    grid: { left: 8, right: 52, top: 14, bottom: 8, containLabel: true },
    xAxis: valueAxis({ axisLabel: { color: '#8a97b1', fontSize: 11, formatter: '{value}%' } }),
    yAxis: categoryAxis({
      data: list.map((d) => d.name),
      axisLabel: { color: '#8a97b1', fontSize: 11, width: 110, overflow: 'truncate' },
    }),
    series: [
      {
        type: 'bar',
        barWidth: 11,
        itemStyle: {
          borderRadius: 5,
          color: (params) => (params.value < 0 ? '#ff6b81' : '#22c1a4'),
        },
        label: { show: true, position: 'right', color: '#5c6b8a', fontSize: 10, formatter: '{c}%' },
        data: list.map((d) => d.growth),
      },
    ],
  }
})

const startOption = computed(() => {
  const list = startSalary.value
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => `${v} 元/月` },
    grid: { ...BASE_GRID, top: 28, bottom: 4 },
    xAxis: categoryAxis({ data: list.map((d) => d.name) }),
    yAxis: valueAxis({ name: '元/月' }),
    series: [
      {
        type: 'bar',
        barWidth: 54,
        itemStyle: { borderRadius: [8, 8, 0, 0], color: barGradient('#ffd08a', '#ffb020') },
        label: { show: true, position: 'top', color: '#5c6b8a', fontSize: 12, formatter: '{c} 元' },
        data: list.map((d) => d.value),
      },
    ],
  }
})
</script>
