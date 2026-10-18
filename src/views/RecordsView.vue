<template>
  <div class="page">
    <ChartPanel title="毕业生就业明细" hint="支持按全局筛选条件查询，并按列排序、分页浏览" :loading="loading">
      <template #extra>
        <el-input
          v-model="keyword"
          class="records__search"
          placeholder="搜索学院 / 专业 / 城市"
          :prefix-icon="Search"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button :icon="Search" @click="handleSearch">查询</el-button>
        <el-button :icon="Download" type="primary" plain :loading="exporting" @click="exportCsv">
          导出 CSV
        </el-button>
      </template>

      <el-table
        :data="list"
        stripe
        height="520"
        style="width: 100%"
        @sort-change="handleSort"
      >
        <el-table-column prop="year" label="届别" width="90" sortable>
          <template #default="{ row }">{{ row.year }} 届</template>
        </el-table-column>
        <el-table-column prop="college" label="学院" min-width="130" />
        <el-table-column prop="major" label="专业" min-width="170" />
        <el-table-column prop="degree" label="学历" width="90" />
        <el-table-column prop="destination" label="毕业去向" width="120">
          <template #default="{ row }">
            <el-tag :type="tagType(row.destination)" effect="light" size="small" round>
              {{ row.destination }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="industry" label="行业" min-width="130">
          <template #default="{ row }">{{ row.industry || '—' }}</template>
        </el-table-column>
        <el-table-column prop="companyType" label="单位性质" min-width="120">
          <template #default="{ row }">{{ row.companyType || '—' }}</template>
        </el-table-column>
        <el-table-column prop="province" label="省份" width="100" />
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="salary" label="月薪(元)" width="120" sortable>
          <template #default="{ row }">
            <span v-if="row.salary">{{ formatNumber(row.salary) }}</span>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="records__footer">
        <span class="text-muted">共 {{ formatNumber(total) }} 条记录</span>
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="sizes, prev, pager, next, jumper"
          background
          @current-change="load"
          @size-change="handleSizeChange"
        />
      </div>
    </ChartPanel>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { Search, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ChartPanel from '@/components/ChartPanel.vue'
import { fetchRecords } from '@/api/employment'
import { useFilterStore } from '@/store/filter'
import { useAppStore } from '@/store/app'
import { formatNumber } from '@/utils/format'

const filterStore = useFilterStore()
const appStore = useAppStore()

const loading = ref(false)
const exporting = ref(false)
const list = ref([])
const total = ref(0)
const keyword = ref('')
const pagination = reactive({ page: 1, pageSize: 10, sortField: '', sortOrder: '' })

const TAG_TYPE = {
  签约就业: 'success',
  国内升学: 'primary',
  出国出境: 'warning',
  灵活就业: 'info',
  自主创业: 'danger',
  待就业: 'danger',
}

function tagType(destination) {
  return TAG_TYPE[destination] || 'info'
}

async function load() {
  loading.value = true
  try {
    const res = await fetchRecords({
      ...filterStore.query,
      page: pagination.page,
      pageSize: pagination.pageSize,
      sortField: pagination.sortField,
      sortOrder: pagination.sortOrder,
      keyword: keyword.value,
    })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  load()
}

function handleSort({ prop, order }) {
  pagination.sortField = order ? prop : ''
  pagination.sortOrder = order || ''
  pagination.page = 1
  load()
}

function handleSizeChange() {
  pagination.page = 1
  load()
}

/** 导出当前筛选条件下的全部明细为 CSV */
async function exportCsv() {
  exporting.value = true
  try {
    const res = await fetchRecords({
      ...filterStore.query,
      keyword: keyword.value,
      page: 1,
      pageSize: 100000,
    })
    const headers = ['届别', '学院', '专业', '学历', '毕业去向', '行业', '单位性质', '省份', '城市', '月薪(元)']
    const rows = res.list.map((r) => [
      r.year,
      r.college,
      r.major,
      r.degree,
      r.destination,
      r.industry || '',
      r.companyType || '',
      r.province,
      r.city,
      r.salary || '',
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    // 加 BOM 防止 Excel 打开中文乱码
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `毕业生就业明细_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success(`已导出 ${res.list.length} 条记录`)
  } finally {
    exporting.value = false
  }
}

watch(
  () => ({ ...filterStore.filters }),
  () => {
    pagination.page = 1
    load()
  },
  { deep: true },
)

watch(
  () => appStore.refreshKey,
  () => load(),
)

onMounted(load)
</script>

<style scoped>
.records__search {
  width: 240px;
}

.records__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .records__search {
    width: 100%;
  }
}
</style>
