<template>
  <div class="source-note">
    <el-icon class="source-note__icon"><Link /></el-icon>
    <span class="source-note__label">数据来源</span>
    <template v-for="(item, index) in items" :key="item.id">
      <a
        v-if="item.url"
        class="source-note__link"
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
        :title="item.title"
      >{{ item.id }} {{ item.short }}</a>
      <span v-else class="source-note__text">{{ item.id }} {{ item.short }}</span>
      <span v-if="index < items.length - 1" class="source-note__sep">·</span>
    </template>
    <span v-if="note" class="source-note__tip">（{{ note }}）</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Link } from '@element-plus/icons-vue'
import { SOURCES } from '@/data/employmentData.js'

/**
 * 数据来源标注条
 * 所有分析页统一复用，确保每个图表区都能追溯到公开出处。
 */
const props = defineProps({
  /** 数据源编号，如 ['S1', 'S3'] */
  ids: { type: Array, default: () => [] },
  /** 补充口径说明 */
  note: { type: String, default: '' },
})

const SHORT = {
  S1: '2025 届广西高校毕业生就业质量报告',
  S2: '国家统计局 2025 年城镇单位平均工资',
  S3: '广西 2025 届毕业生就业行业分布',
  S4: '广西 2025 届毕业生国家战略地区流向',
  S5: '广西 2025 届毕业生留桂就业城市分布',
  S6: '麦可思 2025 届毕业生起薪调查',
}

const items = computed(() =>
  props.ids
    .map((id) => {
      const source = SOURCES.find((s) => s.id === id)
      return source ? { ...source, short: SHORT[id] || source.org } : null
    })
    .filter(Boolean),
)
</script>

<style scoped>
.source-note {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 9px 13px;
  font-size: 12px;
  line-height: 1.6;
  color: #6b7a99;
  background: #f8faff;
  border: 1px dashed #dfe6f5;
  border-radius: 10px;
}

.source-note__icon {
  color: var(--brand-primary);
  font-size: 13px;
}

.source-note__label {
  font-weight: 600;
  color: #4a5878;
}

.source-note__link {
  color: var(--brand-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
}

.source-note__link:hover {
  border-bottom-color: currentColor;
}

.source-note__sep {
  color: #c3cde2;
}

.source-note__tip {
  color: #8a97b1;
}
</style>
