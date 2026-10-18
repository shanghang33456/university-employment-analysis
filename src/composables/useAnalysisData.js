import { computed, ref, watch } from 'vue'
import { useAppStore } from '@/store/app'
import { useFilterStore } from '@/store/filter'

/**
 * 分析页数据获取组合式函数
 * ------------------------------------------------------------------
 * 统一处理：全局筛选变化时自动重新请求、全局刷新信号、loading 状态、
 * 以及竞态保护（后发请求覆盖先发请求的结果）。
 *
 * @param {(params: object) => Promise<any>} fetcher 接口方法
 * @param {*} initial 初始数据
 */
export function useAnalysisData(fetcher, initial = null) {
  const filterStore = useFilterStore()
  const appStore = useAppStore()

  const data = ref(initial)
  const loading = ref(false)
  let requestSeq = 0

  // 用序列化的筛选条件作为依赖，避免深层对象比较的开销
  const paramsKey = computed(() => JSON.stringify(filterStore.query))
  const refreshKey = computed(() => appStore.refreshKey)

  async function load() {
    const seq = ++requestSeq
    loading.value = true
    try {
      const result = await fetcher({ ...filterStore.query })
      if (seq === requestSeq) data.value = result
    } catch (error) {
      if (error?.code !== 'ERR_CANCELED') {
        console.error('[useAnalysisData] 数据加载失败:', error)
      }
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  watch([paramsKey, refreshKey], load, { immediate: true })

  return { data, loading, reload: load }
}
