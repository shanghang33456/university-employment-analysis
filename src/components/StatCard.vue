<template>
  <div class="stat-card" :style="{ '--accent': color, '--accent-soft': softColor }">
    <div class="stat-card__icon">
      <el-icon :size="22"><component :is="icon" /></el-icon>
    </div>
    <div class="stat-card__main">
      <p class="stat-card__label">{{ label }}</p>
      <p class="stat-card__value">
        <span class="stat-card__num">{{ formatted }}</span>
        <span v-if="suffix" class="stat-card__suffix">{{ suffix }}</span>
      </p>
      <p v-if="foot || $slots.foot" class="stat-card__foot">
        <slot name="foot">{{ foot }}</slot>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { formatNumber } from '@/utils/format'

/**
 * 指标卡
 * 支持数字滚动动画，用于总览核心 KPI 展示。
 */
const props = defineProps({
  label: { type: String, required: true },
  value: { type: Number, default: 0 },
  suffix: { type: String, default: '' },
  icon: { type: [Object, Function], required: true },
  color: { type: String, default: '#4f7cff' },
  digits: { type: Number, default: 0 },
  foot: { type: String, default: '' },
})

const current = ref(0)
let rafId = null

const softColor = computed(() => `${props.color}1f`)
const formatted = computed(() => formatNumber(current.value, props.digits))

function animate(to) {
  cancelAnimationFrame(rafId)
  const from = current.value
  if (from === to) return
  const duration = 650
  const startTime = performance.now()

  const step = (now) => {
    const progress = Math.min(1, (now - startTime) / duration)
    const eased = 1 - Math.pow(1 - progress, 3)
    current.value = from + (to - from) * eased
    if (progress < 1) {
      rafId = requestAnimationFrame(step)
    } else {
      current.value = to
    }
  }
  rafId = requestAnimationFrame(step)
}

watch(() => props.value, (value) => animate(Number(value) || 0), { immediate: true })
</script>

<style scoped>
.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: #fff;
  border: 1px solid #eef1f7;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(31, 56, 110, 0.05);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.stat-card::after {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: var(--accent);
  opacity: 0.9;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(31, 56, 110, 0.12);
}

.stat-card__icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 12px;
  color: var(--accent);
  background: var(--accent-soft);
}

.stat-card__main {
  min-width: 0;
  flex: 1;
}

.stat-card__label {
  margin: 0;
  font-size: 13px;
  color: #6b7a99;
}

.stat-card__value {
  margin: 4px 0 0;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-card__num {
  font-size: 26px;
  font-weight: 700;
  color: #1f2d4d;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.stat-card__suffix {
  font-size: 13px;
  font-weight: 500;
  color: #8a97b1;
}

.stat-card__foot {
  margin: 6px 0 0;
  font-size: 12px;
  color: #8a97b1;
}
</style>
