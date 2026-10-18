import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { fetchFilterOptions } from '@/api/employment'

/** 默认筛选条件：'all' 表示不限 */
const defaultFilters = () => ({
  year: 'all',
  college: 'all',
  degree: 'all',
  major: 'all',
  province: 'all',
  industry: 'all',
  companyType: 'all',
})

/**
 * 全局筛选状态
 * ------------------------------------------------------------------
 * 各分析页共享同一套筛选条件，实现「一处筛选、全站联动」，
 * 同时把筛选项缓存到 store，避免每个页面重复请求。
 */
export const useFilterStore = defineStore('filter', () => {
  const options = reactive({
    years: [],
    colleges: [],
    degrees: [],
    majors: [],
    majorsByCollege: {},
    destinations: [],
    industries: [],
    companyTypes: [],
    provinces: [],
  })
  const filters = reactive(defaultFilters())
  const loading = ref(false)
  const loaded = ref(false)

  /** 当前筛选条件（去掉 'all'，供接口使用） */
  const query = computed(() => ({ ...filters }))

  /** 已选条件的数量，用于 UI 提示 */
  const activeCount = computed(
    () => Object.values(filters).filter((v) => v !== 'all').length,
  )

  /** 按学院联动过滤可选专业 */
  const availableMajors = computed(() => {
    if (filters.college === 'all') return options.majors
    return options.majorsByCollege[filters.college] || []
  })

  async function loadOptions() {
    if (loaded.value) return
    loading.value = true
    try {
      const data = await fetchFilterOptions()
      Object.assign(options, data)
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  function reset() {
    Object.assign(filters, defaultFilters())
  }

  /** 学院变化时重置不匹配的专业 */
  function syncMajorScope() {
    if (filters.major === 'all') return
    if (!availableMajors.value.includes(filters.major)) filters.major = 'all'
  }

  return {
    options,
    filters,
    loading,
    loaded,
    query,
    activeCount,
    availableMajors,
    loadOptions,
    reset,
    syncMajorScope,
  }
})
