<template>
  <div class="page">
    <div class="grid grid--kpi">
      <StatCard label="首选就业省份" :value="topProvinceValue" suffix="人" :icon="Location" color="#4f7cff" :foot="stats.topProvince" />
      <StatCard label="首选就业城市" :value="topCityValue" suffix="人" :icon="MapLocation" color="#22c1a4" :foot="stats.topCity" />
      <StatCard label="一线城市占比" :value="firstTierRate" suffix="%" :icon="OfficeBuilding" color="#ffb020" :digits="1" foot="北京 / 上海 / 广州 / 深圳" />
      <StatCard label="流向省份数" :value="provinceCount" suffix="个" :icon="Flag" color="#9b5de5" />
    </div>

    <div class="grid grid--2">
      <ChartPanel title="就业省份流向 TOP" hint="按就业人数排序的省份分布" :loading="loading">
        <BaseChart :option="provinceOption" height="420px" />
      </ChartPanel>

      <ChartPanel title="就业城市流向 TOP12" hint="重点城市对毕业生的吸纳能力" :loading="loading">
        <BaseChart :option="cityOption" height="420px" />
      </ChartPanel>
    </div>

    <div class="grid grid--2">
      <ChartPanel title="城市等级分布" hint="一线 / 新一线 / 二线 / 其他城市的就业占比" :loading="loading">
        <BaseChart :option="tierOption" height="320px" />
      </ChartPanel>

      <ChartPanel title="各省份平均月薪" hint="反映不同地域的薪酬水平差异" :loading="loading">
        <BaseChart :option="salaryOption" height="320px" />
      </ChartPanel>
    </div>

    <ChartPanel title="重点省份流向概览" hint="省份主要吸纳城市及平均月薪" :loading="loading">
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="name" label="省份" min-width="110" />
        <el-table-column prop="value" label="就业人数" min-width="110" sortable>
          <template #default="{ row }">{{ formatNumber(row.value) }} 人</template>
        </el-table-column>
        <el-table-column prop="topCity" label="主要吸纳城市" min-width="130" />
        <el-table-column prop="avgSalary" label="平均月薪" min-width="130" sortable>
          <template #default="{ row }">{{ formatNumber(row.avgSalary) }} 元</template>
        </el-table-column>
      </el-table>
    </ChartPanel>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Location, MapLocation, OfficeBuilding, Flag } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import ChartPanel from '@/components/ChartPanel.vue'
import BaseChart from '@/components/BaseChart.vue'
import { fetchRegion } from '@/api/employment'
import { useAnalysisData } from '@/composables/useAnalysisData'
import { formatNumber } from '@/utils/format'
import { categoryAxis, valueAxis, barGradientH, createRankBarOption } from '@/utils/chartOptions'

const { data: stats, loading } = useAnalysisData(fetchRegion, {
  provinceRank: [],
  cityRank: [],
  cityTier: [],
  provinceSalary: [],
  byProvinceTopCity: [],
})

const topProvinceValue = computed(() => stats.value?.provinceRank?.[0]?.value || 0)
const topCityValue = computed(() => stats.value?.cityRank?.[0]?.value || 0)
const provinceCount = computed(() => stats.value?.provinceRank?.length || 0)

const firstTierRate = computed(() => {
  const list = stats.value?.cityTier || []
  const total = list.reduce((sum, d) => sum + d.value, 0)
  if (!total) return 0
  const first = list.find((d) => d.name === '一线')?.value || 0
  return Number(((first / total) * 100).toFixed(1))
})

const provinceOption = computed(() =>
  createRankBarOption({ data: stats.value?.provinceRank || [], unit: '人' }),
)

const cityOption = computed(() =>
  createRankBarOption({ data: stats.value?.cityRank || [], color: ['#7ee0cd', '#22c1a4'], unit: '人' }),
)

const tierOption = computed(() => {
  const list = stats.value?.cityTier || []
  return {
    tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 人 ({d}%)' },
    legend: { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { color: '#5c6b8a', fontSize: 12 } },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '46%'],
        itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 6 },
        label: { formatter: '{b}\n{d}%', color: '#4a5878', fontSize: 11 },
        labelLine: { length: 8, length2: 6 },
        data: list,
      },
    ],
  }
})

const salaryOption = computed(() => {
  const list = [...(stats.value?.provinceSalary || [])].sort((a, b) => a.value - b.value)
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}<br/>平均月薪 {c} 元' },
    grid: { left: 8, right: 48, top: 12, bottom: 8, containLabel: true },
    xAxis: valueAxis({ show: false }),
    yAxis: categoryAxis({ data: list.map((d) => d.name), axisLabel: { color: '#8a97b1', fontSize: 12, width: 70, overflow: 'truncate' } }),
    series: [
      {
        type: 'bar',
        barWidth: 12,
        showBackground: true,
        backgroundStyle: { color: '#f4f6fb', borderRadius: 8 },
        itemStyle: { borderRadius: 8, color: barGradientH('#c8b4ff', '#9b5de5') },
        label: { show: true, position: 'right', color: '#5c6b8a', fontSize: 11, formatter: '{c} 元' },
        data: list.map((d) => d.value),
      },
    ],
  }
})

const tableData = computed(() =>
  (stats.value?.byProvinceTopCity || []).map((item) => {
    const salary = (stats.value?.provinceSalary || []).find((s) => s.name === item.name)
    return { ...item, avgSalary: salary?.value || 0 }
  }),
)
</script>
