import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 应用级 UI 状态
 * ------------------------------------------------------------------
 * 管理侧边栏折叠、移动端模式等，供布局组件与各页面消费。
 */
export const useAppStore = defineStore('app', () => {
  const collapsed = ref(false)
  const isMobile = ref(false)
  /** 全局刷新信号：自增后各页面监听并重新拉取数据 */
  const refreshKey = ref(0)

  function toggleCollapsed() {
    collapsed.value = !collapsed.value
  }

  function setCollapsed(value) {
    collapsed.value = value
  }

  function setMobile(value) {
    isMobile.value = value
    // 移动端默认折叠侧边栏
    if (value) collapsed.value = true
  }

  function triggerRefresh() {
    refreshKey.value += 1
  }

  return { collapsed, isMobile, refreshKey, toggleCollapsed, setCollapsed, setMobile, triggerRefresh }
})
