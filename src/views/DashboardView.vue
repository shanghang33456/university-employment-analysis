<template>
  <div class="page">
    <div class="page__hint">
      <el-icon><InfoFilled /></el-icon>
      <span>
        当前范围：{{ filterSummary }}，共 {{ formatNumber(overview?.graduates || 0) }} 名毕业生；
        数据为 2025 届广西普通高校<strong>汇总统计</strong>，非个体明细
      </span>
    </div>

    <SourceNote :ids="['S1', 'S3', 'S4']" note="落实率与去向来自 S1，行业与战略地区为已就业毕业生的交叉统计" />

    <!-- KPI -->
    <div class="grid grid--kpi">
      <StatCard
        label="毕业生总数"
        :value="overview?.graduates || 0"
        suffix="人"
        :icon="User"
        color="#4f7cff"
        :foot="`2025 届 · ${overview?.scope || '全部学历'}`"
      />
      <StatCard
        label="毕业去向落实率"
        :value="overview?.fulfillRate || 0"
        suffix="%"
        :icon="CircleCheck"
        color="#22c1a4"
        :digits="2"
        :foot="`已落实 ${formatNumber(overview?.fulfilled || 0)} 人`"
      />
      <StatCard
        label="单位就业占比"
        :value="overview?.employedRate || 0"
        suffix="%"
        :icon="Suitcase"
        color="#00bbf9"
        :digits="1"
        foot="签约 / 合同 / 其他录用等"
      />
      <StatCard
        label="升学率"
        :value="overview?.furtherStudyRate || 0"
        suffix="%"
        :icon="Reading"
        color="#9b5de5"
        :digits="1"
        foot="境内升学 + 境外留学"
      />
      <StatCard
        label="第一大就业行业"
        :value="overview?.industryTop?.[0]?.value || 0"
        suffix="%"
        :icon="TrendCharts"
        color="#ffb020"
        :digits="1"
        :foot="overview?.topIndustry || '—'"
      />
    </div>

    <!-- 分学历落实率 + 去向结构 -->
    <div class="grid grid--2-1">
      <ChartPanel
        title="分学历毕业去向落实率"
        hint="公开报告中唯一可按学历完整拆分的核心指标，含毕业人数与落实人数"
        :loading="loading"
      >
        <BaseChart :option="degreeRateOption" height="320px" />
      </ChartPanel>

      <ChartPanel title="毕业去向结构" hint="六类去向占毕业生总数的比例" :loading="loading">
        <BaseChart :option="destinationOption" height="320px" />
      </ChartPanel>
    </div>

    <!-- 行业 + 单位性质 -->
    <div class="grid grid--2">
      <ChartPanel title="就业行业 TOP8" hint="占已就业毕业生的比例，来自 S3 行业 × 学历交叉表" :loading="loading">
        <BaseChart :option="industryOption" height="300px" />
      </ChartPanel>

      <ChartPanel title="用人单位性质 TOP6" hint="占已就业毕业生的比例，来自 S1 表 1-12" :loading="loading">
        <BaseChart :option="companyOption" height="300px" />
      </ChartPanel>
    </div>

    <!-- 战略地区 + 洞察 -->
    <div class="grid grid--2">
      <ChartPanel
        title="国家战略地区流向"
        hint="四类战略区域存在交叉（一个就业地可能同时属于多个区域），占比相加会超过 100%"
        :loading="loading"
      >
        <BaseChart :option="regionOption" height="300px" />
      </ChartPanel>

      <ChartPanel title="数据洞察" hint="基于公开汇总指标自动生成，不包含个体推断" :loading="loading">
        <ul class="insights">
          <li v-for="(item, index) in insights" :key="index">
            <span class="insights__index">{{ index + 1 }}</span>
            <span v-html="item"></span>
          </li>
        </ul>
      </ChartPanel>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { InfoFilled, User, CircleCheck, Suitcase, Reading, TrendCharts } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import ChartPanel from '@/components/ChartPanel.vue'
