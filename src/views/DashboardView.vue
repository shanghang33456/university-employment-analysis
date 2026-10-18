<template>
  <div class="page">
    <div class="page__hint">
      <el-icon><InfoFilled /></el-icon>
      <span>当前分析范围：{{ filterSummary }}，共 {{ formatNumber(overview?.total || 0) }} 名毕业生样本</span>
    </div>

    <!-- KPI -->
    <div class="grid grid--kpi">
      <StatCard
        label="毕业生总数"
        :value="overview?.total || 0"
        suffix="人"
        :icon="User"
        color="#4f7cff"
        foot="当前筛选范围内样本量"
      />
      <StatCard
        label="毕业去向落实率"
        :value="overview?.fulfillRate || 0"
        suffix="%"
        :icon="CircleCheck"
        color="#22c1a4"
        :digits="1"
        :foot="`已落实 ${formatNumber(overview?.employed || 0)} 人`"
      />
      <StatCard
        label="平均月薪"
        :value="overview?.avgSalary || 0"
        suffix="元"
        :icon="Money"
        color="#ffb020"
        foot="签约就业 & 灵活就业"
      />
      <StatCard
        label="升学率"
        :value="overview?.furtherStudyRate || 0"
        suffix="%"
        :icon="Reading"
        color="#9b5de5"
        :digits="1"
        foot="国内升学 + 出国出境"
      />
      <StatCard
        label="热门就业行业"
        :value="topIndustryValue"
        :icon="TrendCharts"
        color="#00bbf9"
        :foot="overview?.topIndustry || '—'"
      />
    </div>

    <!-- 趋势 + 去向结构 -->
    <div class="grid grid--2-1">
      <ChartPanel
        title="近五年毕业去向趋势"
        hint="毕业生规模、去向落实率与平均月薪的年度变化（不受年份筛选影响）"
        :loading="loading"
      >
        <BaseChart :option="trendOption" height="320px" />
      </ChartPanel>

      <ChartPanel title="毕业去向结构" hint="签约就业 / 升学 / 出国 / 灵活就业 / 待就业占比" :loading="loading">
        <BaseChart :option="destinationOption" height="320px" />
      </ChartPanel>
    </div>

    <!-- 行业 + 企业类型 -->
    <div class="grid grid--2">
      <ChartPanel title="热门就业行业 TOP6" hint="按签约就业人数排名" :loading="loading">
        <BaseChart :option="industryOption" height="300px" />
      </ChartPanel>

      <ChartPanel title="用人单位类型分布" hint="不同性质单位的就业人数占比" :loading="loading">
        <BaseChart :option="companyOption" height="300px" />
      </ChartPanel>
    </div>

    <!-- 关键结论 -->
    <ChartPanel title="数据洞察" hint="基于当前筛选条件自动生成的关键结论" :loading="loading">
      <ul class="insights">
        <li v-for="(item, index) in insights" :key="index">
          <span class="insights__index">{{ index + 1 }}</span>
          <span v-html="item"></span>
        </li>
      </ul>
    </ChartPanel>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  InfoFilled,
  User,
  CircleCheck,
  Money,
  Reading,
  TrendCharts,
} from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import ChartPanel from '@/components/ChartPanel.vue'
import BaseChart from '@/components/BaseChart.vue'
import { fetchOverview } from '@/api/employment'
import { useAnalysisData } from '@/composables/useAnalysisData'
import { useFilterStore } from '@/store/filter'
import { formatNumber } from '@/utils/format'
import {
  BASE_GRID,
  categoryAxis,
  valueAxis,
  barGradient,
  createDonutOption,
  createRankBarOption,
} from '@/utils/chartOptions'

const filterStore = useFilterStore()
const { data: overview, loading } = useAnalysisData(fetchOverview, {
  total: 0,
  employed: 0,
  fulfillRate: 0,
  furtherStudyRate: 0,
  avgSalary: 0,
  trend: [],
  destination: [],
  industryTop: [],
  companyTop: [],
})

/** 当前筛选范围的中文描述 */
const filterSummary = computed(() => {
  const f = filterStore.filters
  const parts = []
  parts.push(f.year === 'all' ? '全部年份' : `${f.year} 届`)
  if (f.college !== 'all') parts.push(f.college)
  if (f.degree !== 'all') parts.push(f.degree)
  if (f.major !== 'all') parts.push(f.major)
  if (f.province !== 'all') parts.push(`${f.province}就业`)
  return parts.join(' · ')
})

