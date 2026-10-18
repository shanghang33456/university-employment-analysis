import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import echarts from '@/utils/echarts'

/**
 * ECharts 容器组合式函数
 * ------------------------------------------------------------------
 * 负责实例的创建、响应式尺寸变化、销毁，以及 option 变更时的增量更新。
 * 页面只需提供容器 ref 与 option 计算属性即可，避免重复样板代码。
 *
 * @param {import('vue').Ref<HTMLElement|null>} elRef 图表容器
 * @param {import('vue').Ref<object>|import('vue').ComputedRef<object>} optionRef 图表配置
 */
export function useChart(elRef, optionRef) {
  const chart = shallowRef(null)
  let observer = null

  function init() {
    if (!elRef.value || chart.value) return
    chart.value = echarts.init(elRef.value, 'employment', { renderer: 'canvas' })
    if (optionRef?.value) chart.value.setOption(optionRef.value, true)
  }

  function resize() {
    chart.value?.resize()
  }

  onMounted(() => {
    init()
    // 用 ResizeObserver 监听容器尺寸（适配侧边栏折叠、窗口缩放等场景）
    if (typeof ResizeObserver !== 'undefined' && elRef.value) {
      observer = new ResizeObserver(() => resize())
      observer.observe(elRef.value)
    } else {
      window.addEventListener('resize', resize)
    }
  })

  watch(
    () => elRef.value,
    (el) => {
      if (el) init()
    },
  )

  watch(
    optionRef,
    (option) => {
      if (chart.value && option) chart.value.setOption(option, true)
    },
    { deep: true },
  )

  onBeforeUnmount(() => {
    observer?.disconnect()
    window.removeEventListener('resize', resize)
    chart.value?.dispose()
    chart.value = null
  })

  return { chart, resize }
}