import BaseChart from '@/components/BaseChart.vue'
import SourceNote from '@/components/SourceNote.vue'
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
  year: 2025,
  scope: '全部学历',
  graduates: 0,
  fulfilled: 0,
  fulfillRate: 0,
  employedRate: 0,
  furtherStudyRate: 0,
  degreeRows: [],
  destination: [],
  industryTop: [],
  companyTop: [],
  regionTop: [],
})

const filterSummary = computed(() => `2025 届 · 广西 · ${filterStore.filters.degree === 'all' ? '全部学历' : filterStore.filters.degree}`)

/** 分学历落实率 */
const degreeRateOption = computed(() => {
  const rows = overview.value?.degreeRows || []
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const row = rows[params[0].dataIndex]
        if (!row) return ''
        return `${row.name}<br/>落实率 ${row.rate}%<br/>毕业 ${formatNumber(row.graduates)} 人<br/>落实 ${formatNumber(row.fulfilled)} 人`
      },
    },
    grid: { ...BASE_GRID, top: 28 },
    xAxis: categoryAxis({ data: rows.map((r) => r.name) }),
    yAxis: valueAxis({ max: 100, axisLabel: { color: '#8a97b1', fontSize: 12, formatter: '{value}%' } }),
    series: [
      {
        type: 'bar',
        barWidth: 46,
        itemStyle: { borderRadius: [8, 8, 0, 0], color: barGradient('#8fb0ff', '#4f7cff') },
        label: { show: true, position: 'top', color: '#5c6b8a', fontSize: 12, formatter: '{c}%' },
        data: rows.map((r) => r.rate),
      },
    ],
  }
})

const destinationOption = computed(() =>
  createDonutOption({
    data: (overview.value?.destination || []).map((d) => ({ name: d.name, value: d.share })),
    unit: '%',
    centerLabel: '去向\n结构',
  }),
)

const industryOption = computed(() =>
  createRankBarOption({ data: overview.value?.industryTop || [], unit: '%' }),
)

const companyOption = computed(() =>
  createDonutOption({
    data: (overview.value?.companyTop || []).map((d) => ({ name: d.name, value: d.value })),
    unit: '%',
    centerLabel: '单位\n性质',
    radius: ['44%', '70%'],
  }),
)

const regionOption = computed(() =>
  createRankBarOption({
    data: overview.value?.regionTop || [],
    color: ['#7ee0cd', '#22c1a4'],
    unit: '%',
  }),
)

const insights = computed(() => {
  const o = overview.value
  if (!o?.graduates) return ['数据加载中…']
  const list = []
  list.push(
    `2025 届广西普通高校毕业生共 <b>${formatNumber(o.graduates)}</b> 人，毕业去向落实率 <b>${o.fulfillRate}%</b>，其中单位就业占 <b>${o.employedRate}%</b>、升学占 <b>${o.furtherStudyRate}%</b>。`,
  )
  const rows = [...(o.degreeRows || [])].sort((a, b) => b.rate - a.rate)
  if (rows.length) {
    list.push(
      `学历越高落实率越高：<b>${rows[0].name}</b> 达 <b>${rows[0].rate}%</b>，最低为 <b>${rows[rows.length - 1].name} ${rows[rows.length - 1].rate}%</b>。`,
    )
  }
  if (o.topIndustry) {
    list.push(
      `行业流向首选 <b>${o.topIndustry}</b>（${o.industryTop[0].value}%），用人单位以 <b>${o.topCompany}</b> 为主（${o.companyTop[0].value}%）。`,
    )
  }
  if (o.topRegion) {
    list.push(
      `从国家战略地区看，<b>${o.topRegion}</b> 吸纳最多（${o.regionTop[0].value}%）；四类区域存在交叉，合计超过 100%，不宜直接相加。`,
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
