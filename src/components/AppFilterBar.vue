<template>
  <div class="filter-bar" :class="{ 'filter-bar--stack': stack }">
    <div v-for="field in fields" :key="field.key" class="filter-bar__item">
      <span class="filter-bar__label">{{ field.label }}</span>
      <el-select
        v-model="filterStore.filters[field.key]"
        class="filter-bar__select"
        :style="{ width: stack ? '100%' : field.width }"
        size="default"
        @change="onChange(field.key)"
      >
        <el-option label="全部" value="all" />
        <el-option
          v-for="option in field.options()"
          :key="option.value ?? option"
          :label="option.label ?? option"
          :value="option.value ?? option"
        />
      </el-select>
    </div>

    <div class="filter-bar__actions">
      <el-badge :value="filterStore.activeCount" :hidden="!filterStore.activeCount" type="primary">
        <el-button :icon="RefreshLeft" @click="filterStore.reset()">重置</el-button>
      </el-badge>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RefreshLeft } from '@element-plus/icons-vue'
import { useFilterStore } from '@/store/filter'

defineProps({
  /** 移动端抽屉中使用的纵向布局 */
  stack: { type: Boolean, default: false },
})

const filterStore = useFilterStore()

const fields = computed(() => [
  {
    key: 'year',
    label: '毕业年份',
    width: '130px',
    options: () => filterStore.options.years.map((year) => ({ label: `${year} 届`, value: year })),
  },
  {
    key: 'college',
    label: '学院',
    width: '150px',
    options: () => filterStore.options.colleges,
  },
  {
    key: 'degree',
    label: '学历',
    width: '110px',
    options: () => filterStore.options.degrees,
  },
  {
    key: 'major',
    label: '专业',
    width: '165px',
    options: () => filterStore.availableMajors,
  },
  {
    key: 'province',
    label: '就业省份',
    width: '130px',
    options: () => filterStore.options.provinces,
  },
])

function onChange(key) {
  if (key === 'college') filterStore.syncMajorScope()
}
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-bar__item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-bar__label {
  font-size: 13px;
  color: #6b7a99;
  white-space: nowrap;
}

.filter-bar--stack {
  flex-direction: column;
  align-items: stretch;
}

.filter-bar--stack .filter-bar__item {
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  width: 100%;
}

.filter-bar__actions {
  margin-left: auto;
}

.filter-bar--stack .filter-bar__actions {
  margin: 4px 0 0;
}

.filter-bar--stack .filter-bar__actions :deep(.el-badge) {
  width: 100%;
}

.filter-bar--stack .filter-bar__actions :deep(.el-button) {
  width: 100%;
}
</style>
