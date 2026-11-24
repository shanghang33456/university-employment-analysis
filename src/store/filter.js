import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { fetchFilterOptions } from '@/api/employment'

/** 默认筛选条件：'all' 表示不限 */
const defaultFilters = () => ({
  degree: 'all',
})

/**
 * 全局筛选状态
 * ------------------------------------------------------------------
 * 公开就业数据只到汇总级别，学历是唯一贯穿
 * 「去向 / 行业 / 单位性质 / 战略地区」全部交叉表的维度，
 * 因此全局筛选只保留学历一项，各页面共享同一状态实现联动。
 */
export const useFilterStore = defineStore('filter', () => {
  const options = reactive({
    degrees: [],
  })
  const filters = reactive(defaultFilters())
  const loading = ref(false)
  const loaded = ref(false)

  const query = computed(() => ({ ...filters }))

  /** 已选条件数量，用于 UI 提示 */
  const activeCount = computed(() => Object.values(filters).filter((v) => v !== 'all').length)

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

  return { options, filters, loading, loaded, query, activeCount, loadOptions, reset }
})
