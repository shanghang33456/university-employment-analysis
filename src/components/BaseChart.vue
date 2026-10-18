<template>
  <div ref="elRef" class="base-chart" :style="{ height }"></div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useChart } from '@/composables/useChart'

/**
 * 图表基础组件
 * 传入 ECharts option 即可自动完成初始化、响应式缩放与销毁。
 */
const props = defineProps({
  option: { type: Object, required: true },
  height: { type: String, default: '320px' },
})

const elRef = ref(null)
useChart(
  elRef,
  computed(() => props.option),
)
</script>

<style scoped>
.base-chart {
  width: 100%;
}
</style>
