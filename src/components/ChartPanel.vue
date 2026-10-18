<template>
  <section class="chart-panel" :class="{ 'chart-panel--flat': flat }">
    <header class="chart-panel__head">
      <div class="chart-panel__title">
        <span class="chart-panel__bar" aria-hidden="true"></span>
        <span>{{ title }}</span>
        <el-tooltip v-if="hint" :content="hint" placement="top">
          <el-icon class="chart-panel__hint"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>
      <div class="chart-panel__extra">
        <slot name="extra" />
      </div>
    </header>
    <div v-loading="loading" class="chart-panel__body" :style="{ minHeight: bodyHeight }">
      <slot />
    </div>
  </section>
</template>

<script setup>
import { QuestionFilled } from '@element-plus/icons-vue'

defineProps({
  title: { type: String, required: true },
  hint: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  bodyHeight: { type: String, default: 'auto' },
  flat: { type: Boolean, default: false },
})
</script>

<style scoped>
.chart-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 18px 18px;
  background: #fff;
  border: 1px solid #eef1f7;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(31, 56, 110, 0.05);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.chart-panel:hover {
  box-shadow: 0 8px 24px rgba(31, 56, 110, 0.09);
}

.chart-panel--flat {
  box-shadow: none;
  border-color: #f0f2f7;
}

.chart-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.chart-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2d4d;
}

.chart-panel__bar {
  width: 4px;
  height: 14px;
  border-radius: 3px;
  background: linear-gradient(180deg, #4f7cff, #22c1a4);
}

.chart-panel__hint {
  color: #9aa7bd;
  cursor: help;
  font-size: 14px;
}

.chart-panel__extra {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-panel__body {
  flex: 1;
  min-width: 0;
}
</style>
