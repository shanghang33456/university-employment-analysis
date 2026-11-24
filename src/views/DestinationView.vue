<template>
  <div class="page">
    <div class="page__hint">
      <el-icon><InfoFilled /></el-icon>
      <span>
        毕业去向按「是否落实」与「落实形式」分类统计，当前范围：{{ data?.scope || '全部学历' }}；
        占比分母为毕业生总数
      </span>
    </div>

    <SourceNote :ids="['S1']" note="去向往来取自 2025 届广西高校毕业生就业质量年度报告表 1-11" />

    <div class="grid grid--kpi">
      <StatCard label="单位就业占比" :value="shareOf('单位就业')" suffix="%" :icon="Suitcase" color="#4f7cff" :digits="1" foot="含签约 / 合同 / 其他录用等" />
      <StatCard label="升学占比" :value="shareOf('升学')" suffix="%" :icon="Reading" color="#9b5de5" :digits="1" foot="境内升学 + 境外留学" />
      <StatCard label="待就业占比" :value="shareOf('待就业')" suffix="%" :icon="Warning" color="#ff6b81" :digits="1" foot="未落实去向" />
      <StatCard label="灵活就业与创业" :value="flexRate" suffix="%" :icon="TrendCharts" color="#22c1a4" :digits="1" foot="自由职业 + 自主创业" />
    </div>

    <div class="grid grid--2-1">
      <ChartPanel title="分学历毕业去向结构" hint="各学历内部构成，每列合计 100%" :loading="loading">
        <BaseChart :option="degreeStackOption" height="360px" />
      </ChartPanel>

      <ChartPanel title="整体去向结构" hint="六类去向占毕业生总数的比例" :loading="loading">
        <BaseChart :option="distributionOption" height="360px" />
      </ChartPanel>
    </div>

    <div class="grid grid--2">
      <ChartPanel title="学历结构" hint="各学历毕业生占毕业生总数的比例" :loading="loading">
        <BaseChart :option="degreeShareOption" height="320px" />
      </ChartPanel>

      <ChartPanel title="单位就业内部构成" hint="签协议 / 签合同 / 其他录用 / 基层项目等形式占比" :loading="loading">
        <BaseChart :option="employedDetailOption" height="320px" />
      </ChartPanel>
    </div>

    <ChartPanel title="毕业去向明细（分学历占比）" hint="百分比分母为各学历毕业生总数；总体列分母为全部毕业生" :loading="loading">
      <el-table :data="details" stripe style="width: 100%">
        <el-table-column prop="name" label="毕业去向" min-width="180" />
        <el-table-column prop="group" label="大类" width="110">
          <template #default="{ row }">
            <el-tag size="small" effect="plain" round>{{ row.group }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="博士" width="88" align="right">
          <template #default="{ row }">{{ row.doctor.toFixed(2) }}%</template>
        </el-table-column>
        <el-table-column label="硕士" width="88" align="right">
          <template #default="{ row }">{{ row.master.toFixed(2) }}%</template>
        </el-table-column>
        <el-table-column label="本科" width="88" align="right">
          <template #default="{ row }">{{ row.bachelor.toFixed(2) }}%</template>
        </el-table-column>
        <el-table-column label="专科" width="88" align="right">
          <template #default="{ row }">{{ row.college.toFixed(2) }}%</template>
        </el-table-column>
        <el-table-column label="总体" width="88" align="right">
          <template #default="{ row }">{{ row.share.toFixed(2) }}%</template>
        </el-table-column>
      </el-table>
    </ChartPanel>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { InfoFilled, Suitcase, Reading, Warning, TrendCharts } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import ChartPanel from '@/components/ChartPanel.vue'
import BaseChart from '@/components/BaseChart.vue'
import SourceNote from '@/components/SourceNote.vue'
import { fetchDestination } from '@/api/employment'
import { useAnalysisData } from '@/composables/useAnalysisData'
import { BASE_GRID, categoryAxis, valueAxis, barGradient, createDonutOption } from '@/utils/chartOptions'

const GROUP_COLORS = {
  单位就业: '#4f7cff',
  升学: '#9b5de5',
  待就业: '#ff6b81',
  自由职业: '#22c1a4',
  自主创业: '#ffb020',
  暂不就业: '#c3cde2',
}

const { data, loading } = useAnalysisData(fetchDestination, {
  scope: '全部学历',
  graduates: 0,
  degrees: [],
  groups: [],
  details: [],
})

const details = computed(() => data.value?.details || [])

function shareOf(groupName) {
  return (data.value?.groups || []).find((g) => g.name === groupName)?.selected || 0
}

const flexRate = computed(() => {
  const groups = data.value?.groups || []
  const free = groups.find((g) => g.name === '自由职业')?.selected || 0
  const startup = groups.find((g) => g.name === '自主创业')?.selected || 0
  return Number((free + startup).toFixed(1))
})

/** 分学历 100% 堆叠 */
const degreeStackOption = computed(() => {
  const groups = data.value?.groups || []
  const degrees = data.value?.degrees || []
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => `${v}%` },
    legend: { top: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { color: '#5c6b8a', fontSize: 12 } },
    grid: { ...BASE_GRID, top: 44 },
    xAxis: categoryAxis({ data: degrees.map((d) => d.name) }),
    yAxis: valueAxis({ max: 100, axisLabel: { color: '#8a97b1', fontSize: 12, formatter: '{value}%' } }),
    series: groups.map((group, index) => ({
      name: group.name,
      type: 'bar',
      stack: 'total',
      barWidth: '46%',
      itemStyle: {
        color: GROUP_COLORS[group.name] || '#4f7cff',
        borderRadius: index === groups.length - 1 ? [4, 4, 0, 0] : 0,
      },
      emphasis: { focus: 'series' },
      data: degrees.map((d) => group[degreeKey(d.name)] ?? 0),
    })),
  }
})

function degreeKey(name) {
  return { 博士: 'doctor', 硕士: 'master', 本科: 'bachelor', 专科: 'college' }[name]
}

const distributionOption = computed(() =>
  createDonutOption({
    data: (data.value?.groups || []).map((g) => ({ name: g.name, value: g.selected })),
    unit: '%',
    centerLabel: '去向\n分布',
    radius: ['42%', '68%'],
  }),
)

const degreeShareOption = computed(() =>
  createDonutOption({
    data: (data.value?.degrees || []).map((d) => ({ name: d.name, value: d.share })),
    unit: '%',
    centerLabel: '学历\n结构',
    radius: ['42%', '68%'],
  }),
)

/** 单位就业内部明细（签协议/合同/其他录用/基层项目等） */
const employedDetailOption = computed(() => {
  const list = details.value
    .filter((d) => d.group === '单位就业')
    .map((d) => ({ name: d.name, value: d.selected }))
    .sort((a, b) => a.value - b.value)
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}<br/>占毕业生 {c}%' },
    grid: { left: 8, right: 48, top: 12, bottom: 8, containLabel: true },
    xAxis: valueAxis({ show: false }),
    yAxis: categoryAxis({
      data: list.map((d) => d.name),
      axisLabel: { color: '#8a97b1', fontSize: 12, width: 120, overflow: 'truncate' },
    }),
    series: [
      {
        type: 'bar',
        barWidth: 13,
        showBackground: true,
        backgroundStyle: { color: '#f4f6fb', borderRadius: 8 },
        itemStyle: { borderRadius: 8, color: barGradient('#8fb0ff', '#4f7cff') },
        label: { show: true, position: 'right', color: '#5c6b8a', fontSize: 11, formatter: '{c}%' },
        data: list.map((d) => d.value),
      },
    ],
  }
})
</script>