const topIndustryValue = computed(() => overview.value?.industryTop?.[0]?.value || 0)

/** 趋势：柱状（人数）+ 折线（落实率）+ 折线（薪资） */
const trendOption = computed(() => {
  const trend = overview.value?.trend || []
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      top: 0,
      right: 0,
      icon: 'roundRect',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#5c6b8a', fontSize: 12 },
    },
    grid: { ...BASE_GRID, top: 46 },
    xAxis: categoryAxis({ data: trend.map((t) => `${t.year} 届`) }),
    yAxis: [
      valueAxis({ name: '人数' }),
      valueAxis({
        name: '落实率(%) / 月薪(元)',
        splitLine: { show: false },
        axisLabel: { ...{ color: '#8a97b1', fontSize: 12 } },
      }),
    ],
    series: [
      {
        name: '毕业生人数',
        type: 'bar',
        barWidth: 22,
        itemStyle: { borderRadius: [6, 6, 0, 0], color: barGradient('#8fb0ff', '#4f7cff') },
        data: trend.map((t) => t.graduates),
      },
      {
        name: '去向落实率',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        symbolSize: 7,
        lineStyle: { width: 3, color: '#22c1a4' },
        itemStyle: { color: '#22c1a4' },
        data: trend.map((t) => t.fulfillRate),
      },
      {
        name: '平均月薪',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        symbolSize: 7,
        lineStyle: { width: 3, color: '#ffb020', type: 'dashed' },
        itemStyle: { color: '#ffb020' },
        data: trend.map((t) => t.avgSalary),
      },
    ],
  }
})

const destinationOption = computed(() =>
  createDonutOption({
    data: (overview.value?.destination || []).map((d) => ({ name: d.name, value: d.value })),
    centerLabel: '去向\n结构',
  }),
)

const industryOption = computed(() =>
  createRankBarOption({ data: overview.value?.industryTop || [], unit: '人' }),
)

const companyOption = computed(() =>
  createDonutOption({
    data: overview.value?.companyTop || [],
    centerLabel: '单位\n性质',
    radius: ['44%', '70%'],
  }),
)

/** 基于数据自动生成的结论，体现「数据映射 -> 业务解读」 */
const insights = computed(() => {
  const o = overview.value
  if (!o?.total) return ['当前筛选条件下暂无数据，请调整筛选范围。']
  const list = []
  list.push(
    `当前范围共 <b>${formatNumber(o.total)}</b> 名毕业生，毕业去向落实率为 <b>${o.fulfillRate}%</b>，其中升学（含出国）占比 <b>${o.furtherStudyRate}%</b>。`,
  )
  list.push(
    `就业行业集中在 <b>${o.topIndustry}</b>，用人单位以 <b>${o.topCompanyType}</b> 为主。`,
  )
  list.push(
    `签约与灵活就业毕业生的平均月薪为 <b>${formatNumber(o.avgSalary)} 元</b>，就业地域首选 <b>${o.topProvince}</b>。`,
  )
  const trend = o.trend || []
  if (trend.length >= 2) {
    const first = trend[0]
    const last = trend[trend.length - 1]
    const salaryGrowth = first.avgSalary ? ((last.avgSalary - first.avgSalary) / first.avgSalary) * 100 : 0
    const direction = salaryGrowth >= 0 ? '上升' : '下降'
    list.push(
      `对比 ${first.year} 届，${last.year} 届平均月薪${direction} <b>${Math.abs(salaryGrowth).toFixed(1)}%</b>，去向落实率由 ${first.fulfillRate}% 变化至 <b>${last.fulfillRate}%</b>。`,
    )
  }
  return list
})
</script>

<style scoped>
.insights {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.insights li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  font-size: 13.5px;
  line-height: 1.7;
  color: #4a5878;
  background: #f8faff;
  border-radius: 10px;
}

.insights li :deep(b) {
  color: var(--brand-primary);
}

.insights__index {
  display: grid;
  place-items: center;
  flex: none;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f7cff, #22c1a4);
}
</style>
